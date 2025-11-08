import nodemailer from "nodemailer";
import { EmailDeliveryError } from "../errors/EmailDeliveryError";
import { EmailMetadata } from "../types/context";
import { logError, logInfo, serializeError } from "../utils/logger";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter using environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send registration OTP email
   */
  async sendRegistrationOTP(
    email: string,
    code: string,
    name?: string,
    metadata: EmailMetadata = {}
  ): Promise<void> {
    const greeting = name ? `Hi ${name}` : "Hi there";
    const enrichedMetadata: EmailMetadata = {
      ...metadata,
      context: metadata.context || "registration_otp",
      recipient: email,
    };

    const mailOptions = {
      from: `"IntelliBrief" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to IntelliBrief - Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to IntelliBrief!</h2>
          <p>${greeting},</p>
          <p>Thank you for signing up! To complete your registration, please use the following verification code:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #333; letter-spacing: 8px; margin: 0;">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">IntelliBrief - Your personalized daily briefing</p>
        </div>
      `,
      text: `
Welcome to IntelliBrief!

${greeting},

Thank you for signing up! To complete your registration, please use the following verification code:

${code}

This code will expire in 10 minutes.

If you didn't request this code, you can safely ignore this email.

IntelliBrief - Your personalized daily briefing
      `,
    };

    await this.sendEmail(mailOptions, enrichedMetadata);
  }

  /**
   * Send login OTP email
   */
  async sendLoginOTP(
    email: string,
    code: string,
    metadata: EmailMetadata = {}
  ): Promise<void> {
    const enrichedMetadata: EmailMetadata = {
      ...metadata,
      context: metadata.context || "login_otp",
      recipient: email,
    };

    const mailOptions = {
      from: `"IntelliBrief" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "IntelliBrief - Login Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Login to IntelliBrief</h2>
          <p>Hi,</p>
          <p>You're attempting to log in to your IntelliBrief account. Please use the following verification code:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #333; letter-spacing: 8px; margin: 0;">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p>If you didn't attempt to log in, please secure your account immediately.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">IntelliBrief - Your personalized daily briefing</p>
        </div>
      `,
      text: `
Login to IntelliBrief

Hi,

You're attempting to log in to your IntelliBrief account. Please use the following verification code:

${code}

This code will expire in 10 minutes.

If you didn't attempt to log in, please secure your account immediately.

IntelliBrief - Your personalized daily briefing
      `,
    };

    await this.sendEmail(mailOptions, enrichedMetadata);
  }

  /**
   * Send password reset OTP email
   */
  async sendPasswordResetOTP(
    email: string,
    code: string,
    metadata: EmailMetadata = {}
  ): Promise<void> {
    const enrichedMetadata: EmailMetadata = {
      ...metadata,
      context: metadata.context || "password_reset",
      recipient: email,
    };

    const mailOptions = {
      from: `"IntelliBrief" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "IntelliBrief - Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>Hi,</p>
          <p>You requested to reset your password. Please use the following verification code to proceed:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #333; letter-spacing: 8px; margin: 0;">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email and ensure your account is secure.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">IntelliBrief - Your personalized daily briefing</p>
        </div>
      `,
      text: `
Reset Your Password

Hi,

You requested to reset your password. Please use the following verification code to proceed:

${code}

This code will expire in 10 minutes.

If you didn't request a password reset, please ignore this email and ensure your account is secure.

IntelliBrief - Your personalized daily briefing
      `,
    };

    await this.sendEmail(mailOptions, enrichedMetadata);
  }

  /**
   * Send email with error handling
   */
  private async sendEmail(
    mailOptions: nodemailer.SendMailOptions,
    metadata: EmailMetadata = {}
  ): Promise<void> {
    const logMetadata = {
      ...metadata,
      subject: mailOptions.subject,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logInfo("email.sent", {
        ...logMetadata,
        messageId: info.messageId,
      });
    } catch (error) {
      logError("email.failed", {
        ...logMetadata,
        error: serializeError(error),
      });
      // Also log to console as fallback
      console.log("\n⚠️ EMAIL FALLBACK - OTP CODE:");
      console.log(`📧 To: ${mailOptions.to}`);
      console.log(`📝 Subject: ${mailOptions.subject}`);
      console.log("---\n");

      // Re-throw error so the calling code knows email failed
      throw new EmailDeliveryError(
        "Failed to send email. Please check your email configuration.",
        logMetadata,
        error
      );
    }
  }
}
