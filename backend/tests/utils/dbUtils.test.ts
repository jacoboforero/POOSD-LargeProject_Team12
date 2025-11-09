import { tryConsumeDailyGenerate, claimQueuedBriefing } from "../../src/utils/dbUtils";
import { UserModel } from "../../src/models/User.model";
import { BriefingModel } from "../../src/models/Briefing.model";

jest.mock("../../src/models/User.model", () => ({
  UserModel: {
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock("../../src/models/Briefing.model", () => ({
  BriefingModel: {
    findOneAndUpdate: jest.fn(),
  },
}));

const mockedFindById = UserModel.findById as jest.Mock;
const mockedFindOneAndUpdateUser = UserModel.findOneAndUpdate as jest.Mock;
const mockedBriefingFindOneAndUpdate = BriefingModel.findOneAndUpdate as jest.Mock;

describe("tryConsumeDailyGenerate", () => {
  const now = new Date("2024-01-01T08:00:00.000Z");
  const dayMs = 24 * 60 * 60 * 1000;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.setSystemTime(now);
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("resets quota when window expired and increments usage atomically", async () => {
    const staleResetAt = new Date(now.getTime() - dayMs);
    const user: any = {
      _id: "user-1",
      limits: {
        resetAt: staleResetAt,
        generatedCountToday: 5,
        dailyGenerateCap: 10,
      },
      save: jest.fn(),
    };

    mockedFindById.mockResolvedValue(user);
    mockedFindOneAndUpdateUser.mockResolvedValue({ _id: "user-1" });

    const result = await tryConsumeDailyGenerate("user-1");

    expect(user.limits.generatedCountToday).toBe(0);
    expect(user.limits.resetAt.getTime()).toBe(now.getTime() + dayMs);
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(mockedFindOneAndUpdateUser).toHaveBeenCalledWith(
      {
        _id: "user-1",
        "limits.generatedCountToday": { $lt: user.limits.dailyGenerateCap },
      },
      {
        $inc: { "limits.generatedCountToday": 1 },
        $set: { updatedAt: now },
      },
      { new: true }
    );
    expect(result).toEqual({ ok: true });
  });

  it("returns reset information when quota already exhausted", async () => {
    const futureResetAt = new Date(now.getTime() + dayMs / 2);
    const user: any = {
      _id: "user-2",
      limits: {
        resetAt: futureResetAt,
        generatedCountToday: 3,
        dailyGenerateCap: 3,
      },
      save: jest.fn(),
    };

    mockedFindById.mockResolvedValue(user);
    mockedFindOneAndUpdateUser.mockResolvedValue(null);

    const result = await tryConsumeDailyGenerate("user-2");

    expect(user.save).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      resetAt: futureResetAt,
    });
  });

  it("throws when the user cannot be located", async () => {
    mockedFindById.mockResolvedValue(null);

    await expect(tryConsumeDailyGenerate("missing")).rejects.toThrow("User not found");
  });
});

describe("claimQueuedBriefing", () => {
  const now = new Date("2024-01-01T12:00:00.000Z");

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.setSystemTime(now);
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("marks the oldest queued briefing as fetching and applies a lease", async () => {
    const claimed = { _id: "brief-1", status: "fetching" };
    mockedBriefingFindOneAndUpdate.mockResolvedValue(claimed);

    const result = await claimQueuedBriefing();

    expect(mockedBriefingFindOneAndUpdate).toHaveBeenCalledWith(
      { status: "queued" },
      expect.objectContaining({
        $set: expect.objectContaining({
          status: "fetching",
          fetchStartedAt: now,
          updatedAt: now,
        }),
      }),
      {
        new: true,
        sort: { createdAt: 1 },
      }
    );

    const [, updateArg] = mockedBriefingFindOneAndUpdate.mock.calls[0];
    const leaseUntil = updateArg.$set.leaseUntil as Date;
    expect(leaseUntil.getTime()).toBe(now.getTime() + 5 * 60 * 1000);
    expect(result).toBe(claimed);
  });

  it("returns null when there are no queued briefings", async () => {
    mockedBriefingFindOneAndUpdate.mockResolvedValue(null);
    const result = await claimQueuedBriefing();
    expect(result).toBeNull();
  });
});
