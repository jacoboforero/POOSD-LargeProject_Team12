import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurrentUserProfile, logout, updateUserProfile } from './userApi';

const axiosMock = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
}));

vi.mock('axios', () => ({
  __esModule: true,
  default: {
    get: axiosMock.get,
    put: axiosMock.put,
  },
  get: axiosMock.get,
  put: axiosMock.put,
}));

const mockGet = axiosMock.get;
const mockPut = axiosMock.put;

const baseProfile = {
  _id: 'user-1',
  name: 'Alex',
  email: 'alex@test.com',
  emailVerified: true,
  preferences: {
    topics: ['tech'],
    interests: ['ai'],
  },
  limits: {
    dailyGenerateCap: 3,
    generatedCountToday: 0,
    resetAt: new Date().toISOString(),
  },
  notificationPrefs: {
    onBriefingReady: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('userApi', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPut.mockReset();
    localStorage.clear();
  });

  it('fetches the current profile with auth headers and caches it locally', async () => {
    localStorage.setItem('token', 'token-123');
    mockGet.mockResolvedValue({ data: baseProfile });

    const profile = await getCurrentUserProfile();

    expect(mockGet).toHaveBeenCalledWith('/api/me', {
      headers: { Authorization: 'Bearer token-123' },
    });
    expect(profile).toEqual(baseProfile);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(baseProfile));
  });

  it('throws when attempting to fetch profile without a token', async () => {
    await expect(getCurrentUserProfile()).rejects.toThrow('No authentication token found');
  });

  it('updates the profile and keeps the cache in sync', async () => {
    localStorage.setItem('token', 'token-456');
    const updatedProfile = { ...baseProfile, name: 'Jordan' };
    mockPut.mockResolvedValue({ data: updatedProfile });

    const payload = { name: 'Jordan' };
    const profile = await updateUserProfile(payload);

    expect(mockPut).toHaveBeenCalledWith('/api/me', payload, {
      headers: { Authorization: 'Bearer token-456' },
    });
    expect(profile).toEqual(updatedProfile);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(updatedProfile));
  });

  it('clears tokens and cached data on logout', () => {
    localStorage.setItem('token', 'token-789');
    localStorage.setItem('user', JSON.stringify(baseProfile));

    logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
