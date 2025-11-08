import axios from "axios";

/**
 * NewsService - Simple news API integration
 */
export class NewsService {
  private apiKey: string;
  private baseUrl: string = "https://newsapi.org/v2";

  constructor() {
    this.apiKey = process.env.NEWS_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("NEWS_API_KEY environment variable is required");
    }
  }

  /**
   * Get relevant news sources based on topics
   */
  private async getNewsSources(topics: string[]): Promise<string> {
    // Map topics to News API categories
    const topicToCategory: Record<string, string> = {
      technology: "technology",
      tech: "technology",
      ai: "technology",
      business: "business",
      politics: "general",
      science: "science",
      health: "health",
      sports: "sports",
      entertainment: "entertainment",
    };

    // Determine which categories to fetch sources from
    const categories = new Set<string>(["general"]); // Always include general news
    topics.forEach((topic) => {
      const category = topicToCategory[topic.toLowerCase()];
      if (category) {
        categories.add(category);
      } else {
        categories.add("general"); // Default to general
      }
    });

    // Fetch sources for each category
    const allSourceIds: string[] = [];
    for (const category of categories) {
      try {
        const sourcesRes = await axios.get(`${this.baseUrl}/sources`, {
          params: {
            language: "en",
            category: category,
            apiKey: this.apiKey,
          },
          timeout: 5000,
        });
        const sourceIds = sourcesRes.data.sources?.map((s: any) => s.id) || [];
        allSourceIds.push(...sourceIds);
      } catch (error) {
        console.error(`Failed to fetch ${category} sources:`, error);
      }
    }

    // Remove duplicates and limit to avoid URL length issues
    return [...new Set(allSourceIds)].slice(0, 50).join(",");
  }

  /**
   * Fetch articles from News API using curated news sources only
   */
  async fetchArticles(
    topics: string[],
    interests: string[]
  ): Promise<Article[]> {
    try {
      // Get relevant news sources based on topics
      const sources = await this.getNewsSources(topics);

      if (!sources) {
        console.error("No news sources found");
        return [];
      }

      // Build search query
      const searchQuery = [...topics, ...interests].join(" OR ");

      // Use /everything with sources parameter - only queries actual news sources
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: searchQuery,
          sources: sources, // Only query curated news sources
          apiKey: this.apiKey,
          language: "en",
          sortBy: "publishedAt",
          pageSize: 20,
        },
        timeout: 10000,
      });

      // Transform response - no need to filter since we're using curated sources
      return (
        response.data.articles
          ?.filter((article: any) => {
            // Basic quality check - must have description
            return article.description && article.description.length > 50;
          })
          .map((article: any) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            source: {
              name: article.source?.name || "Unknown",
              url: article.url,
            },
            publishedAt: new Date(article.publishedAt),
            imageUrl: article.urlToImage,
          })) || []
      );
    } catch (error) {
      console.error("News API error:", error);
      return []; // Return empty array on error
    }
  }

  async fetchCustomArticles(options: FetchCustomArticlesOptions): Promise<Article[]> {
    const preferredSources =
      options.preferredSources?.length
        ? options.preferredSources.join(",")
        : await this.getNewsSources(options.topics || []);

    const params = this.buildCustomArticleParams(options, preferredSources);

    try {
      return await this.requestCustomArticles(params);
    } catch (error: any) {
      const limitDate = this.extractAllowedFromDate(error);
      if (limitDate) {
        console.warn(
          `News API limited historical access to ${limitDate.toISOString().split("T")[0]} onwards. Adjusting window and retrying...`
        );
        const adjustedParams = this.applyAdjustedWindow(params, limitDate);
        try {
          return await this.requestCustomArticles(adjustedParams);
        } catch (retryError) {
          console.error("Custom news fetch retry failed:", retryError);
        }
      } else {
        console.error("Custom news fetch failed:", error);
      }

      return [];
    }
  }

  private buildQuery(options: FetchCustomArticlesOptions) {
    const clauses: string[] = [];

    if (options.topics?.length) {
      clauses.push(`(${options.topics.join(" OR ")})`);
    }

    if (options.includeKeywords?.length) {
      const include = options.includeKeywords.map((kw) => `"${kw}"`).join(" OR ");
      clauses.push(`(${include})`);
    }

    let query = clauses.length > 0 ? clauses.join(" AND ") : "news";

    if (options.excludeKeywords?.length) {
      const exclude = options.excludeKeywords.map((kw) => `-"${kw}"`).join(" ");
      query = `${query} ${exclude}`.trim();
    }

    return query;
  }

  private buildCustomArticleParams(
    options: FetchCustomArticlesOptions,
    preferredSources?: string
  ) {
    const params: Record<string, any> = {
      q: this.buildQuery(options),
      apiKey: this.apiKey,
      language: options.language || "en",
      sortBy: "publishedAt",
      pageSize: options.pageSize || 30,
    };

    if (preferredSources) {
      params.sources = preferredSources;
    }

    if (options.timeRangeHours) {
      const to = new Date();
      const from = new Date(Date.now() - options.timeRangeHours * 60 * 60 * 1000);
      params.from = from.toISOString();
      params.to = to.toISOString();
    }

    return params;
  }

  private async requestCustomArticles(params: Record<string, any>): Promise<Article[]> {
    const response = await axios.get(`${this.baseUrl}/everything`, {
      params,
      timeout: 10000,
    });

    return (
      response.data.articles
        ?.filter((article: any) => article.title && article.description)
        .map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          source: {
            name: article.source?.name || "Unknown",
            url: article.url,
          },
          publishedAt: new Date(article.publishedAt),
          imageUrl: article.urlToImage,
        })) || []
    );
  }

  private extractAllowedFromDate(error: any): Date | null {
    if (!axios.isAxiosError(error) || !error.response) {
      return null;
    }

    const payload = error.response.data;
    const candidates: string[] = [];

    if (typeof payload === "string") {
      candidates.push(payload);
    } else if (payload) {
      const possibleMessages = [
        payload.message,
        payload.error,
        payload.error?.message,
        payload.error?.details,
      ];
      possibleMessages.forEach((msg) => {
        if (typeof msg === "string") {
          candidates.push(msg);
        }
      });
    }

    candidates.push(error.message);

    for (const message of candidates) {
      const match = message?.match(/as far back as (\d{4}-\d{2}-\d{2})/i);
      if (match?.[1]) {
        const parsed = new Date(`${match[1]}T00:00:00.000Z`);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    }

    return null;
  }

  private applyAdjustedWindow(
    params: Record<string, any>,
    minDate: Date
  ): Record<string, any> {
    const updatedParams = { ...params };
    const originalFrom = params.from ? new Date(params.from) : null;
    const now = new Date();

    const dayBufferMs = 24 * 60 * 60 * 1000; // move at least one full day past limit
    const minAllowed = new Date(minDate.getTime() + dayBufferMs);
    const adjustedStart =
      originalFrom && originalFrom > minAllowed ? originalFrom : minAllowed;
    const safeStart =
      adjustedStart > now ? new Date(now.getTime() - dayBufferMs) : adjustedStart;

    updatedParams.from = safeStart.toISOString();
    updatedParams.to = now.toISOString();

    return updatedParams;
  }
}

/**
 * Simple article interface
 */
export interface Article {
  title: string;
  description?: string;
  url: string;
  source: {
    name: string;
    url?: string;
  };
  publishedAt: Date;
  imageUrl?: string;
}

export interface FetchCustomArticlesOptions {
  topics?: string[];
  includeKeywords?: string[];
  excludeKeywords?: string[];
  preferredSources?: string[];
  language?: string;
  timeRangeHours?: number;
  pageSize?: number;
}
