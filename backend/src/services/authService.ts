import bcrypt from "bcrypt";
import { UserModel } from "../models/User.model";
import { generateToken } from "../utils/jwt";
import { EmailService } from "./emailService";

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }
  /**
   * Register a new user account
   * Throws error if user already exists
   */
  async register(
    email: string,
    preferences?: {
      topics?: string[];
      interests?: string[];
      jobIndustry?: string;
      demographic?: string;
      location?: string;
      lifeStage?: string;
      newsStyle?: string;
      newsScope?: string;
      preferredHeadlines?: string[];
      scrollPastTopics?: string[];
    },
    name?: string,
    password?: string
  ): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new Error("User already exists. Please use login instead.");
    }

    // Hash password if provided
    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Generate OTP
    const code = this.generateOtpCode();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create new user with preferences
    const user = await UserModel.create({
      name: name?.trim(),
      email: normalizedEmail,
      passwordHash,
      emailVerified: false,
      preferences: {
        topics: preferences?.topics || [],
        interests: preferences?.interests || [],
        jobIndustry: preferences?.jobIndustry,
        demographic: preferences?.demographic,
        location: preferences?.location,
        lifeStage: preferences?.lifeStage,
        newsStyle: preferences?.newsStyle,
        newsScope: preferences?.newsScope,
        preferredHeadlines: preferences?.preferredHeadlines || [],
        scrollPastTopics: preferences?.scrollPastTopics || [],
      },
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

    // Send registration OTP email
    await this.emailService.sendRegistrationOTP(normalizedEmail, code, name);

    console.log(`\n🆕 NEW USER REGISTRATION`);
    if (name) {
      console.log(`👤 Name: ${name}`);
    }
    console.log(`📧 Email: ${normalizedEmail}`);
    console.log(`✉️  OTP sent via email`);
    console.log(`📋 Preferences:`);
    console.log(`   Topics: ${user.preferences.topics.join(", ") || "None"}`);
    console.log(`   Interests: ${user.preferences.interests.join(", ") || "None"}`);
    if (user.preferences.jobIndustry) {
      console.log(`   Job Industry: ${user.preferences.jobIndustry}`);
    }
    if (user.preferences.demographic) {
      console.log(`   Demographic: ${user.preferences.demographic}`);
    }
    if (user.preferences.location) {
      console.log(`   Location: ${user.preferences.location}`);
    }
    if (user.preferences.lifeStage) {
      console.log(`   Life Stage: ${user.preferences.lifeStage}`);
    }
    if (user.preferences.newsStyle) {
      console.log(`   News Style: ${user.preferences.newsStyle}`);
    }
    if (user.preferences.newsScope) {
      console.log(`   News Scope: ${user.preferences.newsScope}`);
    }
    if (user.preferences.preferredHeadlines?.length) {
      console.log(`   Preferred Headlines: ${user.preferences.preferredHeadlines.join(", ")}`);
    }
    if (user.preferences.scrollPastTopics?.length) {
      console.log(`   Scroll Past Topics: ${user.preferences.scrollPastTopics.join(", ")}`);
    }
    console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);
    console.log(`---\n`);
  }

  /**
   * Check if user exists (for UI to decide whether to show password field)
   * Returns true if user exists, false otherwise
   */
  async checkUserExists(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });
    return !!user;
  }

  /**
   * Login existing user with password
   * Verifies password and sends OTP for additional security
   * Throws error if user doesn't exist or password is incorrect
   */
  async loginWithPassword(email: string, password: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error("User not found. Please register first.");
    }

    // Check if user has a password
    if (!user.passwordHash) {
      throw new Error("No password set for this account.");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid password.");
    }

    // Password verified - now generate and send OTP
    const code = this.generateOtpCode();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with OTP
    user.otp = {
      hash: hashedCode,
      expiresAt,
      attempts: 0,
      lastRequestedAt: new Date(),
    };
    await user.save();

    // Send login OTP email
    await this.emailService.sendLoginOTP(normalizedEmail, code);

    console.log(`\n🔐 USER LOGIN WITH PASSWORD`);
    console.log(`📧 Email: ${normalizedEmail}`);
    console.log(`✅ Password verified`);
    console.log(`✉️  OTP sent via email`);
    console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);
    console.log(`---\n`);
  }

  /**
   * Login existing user (legacy OTP method)
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

    // Send login OTP email
    await this.emailService.sendLoginOTP(normalizedEmail, code);

    console.log(`\n🔐 USER LOGIN`);
    console.log(`📧 Email: ${normalizedEmail}`);
    console.log(`✉️  OTP sent via email`);
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
        name: user.name,
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

  /**
   * Request password reset
   * Sends OTP to user's email for password reset verification
   */
  async requestPasswordReset(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error("User not found. Please register first.");
    }

    // Check if user has a password
    if (!user.passwordHash) {
      throw new Error("No password set for this account. Please contact support.");
    }

    // Generate OTP for password reset
    const code = this.generateOtpCode();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with password reset OTP
    user.otp = {
      hash: hashedCode,
      expiresAt,
      attempts: 0,
      lastRequestedAt: new Date(),
    };
    await user.save();

    // Send password reset OTP email
    await this.emailService.sendPasswordResetOTP(normalizedEmail, code);

    console.log(`\n🔐 PASSWORD RESET REQUEST`);
    console.log(`📧 Email: ${normalizedEmail}`);
    console.log(`✉️  Reset code sent via email`);
    console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);
    console.log(`---\n`);
  }

  /**
   * Verify password reset code
   * Validates the OTP code for password reset
   */
  async verifyPasswordResetCode(email: string, code: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user || !user.otp) {
      throw new Error("No password reset request found for this email");
    }

    if (new Date() > user.otp.expiresAt) {
      throw new Error("Reset code has expired");
    }

    if (user.otp.attempts >= 5) {
      throw new Error("Too many failed attempts");
    }

    const isValid = await bcrypt.compare(code, user.otp.hash);

    if (!isValid) {
      user.otp.attempts += 1;
      await user.save();
      throw new Error("Invalid reset code");
    }

    // Don't clear OTP yet - we need it for the actual password reset
    console.log(`\n✅ PASSWORD RESET CODE VERIFIED`);
    console.log(`📧 Email: ${normalizedEmail}`);
    console.log(`---\n`);
  }

  /**
   * Reset password
   * Updates user's password after verifying the reset code
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    // Verify the code again for security
    await this.verifyPasswordResetCode(normalizedEmail, code);

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error("User not found");
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    user.passwordHash = passwordHash;
    user.otp = undefined;
    await user.save();

    console.log(`\n🔒 PASSWORD RESET SUCCESSFUL`);
    console.log(`📧 Email: ${normalizedEmail}`);
    console.log(`---\n`);
  }

  private getNextResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
}
