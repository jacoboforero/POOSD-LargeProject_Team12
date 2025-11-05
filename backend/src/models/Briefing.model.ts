import mongoose, { Schema, Document } from 'mongoose';

export interface IBriefing extends Document {
  userId: string;
  status: 'queued' | 'fetching' | 'summarizing' | 'done' | 'error';
  statusReason?: string;
  request: {
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
    source: string;
  };
  articles: Array<{
    title?: string;
    url?: string;
    source?: string;
    publishedAt?: Date;
    language?: string;
    content?: string;
    fetchStatus?: 'ok' | 'skipped' | 'failed';
    cacheRef?: string;
  }>;
  summary?: {
    sections: Array<{
      category: string;
      text: string;
    }>;
    generatedAt: Date;
    llm: {
      provider: string;
      model: string;
      inputTokens: number;
      outputTokens: number;
    };
    citations?: Array<{
      title?: string;
      url?: string;
      source?: string;
      publishedAt?: Date;
    }>;
  };
  error?: {
    message: string;
  };
  queuedAt?: Date;
  fetchStartedAt?: Date;
  summarizeStartedAt?: Date;
  completedAt?: Date;
  progress?: number;
  sourceWindow?: {
    from: Date;
    to: Date;
  };
  requestHash?: string;
  counters?: {
    articleFetchCount: number;
    articleFetchFailedCount: number;
  };
  costs?: {
    inputTokens: number;
    outputTokens: number;
    providerCostUsd?: number;
    durationMs?: number;
  };
  traceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BriefingSchema = new Schema<IBriefing>({
  userId: { type: String, required: true, index: true },
  status: { 
    type: String, 
    required: true,
    enum: ['queued', 'fetching', 'summarizing', 'done', 'error'],
    default: 'queued'
  },
  statusReason: String,

  request: {
    topics: [String],
    interests: [String],
    jobIndustry: String,
    demographic: String,
    location: String,
    lifeStage: String,
    newsStyle: String,
    newsScope: String,
    preferredHeadlines: [String],
    scrollPastTopics: [String],
    source: { type: String, default: 'news_api' },
  },

  articles: [{
    title: String,
    url: String,
    source: String,
    publishedAt: Date,
    language: String,
    content: String,
    fetchStatus: { type: String, enum: ['ok', 'skipped', 'failed'] },
    cacheRef: String,
  }],

  summary: {
    sections: [{
      category: String,
      text: String,
    }],
    generatedAt: Date,
    llm: {
      provider: { type: String, default: 'openai' },
      model: { type: String, default: 'gpt-4o-mini' },
      inputTokens: { type: Number, default: 0 },
      outputTokens: { type: Number, default: 0 },
    },
    citations: [{
      title: String,
      url: String,
      source: String,
      publishedAt: Date,
    }],
  },

  error: {
    message: String,
  },

  queuedAt: Date,
  fetchStartedAt: Date,
  summarizeStartedAt: Date,
  completedAt: Date,
  progress: Number,

  sourceWindow: {
    from: Date,
    to: Date,
  },

  requestHash: String,
  
  counters: {
    articleFetchCount: { type: Number, default: 0 },
    articleFetchFailedCount: { type: Number, default: 0 },
  },

  costs: {
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    providerCostUsd: Number,
    durationMs: Number,
  },

  traceId: String,
}, {
  timestamps: true,
  strict: false, // This allows flexibility with Date types
});

BriefingSchema.index({ userId: 1, createdAt: -1 });
BriefingSchema.index({ status: 1 });

export const BriefingModel = mongoose.model<IBriefing>('Briefing', BriefingSchema);