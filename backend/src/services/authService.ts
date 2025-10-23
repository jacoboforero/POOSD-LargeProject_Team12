import bcrypt from "bcrypt";
import { UserModel } from "../models/User.model";
import { generateToken } from "../utils/jwt";

export class AuthService {
  /**
   * Register a new user account
   * Throws error if user already exists
   */
  async register(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new Error("User already exists. Please use login instead.");
    }

    // Generate OTP
    const code = this.generateOtpCode();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create new user
    const user = await UserModel.create({
      email: normalizedEmail,
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
      otp: {
        hash: hashedCode,
        expiresAt,
        attempts: 0,
        lastRequestedAt: new Date(),
      },
    });

    console.log(`\n🆕 NEW USER REGISTRATION`);
    console.log(`📧 Email: ${normalizedEmail}`);
    console.log(`🔑 OTP Code: ${code}`);
    console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);
    console.log(`---\n`);
  }

  /**
   * Login existing user
   * Throws error if user doesn't exist
   */
  async login(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error("User not found. Please register first.");
    }

    // Generate OTP
    const code = this.generateOtpCode();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with new OTP
    user.otp = {
      hash: hashedCode,
      expiresAt,
      attempts: 0,
      lastRequestedAt: new Date(),
    };
    await user.save();

    console.log(`\n🔐 USER LOGIN`);
    console.log(`📧 Email: ${normalizedEmail}`);
    console.log(`🔑 OTP Code: ${code}`);
    console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);
    console.log(`---\n`);
  }

  /**
   * Legacy method for backwards compatibility
   * Handles both register and login (auto-detects)
   */
  async requestOtp(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (user) {
      await this.login(normalizedEmail);
    } else {
      await this.register(normalizedEmail);
    }
  }

  /**
   * Generate a 6-digit OTP code
   */
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async verifyOtp(email: string, code: string) {
    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user || !user.otp) {
      throw new Error("No OTP request found for this email");
    }

    if (new Date() > user.otp.expiresAt) {
      throw new Error("OTP has expired");
    }

    if (user.otp.attempts >= 5) {
      throw new Error("Too many failed attempts");
    }

    const isValid = await bcrypt.compare(code, user.otp.hash);

    if (!isValid) {
      user.otp.attempts += 1;
      await user.save();
      throw new Error("Invalid OTP code");
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
