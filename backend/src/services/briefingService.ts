import { storage } from "./storage";
import {
  BriefingGenerateRequest,
  Briefing,
} from "../../../packages/contracts/src";

export class BriefingService {
  async generateBriefing(
    userId: string,
    request: BriefingGenerateRequest
  ): Promise<{ briefingId: string }> {
    // Create briefing with queued status
    const briefing = storage.createBriefing(userId, request);

    // Start processing (stub worker will handle this)
    // In a real implementation, this would queue a job
    setTimeout(() => {
      this.processBriefing(briefing._id);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds

    return { briefingId: briefing._id };
  }

  async getBriefingStatus(briefingId: string) {
    const briefing = storage.getBriefing(briefingId);
    if (!briefing) {
      throw new Error("Briefing not found");
    }

    return {
      _id: briefing._id,
      status: briefing.status,
      createdAt: briefing.createdAt,
      updatedAt: briefing.updatedAt,
    };
  }

  async getBriefing(briefingId: string) {
    const briefing = storage.getBriefing(briefingId);
    if (!briefing) {
      throw new Error("Briefing not found");
    }

    return briefing;
  }

  async getUserBriefings(userId: string, limit = 10, offset = 0) {
    const allBriefings = storage.getUserBriefings(userId);
    return allBriefings.slice(offset, offset + limit);
  }

  // Stub method for processing briefings
  private async processBriefing(briefingId: string) {
    const briefing = storage.getBriefing(briefingId);
    if (!briefing) return;

    // Update status to processing
    storage.updateBriefing(briefingId, { status: "processing" });

    // Simulate processing time
    setTimeout(() => {
      // Update with stub data
      const stubSummary =
        `This is a stub briefing summary for topics: ${briefing.topics.join(
          ", "
        )}. ` +
        `Generated at ${new Date().toISOString()}. ` +
        `This would normally contain AI-generated content based on recent news articles.`;

      const stubArticles = [
        {
          title: "Sample Article 1",
          url: "https://example.com/article1",
          summary: "This is a stub article summary.",
          publishedAt: new Date(),
          source: "Example News",
        },
        {
          title: "Sample Article 2",
          url: "https://example.com/article2",
          summary: "This is another stub article summary.",
          publishedAt: new Date(),
          source: "Example News",
        },
      ];

      storage.updateBriefing(briefingId, {
        status: "done",
        summary: stubSummary,
        articles: stubArticles,
      });
    }, 500); // Additional 500ms processing time
  }
}

export const briefingService = new BriefingService();
