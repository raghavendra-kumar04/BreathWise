import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../../models/User';
import { UserPreferences, IUserPreferences } from '../../models/UserPreferences';
import { config } from '../../config/env';

export class AuthService {
  static async register(data: {
    name: string;
    email: string;
    password: string;
    location?: { city: string; state?: string; latitude: number; longitude: number };
  }) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      location: data.location,
    });

    // Create default preferences
    const preferences = await UserPreferences.create({
      userId: user._id,
      lifestyle: {
        commuteMode: 'metro-bus',
        outdoorActivity: 'light-walk',
        cookingFuel: 'lpg',
        dailyRoutine: {
          wakeUpTime: '07:00',
          commuteStart: '09:00',
          commuteEnd: '18:00',
        },
      },
      budget: 'moderate',
      interests: ['health', 'exercise', 'home-air'],
      notificationEnabled: true,
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
      preferences,
    };
  }

  static async login(data: { email: string; password: string }) {
    const user = await User.findOne({ email: data.email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const preferences = await UserPreferences.findOne({ userId: user._id });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
      preferences,
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const preferences = await UserPreferences.findOne({ userId });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
      preferences,
    };
  }

  static async updateLocation(
    userId: string,
    location: { city: string; state?: string; latitude: number; longitude: number }
  ) {
    const user = await User.findByIdAndUpdate(
      userId,
      { location },
      { new: true }
    );
    return user?.location;
  }

  static async updatePreferences(
    userId: string,
    updates: Partial<IUserPreferences>
  ) {
    const prefs = await UserPreferences.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );
    return prefs;
  }
}
