import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { calculateCommuteImpact, SimulatorInput } from '../../utils/emissionsCalculator';
import { ActivityLog } from '../../models/ActivityLog';
import { DailyPlan } from '../../models/DailyPlan';
import { CommunityReport } from '../../models/CommunityReport';
import mongoose from 'mongoose';

export class InsightsController {
  /**
   * POST /api/insights/simulator
   * Transparent What-If Scenario Calculation
   */
  static async simulateImpact(req: AuthRequest, res: Response) {
    try {
      const { currentMode, targetMode, dailyRoundTripKm, commuteDaysPerWeek } = req.body;

      if (!currentMode || !targetMode || !dailyRoundTripKm) {
        res.status(400).json({ error: 'currentMode, targetMode, and dailyRoundTripKm are required.' });
        return;
      }

      const input: SimulatorInput = {
        currentMode,
        targetMode,
        dailyRoundTripKm: parseFloat(dailyRoundTripKm),
        commuteDaysPerWeek: parseFloat(commuteDaysPerWeek) || 5,
      };

      const result = calculateCommuteImpact(input);
      res.status(200).json({ input, result });
    } catch (err: any) {
      res.status(500).json({ error: 'Simulation calculation error: ' + err.message });
    }
  }

  /**
   * POST /api/insights/log-action
   * Logs a completed environmental protection action
   */
  static async logAction(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { actionType, title, description, metrics, details } = req.body;
      const userId = new mongoose.Types.ObjectId(req.user.userId);

      const log = await ActivityLog.create({
        userId,
        actionType,
        title,
        description,
        metrics: metrics || {},
        details: details || {},
        loggedAt: new Date(),
      });

      res.status(201).json({ log });
    } catch (err: any) {
      res.status(400).json({ error: 'Failed to log action: ' + err.message });
    }
  }

  /**
   * GET /api/insights/summary
   * Aggregates personal impact metrics across daily plans, logged actions, and community reports
   */
  static async getSummary(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userId = new mongoose.Types.ObjectId(req.user.userId);

      // 1. Fetch completed tasks from all daily plans
      const dailyPlans = await DailyPlan.find({ userId });
      let totalTasks = 0;
      let completedTasks = 0;

      for (const p of dailyPlans) {
        for (const r of p.recommendations) {
          totalTasks++;
          if (r.completed) completedTasks++;
        }
      }

      // 2. Fetch logged actions
      const logs = await ActivityLog.find({ userId }).sort({ loggedAt: -1 }).limit(20);
      const totalCo2Saved = logs.reduce((sum, l) => sum + (l.metrics?.co2SavedKg || 0), 0);
      const totalExposureHoursAvoided = logs.reduce((sum, l) => sum + (l.metrics?.exposureHoursAvoided || 0), 0);

      // 3. Fetch user submitted community reports count
      const communityReportsCount = await CommunityReport.countDocuments({ userId });

      res.status(200).json({
        stats: {
          completedProtectiveActions: completedTasks,
          totalRecommendationsReceived: totalTasks,
          adherenceRatePercent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          totalCo2SavedKg: Math.round(totalCo2Saved * 10) / 10,
          totalExposureHoursAvoided: Math.round(totalExposureHoursAvoided * 10) / 10,
          communityReportsSubmitted: communityReportsCount,
        },
        recentActivities: logs,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to aggregate insights summary: ' + err.message });
    }
  }
}
