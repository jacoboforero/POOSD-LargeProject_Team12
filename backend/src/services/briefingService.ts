import { UserModel } from "../models/User.model";
import { BriefingModel } from "../models/Briefing.model";
import { NewsService } from "./newsService";

export class BriefingService {
  private newsService: NewsService;

  constructor() {
    this.newsService = new NewsService();
  }

  async generate(userId: string, request: any = {}) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (new Date() >= user.limits.resetAt) {
      user.limits.generatedCountToday = 0;
      user.limits.resetAt = this.getNextResetTime();
      await user.save();
    }

    if (user.limits.generatedCountToday >= user.limits.dailyGenerateCap) {
      throw new Error("Daily generation limit reached");
    }

    const briefing = await BriefingModel.create({
      userId,
      status: "queued",
      request: {
        topics: request.topics || user.preferences.topics,
        interests: request.interests || user.preferences.interests,
        jobIndustry: request.jobIndustry || user.preferences.jobIndustry,
        demographic: request.demographic || user.preferences.demographic,
        source: "news_api",
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
      throw new Error("Briefing not found");
    }

    if (briefing.userId !== userId) {
      throw new Error("Unauthorized");
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
      throw new Error("Briefing not found");
    }

    if (briefing.userId !== userId) {
      throw new Error("Unauthorized");
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

  /**
   * Process briefing in background with real news data
   *
   * This method replaces the stub data implementation with real news fetching
   */
  private async processInBackground(briefingId: string) {
    // TODO: Consider using a proper job queue (BullMQ + Redis) instead of setTimeout
    // for production scalability

    setTimeout(async () => {
      try {
        const briefing = await BriefingModel.findById(briefingId);

        if (!briefing) {
          console.log(`❌ Briefing ${briefingId} not found`);
          return;
        }

        // Step 1: Update status to 'fetching'
        briefing.status = "fetching";
        briefing.fetchStartedAt = new Date();
        briefing.progress = 25;
        await briefing.save();
        console.log(`📰 Fetching news for briefing ${briefingId}...`);

        // Step 2: Fetch articles from News API
        const articles = await this.fetchNewsArticles(briefing);

        // Step 3: Update status to 'summarizing'
        briefing.status = "summarizing";
        briefing.summarizeStartedAt = new Date();
        briefing.progress = 75;
        briefing.articles = articles; // Store fetched articles
        await briefing.save();
        console.log(
          `🤖 Summarizing ${articles.length} articles for briefing ${briefingId}...`
        );

        // Step 4: Generate AI summary (future implementation)
        const summary = await this.generateSummary(articles, briefing.request);

        // Step 5: Complete briefing
        briefing.status = "done";
        briefing.completedAt = new Date();
        briefing.progress = 100;
        briefing.summary = summary;
        await briefing.save();

        console.log(
          `✅ Briefing ${briefingId} completed with ${articles.length} articles`
        );
      } catch (error) {
        console.error(`❌ Error processing briefing ${briefingId}:`, error);

        // Update briefing with error status
        try {
          const briefing = await BriefingModel.findById(briefingId);
          if (briefing) {
            briefing.status = "error";
            briefing.statusReason =
              error instanceof Error ? error.message : "Unknown error";
            briefing.error = {
              message: error instanceof Error ? error.message : "Unknown error",
            };
            await briefing.save();
          }
        } catch (updateError) {
          console.error(
            `❌ Failed to update briefing error status:`,
            updateError
          );
        }
      }
    }, 1000); // Reduced delay since we're doing real work now
  }

  /**
   * Fetch news articles using NewsService
   *
   * @param briefing - The briefing document with request parameters
   * @returns Promise<Article[]> - Array of fetched articles
   */
  private async fetchNewsArticles(briefing: any): Promise<any[]> {
    try {
      // Extract topics and interests from briefing request
      const topics = briefing.request.topics || [];
      const interests = briefing.request.interests || [];

      // Fetch articles from News API
      const articles = await this.newsService.fetchArticles(topics, interests);

      // Basic validation and limit
      return articles
        .filter((article) => article.title && article.url)
        .slice(0, 15); // Limit to 15 articles
    } catch (error) {
      console.error("❌ Error fetching news articles:", error);

      // Return fallback articles
      return [
        {
          title: "News API temporarily unavailable",
          description:
            "We are experiencing issues with our news service. Please try again later.",
          url: "#",
          source: { name: "System" },
          publishedAt: new Date(),
        },
      ];
    }
  }

  /**
   * Generate AI summary of articles (future implementation)
   *
   * @param articles - Array of articles to summarize
   * @param request - Original briefing request parameters
   * @returns Promise<Summary> - Generated summary
   */
  private async generateSummary(articles: any[], request: any): Promise<any> {
    // TODO: Implement AI summarization
    // - Use OpenAI API or similar service
    // - Build prompt based on articles and user preferences
    // - Handle different article categories
    // - Generate structured summary with sections
    // - Track token usage for billing

    // For now, return stub summary
    return {
      sections: [
        {
          category: "technology",
          text: `Found ${articles.length} articles about ${
            request.topics?.join(", ") || "your interests"
          }. Real AI summarization coming soon!`,
        },
      ],
      generatedAt: new Date(),
      llm: {
        provider: "openai", // TODO: Make configurable
        model: "gpt-4o-mini", // TODO: Make configurable
        inputTokens: 0, // TODO: Track actual usage
        outputTokens: 0, // TODO: Track actual usage
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
