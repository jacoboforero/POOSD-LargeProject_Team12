import { v4 as uuidv4 } from "uuid";
import {
  User,
  Briefing,
  Session,
  OtpRequest,
  BriefingGenerateRequest,
} from "../../../packages/contracts/src";

// In-memory storage for development
class InMemoryStorage {
  private users: Map<string, User> = new Map();
  private briefings: Map<string, Briefing> = new Map();
  private sessions: Map<string, Session> = new Map();
  private otpRequests: Map<
    string,
    { email: string; code: string; expiresAt: Date }
  > = new Map();

  // User operations
  createUser(userData: Partial<User>): User {
    const user: User = {
      _id: uuidv4(),
      email: userData.email!,
      emailVerified: false,
      preferences: userData.preferences || {
        topics: [],
        interests: [],
        jobIndustry: "",
        demographic: "",
      },
      timezone: userData.timezone || "UTC",
      notificationPrefs: userData.notificationPrefs || {
        email: true,
        push: false,
        frequency: "daily",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user._id, user);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Session operations
  createSession(user: User, token: string): Session {
    const session: Session = {
      token,
      user: {
        _id: user._id,
        email: user.email,
        emailVerified: user.emailVerified,
        preferences: user.preferences,
        timezone: user.timezone,
        notificationPrefs: user.notificationPrefs,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    this.sessions.set(token, session);
    return session;
  }

  getSession(token: string): Session | undefined {
    return this.sessions.get(token);
  }

  deleteSession(token: string): boolean {
    return this.sessions.delete(token);
  }

  // OTP operations
  createOtpRequest(email: string): { code: string; expiresAt: Date } {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    this.otpRequests.set(email, { email, code, expiresAt });
    return { code, expiresAt };
  }

  verifyOtpRequest(email: string, code: string): boolean {
    const request = this.otpRequests.get(email);
    if (!request) return false;

    if (request.expiresAt < new Date()) {
      this.otpRequests.delete(email);
      return false;
    }

    if (request.code !== code) return false;

    this.otpRequests.delete(email);
    return true;
  }

  // Briefing operations
  createBriefing(userId: string, request: BriefingGenerateRequest): Briefing {
    const briefing: Briefing = {
      _id: uuidv4(),
      userId,
      status: "queued",
      createdAt: new Date(),
      updatedAt: new Date(),
      // Stub fields - will be populated by worker
      summary: "",
      articles: [],
      topics: request.topics || [],
      interests: request.interests || [],
      jobIndustry: request.jobIndustry || "",
      demographic: request.demographic || "",
    };

    this.briefings.set(briefing._id, briefing);
    return briefing;
  }

  getBriefing(id: string): Briefing | undefined {
    return this.briefings.get(id);
  }

  updateBriefing(id: string, updates: Partial<Briefing>): Briefing | undefined {
    const briefing = this.briefings.get(id);
    if (!briefing) return undefined;

    const updatedBriefing = { ...briefing, ...updates, updatedAt: new Date() };
    this.briefings.set(id, updatedBriefing);
    return updatedBriefing;
  }

  getUserBriefings(userId: string): Briefing[] {
    const userBriefings: Briefing[] = [];
    for (const briefing of this.briefings.values()) {
      if (briefing.userId === userId) {
        userBriefings.push(briefing);
      }
    }
    return userBriefings.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

// Export singleton instance
export const storage = new InMemoryStorage();
