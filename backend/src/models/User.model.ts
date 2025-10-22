import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  emailVerified: boolean;
  otp?: {
    hash: string;
    expiresAt: Date;
    attempts: number;
    lastRequestedAt?: Date;
    throttledUntil?: Date;
  };
  preferences: {
    topics: string[];
    demographic?: string;
    jobIndustry?: string;
    interests: string[];
  };
  limits: {
    dailyGenerateCap: number;
    generatedCountToday: number;
    resetAt: Date;
  };
  timezone?: string;
  notificationPrefs: {
    onBriefingReady: boolean;
  };
  pushTokens: Array<{
    platform: 'ios' | 'android';
    token: string;
    addedAt: Date;
  }>;
  acceptedTermsAt?: Date;
  acceptedPrivacyAt?: Date;
  lastLoginAt?: Date;
  lastIp?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, lowercase: true },
  emailVerified: { type: Boolean, default: false },
  
  otp: {
    hash: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 },
    lastRequestedAt: Date,
    throttledUntil: Date,
  },

  preferences: {
    topics: { type: [String], default: [] },
    demographic: String,
    jobIndustry: String,
    interests: { type: [String], default: [] },
  },

  limits: {
    dailyGenerateCap: { type: Number, default: 3 },
    generatedCountToday: { type: Number, default: 0 },
    resetAt: { type: Date, required: true },
  },

  timezone: String,
  
  notificationPrefs: {
    onBriefingReady: { type: Boolean, default: true },
  },

  pushTokens: [{
    platform: { type: String, enum: ['ios', 'android'] },
    token: String,
    addedAt: Date,
  }],

  acceptedTermsAt: Date,
  acceptedPrivacyAt: Date,
  lastLoginAt: Date,
  lastIp: String,
  userAgent: String,
}, {
  timestamps: true,
});

UserSchema.index({ email: 1 });

export const UserModel = mongoose.model<IUser>('User', UserSchema);