import { Response } from 'express';
import { AuthService } from './authService';
import { AuthRequest } from '../../middleware/auth';

export class AuthController {
  static async register(req: AuthRequest, res: Response) {
    try {
      const { name, email, password, location } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required.' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        return;
      }

      const result = await AuthService.register({ name, email, password, location });
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to register account.' });
    }
  }

  static async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      const result = await AuthService.login({ email, password });
      res.status(200).json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Invalid credentials.' });
    }
  }

  static async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const result = await AuthService.getCurrentUser(req.user.userId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(404).json({ error: err.message || 'User not found.' });
    }
  }

  static async updateLocation(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const { city, state, latitude, longitude } = req.body;
      if (!city || latitude === undefined || longitude === undefined) {
        res.status(400).json({ error: 'City, latitude, and longitude are required.' });
        return;
      }

      const location = await AuthService.updateLocation(req.user.userId, {
        city,
        state,
        latitude,
        longitude,
      });

      res.status(200).json({ location });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update location.' });
    }
  }

  static async updatePreferences(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const preferences = await AuthService.updatePreferences(
        req.user.userId,
        req.body
      );

      res.status(200).json({ preferences });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update preferences.' });
    }
  }
}
