import { UserModel, IUser } from "../models/User.model";
import { BriefingModel, IBriefing } from "../models/Briefing.model";

/**
 * Result type for the quota operation.
 */
export interface TryConsumeResult {
  ok: boolean;
  resetAt?: Date;
}

/**
 * Atomically increments the user's daily generate count
 * if below the cap. Otherwise, returns { ok: false, resetAt }.
 */
export async function tryConsumeDailyGenerate(userId: string): Promise<TryConsumeResult> {
  const now = new Date();

  // Step 1: Load the user
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  // Step 2: Reset quota if the window has expired
  if (user.limits.resetAt < now) {
    user.limits.generatedCountToday = 0;
    user.limits.resetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h
    await user.save();
  }

  // Step 3: Try atomic increment if below daily cap
  const result = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      "limits.generatedCountToday": { $lt: user.limits.dailyGenerateCap },
    },
    {
      $inc: { "limits.generatedCountToday": 1 },
      $set: { updatedAt: now },
    },
    { new: true }
  );

  if (!result) {
    return { ok: false, resetAt: user.limits.resetAt };
  }

  return { ok: true };
}

/**
 * Atomically claims one queued briefing and marks it as fetching.
 * Returns the claimed briefing or null if none were available.
 */
export async function claimQueuedBriefing(): Promise<IBriefing | null> {
  const now = new Date();

  const briefing = await BriefingModel.findOneAndUpdate(
    { status: "queued" },
    {
      $set: {
        status: "fetching",
        fetchStartedAt: now,
        updatedAt: now,
        leaseUntil: new Date(now.getTime() + 5 * 60 * 1000), // 5 min lease
      },
    },
    {
      new: true,
      sort: { createdAt: 1 }, 
    }
  );

  return briefing;
}
