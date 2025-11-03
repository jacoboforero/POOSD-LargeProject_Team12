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
