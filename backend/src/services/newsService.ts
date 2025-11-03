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
   * Fetch articles from News API
   */
  async fetchArticles(
    topics: string[],
    interests: string[]
  ): Promise<Article[]> {
    try {
      // Build search query
      const searchQuery = [...topics, ...interests].join(" OR ");

      // Make API request
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: searchQuery,
          apiKey: this.apiKey,
          language: "en",
          sortBy: "publishedAt",
          pageSize: 20,
          // Remove date restriction to get more results
        },
        timeout: 10000,
      });

      // Transform response to our format
      return (
        response.data.articles?.map((article: any) => ({
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
