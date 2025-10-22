import { UserModel } from "../models/User.model";
import { BriefingModel } from "../models/Briefing.model";

export class BriefingService {
  async generate(userId: string, request: any = {}) {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (new Date() >= user.limits.resetAt) {
      user.limits.generatedCountToday = 0;
      user.limits.resetAt = this.getNextResetTime();
      await user.save();
    }

    if (user.limits.generatedCountToday >= user.limits.dailyGenerateCap) {
      throw new Error('Daily generation limit reached');
    }

    const briefing = await BriefingModel.create({
      userId,
      status: 'queued',
      request: {
        topics: request.topics || user.preferences.topics,
        interests: request.interests || user.preferences.interests,
        jobIndustry: request.jobIndustry || user.preferences.jobIndustry,
        demographic: request.demographic || user.preferences.demographic,
        source: 'news_api',
      },
      articles: [],
      queuedAt: new Date(),
    });

    user.limits.generatedCountToday += 1;
    await user.save();

    this.processInBackground(String(briefing._id));

    return { briefingId: String(briefing._id) };
  }

  async getStatus(briefingId: string, userId: string) {
    const briefing = await BriefingModel.findById(briefingId);
    
    if (!briefing) {
      throw new Error('Briefing not found');
    }

    if (briefing.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return {
      _id: String(briefing._id),
      status: briefing.status,
      statusReason: briefing.statusReason,
      progress: briefing.progress,
      createdAt: briefing.createdAt,
      updatedAt: briefing.updatedAt,
    };
  }

  async get(briefingId: string, userId: string) {
    const briefing = await BriefingModel.findById(briefingId);
    
    if (!briefing) {
      throw new Error('Briefing not found');
    }

    if (briefing.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return {
      _id: String(briefing._id),
      userId: briefing.userId,
      status: briefing.status,
      statusReason: briefing.statusReason,
      request: briefing.request,
      articles: briefing.articles || [],
      summary: briefing.summary,
      error: briefing.error,
      queuedAt: briefing.queuedAt,
      fetchStartedAt: briefing.fetchStartedAt,
      summarizeStartedAt: briefing.summarizeStartedAt,
      completedAt: briefing.completedAt,
      progress: briefing.progress,
      createdAt: briefing.createdAt,
      updatedAt: briefing.updatedAt,
    };
  }

  private async processInBackground(briefingId: string) {
    setTimeout(async () => {
      try {
        const briefing = await BriefingModel.findById(briefingId);
        
        if (!briefing) return;

        briefing.status = 'done';
        briefing.completedAt = new Date();
        briefing.progress = 100;
        
        briefing.summary = {
          sections: [
            {
              category: 'technology',
              text: 'This is a stub summary. Real news integration coming soon.',
            },
          ],
          generatedAt: new Date(),
          llm: {
            provider: 'openai',
            model: 'gpt-4o-mini',
            inputTokens: 0,
            outputTokens: 0,
          },
        };
        
        briefing.articles = [
          {
            title: 'Sample Article',
            url: 'https://example.com/article',
            source: 'Example News',
          },
        ];

        await briefing.save();
        console.log(`✅ Briefing ${briefingId} completed`);
      } catch (error) {
        console.error(`❌ Error processing briefing ${briefingId}:`, error);
      }
    }, 3000);
  }

  private getNextResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
}