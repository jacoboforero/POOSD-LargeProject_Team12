import { UserModel } from "../models/User.model";

export class UserService {
  async getUser(userId: string) {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return {
      _id: String(user._id),
      email: user.email,
      emailVerified: user.emailVerified,
      preferences: user.preferences,
      limits: user.limits,
      timezone: user.timezone,
      notificationPrefs: user.notificationPrefs,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updatePreferences(userId: string, preferences: any) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          preferences,
          updatedAt: new Date()
        } 
      },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return this.getUser(userId);
  }

  async getUsage(userId: string) {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (new Date() >= user.limits.resetAt) {
      user.limits.generatedCountToday = 0;
      user.limits.resetAt = this.getNextResetTime();
      await user.save();
    }

    const dailyCap = user.limits.dailyGenerateCap;
    const used = user.limits.generatedCountToday;

    return {
      dailyGenerateCap: dailyCap,
      generatedCountToday: used,
      remaining: Math.max(0, dailyCap - used),
      resetAt: user.limits.resetAt.toISOString(),
    };
  }

  private getNextResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
}