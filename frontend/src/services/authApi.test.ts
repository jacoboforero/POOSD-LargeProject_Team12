import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  checkUserExists,
  loginWithPassword,
  registerUser,
  resetPassword,
} from './authApi';

const axiosMock = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock('axios', () => ({
  __esModule: true,
  default: {
    post: axiosMock.post,
    isAxiosError: (error: any) => Boolean(error?.isAxiosError),
  },
  post: axiosMock.post,
  isAxiosError: (error: any) => Boolean(error?.isAxiosError),
}));

const mockPost = axiosMock.post;

describe('authApi', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it('checks if a user exists with normalized email casing', async () => {
    mockPost.mockResolvedValue({ data: { exists: true } });

    const exists = await checkUserExists('CaSe@Test.COM ');

    expect(exists).toBe(true);
    expect(mockPost).toHaveBeenCalledWith('/api/auth/check-user', {
      email: 'case@test.com',
    });
  });

  it('falls back to registration flow when the lookup fails', async () => {
    mockPost.mockRejectedValue(new Error('network error'));
    const exists = await checkUserExists('missing@test.com');
    expect(exists).toBe(false);
  });

  it('surfaces nested API errors when password login fails', async () => {
    const apiError = {
      isAxiosError: true,
      response: {
        data: {
          error: {
            details: {
              detail: 'Account locked for 24h',
            },
          },
        },
      },
      message: 'Forbidden',
    };
    mockPost.mockRejectedValue(apiError);

    await expect(loginWithPassword('user@test.com', 'secret123')).rejects.toThrow(
      'Account locked for 24h',
    );
  });

  it('normalizes list fields during registration requests', async () => {
    mockPost.mockResolvedValue({
      data: { success: true, message: 'registered' },
    });

    await registerUser({
      name: 'Jane',
      email: 'jane@test.com',
      topics: 'tech',
      preferredHeadlines: ['Breaking'],
    });

    expect(mockPost).toHaveBeenCalledWith('/api/auth/register', {
      name: 'Jane',
      email: 'jane@test.com',
      password: undefined,
      topics: ['tech'],
      interests: [],
      jobIndustry: undefined,
      demographic: undefined,
      location: undefined,
      lifeStage: undefined,
      newsStyle: undefined,
      newsScope: undefined,
      preferredHeadlines: ['Breaking'],
      scrollPastTopics: [],
    });
  });

  it('throws a friendly error when reset password fails without server details', async () => {
    mockPost.mockRejectedValue({
      isAxiosError: true,
      response: { data: {} },
      message: 'Bad request',
    });

    await expect(resetPassword('user@test.com', '123456', 'newpass!')).rejects.toThrow(
      'Password reset failed. Please try again.',
    );
  });
});
