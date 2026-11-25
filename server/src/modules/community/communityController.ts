import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { CommunityReport, ReportCategory, ReportStatus } from '../../models/CommunityReport';
import mongoose from 'mongoose';

export class CommunityController {
  /**
   * GET /api/community/reports?city=...&category=...&status=...
   */
  static async getReports(req: AuthRequest, res: Response) {
    try {
      const city = req.query.city as string;
      const category = req.query.category as ReportCategory;
      const status = (req.query.status as ReportStatus) || 'approved';

      const filter: any = {};
      if (status) filter.status = status;
      if (city && city !== 'All') filter['location.city'] = new RegExp(city, 'i');
      if (category && category !== ('all' as any)) filter.category = category;

      const reports = await CommunityReport.find(filter)
        .sort({ createdAt: -1 })
        .limit(50);

      res.status(200).json({ reports });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch community reports: ' + err.message });
    }
  }

  /**
   * POST /api/community/reports
   */
  static async createReport(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required to submit observations.' });
        return;
      }

      const {
        title,
        description,
        category,
        severity,
        city,
        neighborhood,
        latitude,
        longitude,
        evidenceImageUrl,
      } = req.body;

      if (!title || !description || !category || !city) {
        res.status(400).json({ error: 'Title, description, category, and city are required.' });
        return;
      }

      const report = await CommunityReport.create({
        userId: new mongoose.Types.ObjectId(req.user.userId),
        userName: req.user.email.split('@')[0],
        title,
        description,
        category,
        severity: severity || 'moderate',
        location: {
          city,
          neighborhood: neighborhood || city,
          latitude: latitude || 28.6139,
          longitude: longitude || 77.2090,
        },
        evidenceImageUrl,
        status: 'approved', // MVP automatic approval for instant verification
        upvotes: 1,
        upvotedBy: [new mongoose.Types.ObjectId(req.user.userId)],
      });

      res.status(201).json({ report });
    } catch (err: any) {
      res.status(400).json({ error: 'Failed to create report: ' + err.message });
    }
  }

  /**
   * POST /api/community/reports/:id/upvote
   */
  static async upvoteReport(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }

      const reportId = req.params.id;
      const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

      const report = await CommunityReport.findById(reportId);
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      const alreadyUpvoted = report.upvotedBy.some((uid) => uid.equals(userObjectId));
      if (alreadyUpvoted) {
        // Remove upvote
        report.upvotes = Math.max(1, report.upvotes - 1);
        report.upvotedBy = report.upvotedBy.filter((uid) => !uid.equals(userObjectId));
      } else {
        // Add upvote
        report.upvotes += 1;
        report.upvotedBy.push(userObjectId);
      }

      await report.save();
      res.status(200).json({ report });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to toggle upvote: ' + err.message });
    }
  }
}
