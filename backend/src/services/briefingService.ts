import { UserModel } from "../models/User.model";
import { BriefingModel } from "../models/Briefing.model";
import { NewsService } from "./newsService";
import { ArticleScraper } from "./articleScraper";
import OpenAI from "openai";
import {
  BriefingGenerateRequest,
  CustomNewsQueryRequest,
} from "../../../packages/contracts/src";

export class BriefingService {
  private newsService: NewsService;
  private articleScraper: ArticleScraper;
  private openai: OpenAI | null = null;

  constructor() {
    this.newsService = new NewsService();
    this.articleScraper = new ArticleScraper();
  }

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is required");
      }
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  async generateDailyBriefing(
    userId: string,
    request?: BriefingGenerateRequest
  ) {
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

    const overrides = request || {};

    const briefing = await BriefingModel.create({
      userId,
      status: "queued",
      request: {
        mode: "daily",
        topics: overrides.topics || user.preferences.topics,
        interests: overrides.interests || user.preferences.interests,
        jobIndustry: overrides.jobIndustry || user.preferences.jobIndustry,
        demographic: overrides.demographic || user.preferences.demographic,
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

  async generateCustomNewsQuery(
    userId: string,
    request: CustomNewsQueryRequest
  ) {
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

    const timeRangeHours = 24 * 90; // 3 months
    const sourceWindow = this.getSourceWindow(timeRangeHours);
    const format = request.format || "narrative";

    const briefing = await BriefingModel.create({
      userId,
      status: "queued",
      request: {
        mode: "custom_news_query",
        topics: request.topics,
        includeKeywords: request.includeKeywords,
        excludeKeywords: request.excludeKeywords,
        preferredSources: request.preferredSources,
        sources: request.preferredSources,
        language: request.language || "en",
        timeRangeHours,
        sortBy: "publishedAt",
        summaryTone: "neutral",
        format,
        summaryStyle: format,
        source: "news_api",
      },
      sourceWindow,
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

        if (!articles.length) {
          const message =
            "No articles matched your request in the available time window. Try adjusting topics, keywords, or sources.";
          briefing.status = "error";
          briefing.statusReason = message;
          briefing.error = { message };
          briefing.progress = 100;
          briefing.completedAt = new Date();
          briefing.articles = [];
          await briefing.save();
          console.warn(
            `⚠️  Briefing ${briefingId} had zero articles. Skipping summarization.`
          );
          return;
        }

        // Step 3: Update status to 'summarizing'
        briefing.status = "summarizing";
        briefing.summarizeStartedAt = new Date();
        briefing.progress = 75;
        briefing.articles = articles; // Store fetched articles
        await briefing.save();
        console.log(
          `🤖 Summarizing ${articles.length} articles for briefing ${briefingId}...`
        );

        // Step 4: Generate AI summary
        const summary = await this.generateSummary(
          articles,
          briefing.request,
          briefing.userId
        );

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
   * Fetch news articles using NewsService and scrape full content
   * Tries scraping articles one by one until we successfully scrape 3 articles
   *
   * @param briefing - The briefing document with request parameters
   * @returns Promise<Article[]> - Array of 3 articles with full scraped content
   */
  private async fetchNewsArticles(briefing: any): Promise<any[]> {
    try {
      const articles = await this.fetchArticlesForBriefing(briefing);

      // Basic validation
      const validArticles = articles.filter(
        (article) => article.title && article.url
      );

      if (!validArticles.length) {
        console.warn(
          "⚠️  News API returned zero articles for this query. Skipping scraping."
        );
        return [];
      }

      console.log(
        `📰 Fetched ${validArticles.length} articles, scraping until we get 3 with content...`
      );

      // Try scraping articles one by one until we get 3 successful scrapes
      const articlesWithContent: any[] = [];
      const MIN_CONTENT_LENGTH = 500; // Minimum characters to consider a successful scrape

      for (const article of validArticles) {
        if (articlesWithContent.length >= 3) {
          break; // We have 3 successful scrapes, stop trying
        }

        console.log(
          `🕷️  Attempting to scrape: ${article.title.substring(0, 50)}...`
        );
        const scrapedContent = await this.articleScraper.scrapeArticle(
          article.url
        );

        // Only keep articles with substantial content
        if (scrapedContent && scrapedContent.length >= MIN_CONTENT_LENGTH) {
          articlesWithContent.push({
            title: article.title,
            url: article.url,
            source:
              typeof article.source === "string"
                ? article.source
                : article.source?.name || "Unknown",
            publishedAt: article.publishedAt,
            content: scrapedContent,
          });
          console.log(
            `✅ Successfully scraped ${scrapedContent.length} characters (${articlesWithContent.length}/3)`
          );
        } else {
          console.log(
            `⚠️  Scraped content too short or failed (${
              scrapedContent?.length || 0
            } chars), trying next article...`
          );
        }

        // Small delay between scrapes to be respectful
        if (articlesWithContent.length < 3) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (articlesWithContent.length === 0) {
        console.log(
          `⚠️  Could not scrape any articles with sufficient content for briefing ${briefing._id}`
        );
        return [];
      }

      console.log(
        `✅ Final: ${articlesWithContent.length} articles with full content ready for summarization`
      );

      return articlesWithContent;
    } catch (error) {
      console.error("❌ Error fetching news articles:", error);

      // Return empty set so caller can surface a friendly message
      return [];
    }
  }

  private async fetchArticlesForBriefing(briefing: any) {
    const mode = briefing.request?.mode || "daily";

    if (mode === "custom" || mode === "custom_news_query") {
      return this.newsService.fetchCustomArticles({
        topics: briefing.request?.topics || [],
        includeKeywords: briefing.request?.includeKeywords || [],
        excludeKeywords: briefing.request?.excludeKeywords || [],
        preferredSources:
          briefing.request?.preferredSources || briefing.request?.sources || [],
        language: briefing.request?.language || "en",
        timeRangeHours: briefing.request?.timeRangeHours || 24,
      });
    }

    const topics = briefing.request?.topics || [];
    const interests = briefing.request?.interests || [];
    return this.newsService.fetchArticles(topics, interests);
  }

  /**
   * Generate AI summary of articles using OpenAI GPT-4o
   *
   * @param articles - Array of articles to summarize (with full content)
   * @param request - Original briefing request parameters
   * @param userId - User ID to fetch user profile
   * @returns Promise<Summary> - Generated summary
   */
  private async generateSummary(
    articles: any[],
    request: any,
    userId: string
  ): Promise<any> {
    try {
      // Fetch user to get full profile
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found for summarization");
      }

      // Build comprehensive prompt
      const prompt = this.buildSummaryPrompt(articles, request, user);

      console.log(`🤖 Calling OpenAI API with ${articles.length} articles...`);

      // Call OpenAI API
      const completion = await this.getOpenAI().chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert news analyst that creates personalized briefings. Your summaries should be clear, concise, and highlight how each article relates to the user's specific interests and context.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const summaryText = completion.choices[0]?.message?.content || "";
      const inputTokens = completion.usage?.prompt_tokens || 0;
      const outputTokens = completion.usage?.completion_tokens || 0;

      console.log(`✅ OpenAI response: ${outputTokens} tokens generated`);

      // Parse and structure the response
      const sections = this.parseSummaryResponse(summaryText, articles);

      return {
        sections,
        generatedAt: new Date(),
        llm: {
          provider: "openai",
          model: "gpt-4o",
          inputTokens,
          outputTokens,
        },
        citations: articles.map((article) => ({
          title: article.title,
          url: article.url,
          source: article.source?.name,
          publishedAt: article.publishedAt,
        })),
      };
    } catch (error) {
      console.error("❌ Error generating AI summary:", error);

      // Return fallback summary on error
      return {
        sections: [
          {
            category: "error",
            text: `Unable to generate AI summary at this time. Found ${
              articles.length
            } articles about ${
              request.topics?.join(", ") || "your interests"
            }.`,
          },
        ],
        generatedAt: new Date(),
        llm: {
          provider: "openai",
          model: "gpt-4o",
          inputTokens: 0,
          outputTokens: 0,
        },
      };
    }
  }

  /**
   * Build comprehensive prompt for OpenAI
   */
  private buildSummaryPrompt(articles: any[], request: any, user: any): string {
    const topics = request.topics || user.preferences.topics || [];
    const interests = request.interests || user.preferences.interests || [];
    const jobIndustry = request.jobIndustry || user.preferences.jobIndustry;
    const demographic = request.demographic || user.preferences.demographic;
    const mode = request.mode || "daily";
    const summaryTone = request.summaryTone || "direct";
    const format = request.format || request.summaryStyle || "narrative";

    let prompt = `Create a personalized news briefing that is concise, fact-led, and clearly explains why each item matters to the reader. Avoid filler phrases, avoid repeating the prompt, and do not use hypey adjectives.

## User Context:
- Topics of Interest: ${topics.join(", ") || "Not specified"}
- Specific Interests: ${interests.join(", ") || "Not specified"}
${jobIndustry ? `- Job Industry: ${jobIndustry}` : ""}
${demographic ? `- Demographic: ${demographic}` : ""}
${request.includeKeywords?.length ? `- Must highlight: ${request.includeKeywords.join(", ")}` : ""}
${request.excludeKeywords?.length ? `- Avoid emphasis on: ${request.excludeKeywords.join(", ")}` : ""}
${request.preferredSources?.length ? `- Preferred sources: ${request.preferredSources.join(", ")}` : request.sources?.length ? `- Preferred sources: ${request.sources.join(", ")}` : ""}
${request.timeRangeHours ? `- Coverage window: last ${request.timeRangeHours} hours` : ""}

## Purpose:
You are creating a sharp digest that summarizes ${
      articles.length
    } articles. Your summary must:
1. Capture only the most important new facts or developments from each article.
2. Immediately tie those facts back to the user's interests (${topics.join(
      ", "
    )}${interests.length > 0 ? `, ${interests.join(", ")}` : ""}) or role (${jobIndustry || "general"}).
3. State explicitly why this update matters (impact, risk, opportunity, next step).
4. Stay laser-focused on clarity—no metaphors, no fluff.
5. Match the requested tone (${summaryTone}) and output format (${
      format === "bullet_points" ? "bullet points" : "narrative"
    })

## Articles to Summarize:

`;

    articles.forEach((article, index) => {
      prompt += `### Article ${index + 1}: ${article.title}
- Source: ${article.source?.name || "Unknown"}
- Published: ${
        article.publishedAt
          ? new Date(article.publishedAt).toLocaleDateString()
          : "Unknown"
      }
- URL: ${article.url}

**Full Content:**
${article.content || article.description || "No content available"}

---

`;
    });

    prompt += `## Instructions:
Produce the output using these rules:
1. Start with a single overview sentence (<=25 words) that summarizes the overall signal.
2. ${
      format === "bullet_points"
        ? "List each article as a bullet. Begin with a short bolded fragment that captures the news, followed by a dash that explains in plain language why it matters to the reader."
        : "Write short paragraphs (maximum 2 sentences each). The first sentence states the new development; the second sentence explains why it matters to the reader."
    }
3. Quote concrete numbers, dates, or names when available—never say \"recent\" if you can say \"Oct 12\".
4. Do not add closing remarks or calls to action unless the source explicitly recommends one.
5. Keep the total response under 220 words.

Stay direct, confident, and informative.`;

    return prompt;
  }

  /**
   * Parse OpenAI response into structured sections
   */
  private parseSummaryResponse(
    summaryText: string,
    articles: any[]
  ): Array<{ category: string; text: string }> {
    // Try to detect natural sections/categories in the response
    // For now, create a single comprehensive section
    // In the future, we could use structured outputs or parse multiple sections

    // If the response seems to have natural breaks (double newlines), try to split into sections
    const paragraphs = summaryText
      .split("\n\n")
      .filter((p) => p.trim().length > 0);

    if (paragraphs.length > 1) {
      // Multiple paragraphs - treat as sections based on content
      const sections: Array<{ category: string; text: string }> = [];

      // First paragraph is usually overview
      if (paragraphs[0]) {
        sections.push({
          category: "overview",
          text: paragraphs[0].trim(),
        });
      }

      // Remaining paragraphs as main content
      if (paragraphs.length > 1) {
        sections.push({
          category: "summary",
          text: paragraphs.slice(1).join("\n\n").trim(),
        });
      }

      return sections.length > 0
        ? sections
        : [{ category: "summary", text: summaryText.trim() }];
    }

    // Single cohesive summary
    return [
      {
        category: "briefing",
        text: summaryText.trim(),
      },
    ];
  }

  private getSourceWindow(hours: number) {
    const to = new Date();
    const from = new Date(Date.now() - hours * 60 * 60 * 1000);
    return { from, to };
  }

  private getNextResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
}
