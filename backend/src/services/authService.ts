import bcrypt from 'bcrypt';
import { UserModel } from "../models/User.model";
import { generateToken } from "../utils/jwt";

export class AuthService {
  async requestOtp(request: { email: string }): Promise<void> {
    const { email } = request;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let user = await UserModel.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      user = await UserModel.create({
        email: email.toLowerCase(),
        emailVerified: false,
        preferences: { topics: [], interests: [] },
        limits: {
          dailyGenerateCap: 3,
          generatedCountToday: 0,
          resetAt: this.getNextResetTime(),
        },
        notificationPrefs: {
          onBriefingReady: true,
        },
        pushTokens: [],
      });
    }

    user.otp = {
      hash: hashedCode,
      expiresAt,
      attempts: 0,
      lastRequestedAt: new Date(),
    };
    await user.save();

    console.log(`📧 OTP for ${email}: ${code}`);
    console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);
  }

  async verifyOtp(email: string, code: string) {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    
    if (!user || !user.otp) {
      throw new Error('No OTP request found for this email');
    }

    if (new Date() > user.otp.expiresAt) {
      throw new Error('OTP has expired');
    }

    if (user.otp.attempts >= 5) {
      throw new Error('Too many failed attempts');
    }

    const isValid = await bcrypt.compare(code, user.otp.hash);
    
    if (!isValid) {
      user.otp.attempts += 1;
      await user.save();
      throw new Error('Invalid OTP code');
    }

    user.otp = undefined;
    user.emailVerified = true;
    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken({
      userId: String(user._id),
      email: user.email,
    });

    return {
      token,
      user: {
        _id: String(user._id),
        email: user.email,
        emailVerified: user.emailVerified,
        preferences: user.preferences,
        timezone: user.timezone,
        notificationPrefs: user.notificationPrefs,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  private getNextResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
}