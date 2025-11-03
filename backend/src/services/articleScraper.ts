import axios from "axios";
import * as cheerio from "cheerio";

/**
 * ArticleScraper - Fetches full article content from URLs
 */
export class ArticleScraper {
  /**
   * Scrape full article content from URL
   */
  async scrapeArticle(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const $ = cheerio.load(response.data);

      // Try common article content selectors
      const selectors = [
        "article",
        '[role="article"]',
        ".article-content",
        ".post-content",
        ".entry-content",
        ".content",
        "main article",
        ".article-body",
        "#article-content",
      ];

      let content = "";

      // Try each selector until we find content
      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          // Remove script, style, and other non-content elements
          elements.find("script, style, nav, header, footer, aside, .ad, .advertisement").remove();
          
          // Get text content
          content = elements
            .map((_, el) => $(el).text())
            .get()
            .join("\n")
            .trim();

          if (content.length > 500) {
            // Found substantial content
            break;
          }
        }
      }

      // Fallback: if no article selector found, get all paragraphs from main/main-content
      if (!content || content.length < 500) {
        const paragraphs = $("main p, article p, .content p, #content p")
          .map((_, el) => $(el).text())
          .get()
          .filter((text) => text.length > 50) // Filter out short paragraphs
          .join("\n\n");

        if (paragraphs.length > content.length) {
          content = paragraphs;
        }
      }

      // Clean up the content
      content = this.cleanContent(content);

      return content || "";
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to scrape ${url}:`, message);
      return "";
    }
  }

  /**
   * Scrape multiple articles in parallel
   */
  async scrapeArticles(
    articles: Array<{ url: string; title?: string }>,
    maxConcurrent: number = 5
  ): Promise<Array<{ url: string; content: string }>> {
    const results: Array<{ url: string; content: string }> = [];

    // Process in batches to avoid overwhelming servers
    for (let i = 0; i < articles.length; i += maxConcurrent) {
      const batch = articles.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(
        batch.map(async (article) => {
          const content = await this.scrapeArticle(article.url);
          return { url: article.url, content };
        })
      );
      results.push(...batchResults);

      // Small delay between batches to be respectful
      if (i + maxConcurrent < articles.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Clean and normalize scraped content
   */
  private cleanContent(content: string): string {
    return content
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\n{3,}/g, "\n\n") // Max 2 newlines
      .trim();
  }
}
