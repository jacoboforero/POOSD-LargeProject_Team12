import axios from "axios";
import { NewsService } from "../../src/services/newsService";

jest.mock("axios", () => {
  const mockAxios = {
    get: jest.fn(),
    isAxiosError: (error: any) => Boolean(error?.isAxiosError),
  };

  return {
    __esModule: true,
    default: mockAxios,
    ...mockAxios,
  };
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("NewsService helpers", () => {
  const now = new Date("2024-02-15T10:00:00.000Z");

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.setSystemTime(now);
    jest.clearAllMocks();
    process.env.NEWS_API_KEY = "test-api-key";
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("builds structured queries with include and exclude clauses", () => {
    const service = new NewsService();
    const query = (service as any).buildQuery({
      topics: ["AI", "Economy"],
      includeKeywords: ["earnings season"],
      excludeKeywords: ["sports", "gossip"],
    });

    expect(query).toBe('(AI OR Economy) AND ("earnings season") -"sports" -"gossip"');
  });

  it("defaults to news query when no clauses are provided", () => {
    const service = new NewsService();
    const query = (service as any).buildQuery({});
    expect(query).toBe("news");
  });

  it("builds article params with rolling windows and optional sources", () => {
    const service = new NewsService();
    const params = (service as any).buildCustomArticleParams(
      {
        topics: ["AI"],
        includeKeywords: ["chips"],
        timeRangeHours: 6,
        language: "fr",
        pageSize: 10,
      },
      "source-a,source-b"
    );

    expect(params).toMatchObject({
      q: expect.stringContaining("AI"),
      sources: "source-a,source-b",
      apiKey: "test-api-key",
      language: "fr",
      sortBy: "publishedAt",
      pageSize: 10,
    });

    expect(new Date(params.to).toISOString()).toBe(now.toISOString());
    expect(new Date(params.from).getTime()).toBe(now.getTime() - 6 * 60 * 60 * 1000);
  });

  it("extracts API historical cut-off dates from nested payloads", () => {
    const service = new NewsService();
    const error = {
      isAxiosError: true,
      response: {
        data: {
          error: {
            message: "Records only available as far back as 2024-01-10.",
          },
        },
      },
      message: "Request failed",
    };

    const parsed = (service as any).extractAllowedFromDate(error);
    expect(parsed?.toISOString()).toBe("2024-01-10T00:00:00.000Z");
  });

  it("adjusts windows to respect provider minimums while staying within present time", () => {
    const service = new NewsService();
    const params = {
      from: "2024-01-01T00:00:00.000Z",
      to: "2024-01-05T00:00:00.000Z",
    };
    const minDate = new Date("2024-01-10T00:00:00.000Z");

    const adjusted = (service as any).applyAdjustedWindow(params, minDate);

    const expectedFrom = new Date(minDate.getTime() + 24 * 60 * 60 * 1000);
    expect(new Date(adjusted.from).toISOString()).toBe(expectedFrom.toISOString());
    expect(new Date(adjusted.to).toISOString()).toBe(now.toISOString());
  });

  it("retries custom article fetches with a reduced window when API limits history", async () => {
    const service = new NewsService();
    jest.spyOn(service as any, "getNewsSources").mockResolvedValue("source-1");

    const requestSpy = jest
      .spyOn(service as any, "requestCustomArticles")
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          data: "You may only request as far back as 2024-02-01.",
        },
        message: "Restricted",
      })
      .mockResolvedValueOnce([
        {
          title: "AI market update",
          description: "Summary",
          url: "https://example.com/article",
          source: { name: "Example" },
          publishedAt: now,
          imageUrl: undefined,
        },
      ]);

    const windowSpy = jest.spyOn(service as any, "applyAdjustedWindow");

    const articles = await service.fetchCustomArticles({
      topics: ["ai"],
      includeKeywords: [],
      excludeKeywords: [],
    });

    expect(requestSpy).toHaveBeenCalledTimes(2);
    expect(windowSpy).toHaveBeenCalled();
    expect(articles).toHaveLength(1);
  });
});
