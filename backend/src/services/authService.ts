import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { OtpRequest, Session } from "../../../packages/contracts/src";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export class AuthService {
  async requestOtp(request: OtpRequest): Promise<void> {
    const { email } = request;

    // Create or get user
    let user = storage.getUserByEmail(email);
    if (!user) {
      user = storage.createUser({ email });
    }

    // Create OTP request
    const { code } = storage.createOtpRequest(email);

    // Stub: Log OTP instead of sending email
    console.log(`OTP for ${email}: ${code}`);

    // In a real implementation, you would send an email here
    // await emailService.sendOtp(email, code);
  }

  async verifyOtp(email: string, code: string): Promise<Session> {
    // Verify OTP
    const isValid = storage.verifyOtpRequest(email, code);
    if (!isValid) {
      throw new Error("Invalid or expired OTP");
    }

    // Get or create user
    let user = storage.getUserByEmail(email);
    if (!user) {
      user = storage.createUser({ email });
    }

    // Mark email as verified
    user = storage.updateUser(user._id, { emailVerified: true });
    if (!user) {
      throw new Error("Failed to update user");
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Create session
    const session = storage.createSession(user, token);
    return session;
  }

  async validateToken(token: string): Promise<Session | null> {
    try {
      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Get session from storage
      const session = storage.getSession(token);
      if (!session) {
        return null;
      }

      return session;
    } catch (error) {
      return null;
    }
  }

  async logout(token: string): Promise<void> {
    storage.deleteSession(token);
  }
}

export const authService = new AuthService();
