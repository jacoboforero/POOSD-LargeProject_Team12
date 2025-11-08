import { UserModel } from "../models/User.model";
import { ProfileUpdate } from "../../../packages/contracts/src";

export class UserService {
  async getUser(userId: string) {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return {
      _id: String(user._id),
      name: user.name,
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

  async updateProfile(userId: string, updates: ProfileUpdate) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (updates.name !== undefined) {
      user.name = updates.name?.trim() || undefined;
    }

    if (updates.timezone !== undefined) {
      user.timezone = updates.timezone?.trim() || undefined;
    }

    if (updates.notificationPrefs?.onBriefingReady !== undefined) {
      user.notificationPrefs = {
        ...user.notificationPrefs,
        onBriefingReady: updates.notificationPrefs.onBriefingReady,
      };
    }

    if (updates.preferences) {
      const prefs = updates.preferences;
      if (prefs.topics !== undefined) {
        user.preferences.topics = this.normalizeStringArray(prefs.topics);
      }
      if (prefs.interests !== undefined) {
        user.preferences.interests = this.normalizeStringArray(prefs.interests);
      }
      if (prefs.preferredHeadlines !== undefined) {
        user.preferences.preferredHeadlines = this.normalizeStringArray(prefs.preferredHeadlines);
      }
      if (prefs.scrollPastTopics !== undefined) {
        user.preferences.scrollPastTopics = this.normalizeStringArray(prefs.scrollPastTopics);
      }
      if (prefs.jobIndustry !== undefined) {
        user.preferences.jobIndustry = prefs.jobIndustry?.trim() || undefined;
      }
      if (prefs.demographic !== undefined) {
        user.preferences.demographic = prefs.demographic?.trim() || undefined;
      }
      if (prefs.location !== undefined) {
        user.preferences.location = prefs.location?.trim() || undefined;
      }
      if (prefs.lifeStage !== undefined) {
        user.preferences.lifeStage = prefs.lifeStage?.trim() || undefined;
      }
      if (prefs.newsStyle !== undefined) {
        user.preferences.newsStyle = prefs.newsStyle?.trim() || undefined;
      }
      if (prefs.newsScope !== undefined) {
        user.preferences.newsScope = prefs.newsScope?.trim() || undefined;
      }
    }

    await user.save();

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

  private normalizeStringArray(values: string[] | undefined): string[] {
    if (!values) {
      return [];
    }

    return values
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value && value.length > 0));
  }
}
