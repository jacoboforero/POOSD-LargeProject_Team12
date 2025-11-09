import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthScreen from './AuthScreen';
import { checkUserExists, loginWithPassword } from '../services/authApi';

vi.mock('../services/authApi', () => ({
  checkUserExists: vi.fn(),
  loginWithPassword: vi.fn(),
}));

const mockedCheckUserExists = vi.mocked(checkUserExists);
const mockedLoginWithPassword = vi.mocked(loginWithPassword);

describe('AuthScreen', () => {
  beforeEach(() => {
    mockedCheckUserExists.mockReset();
    mockedLoginWithPassword.mockReset();
  });

  it('asks for a password when the email already exists', async () => {
    mockedCheckUserExists.mockResolvedValue(true);
    const user = userEvent.setup();

    render(<AuthScreen />);

    await user.type(screen.getByPlaceholderText(/your\.email@example\.com/i), 'member@test.com');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => expect(mockedCheckUserExists).toHaveBeenCalled());

    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
  });

  it('sends first-time users to registration', async () => {
    mockedCheckUserExists.mockResolvedValue(false);
    const handleNavigate = vi.fn();
    const user = userEvent.setup();

    render(<AuthScreen onNavigateToRegister={handleNavigate} />);

    await user.type(screen.getByPlaceholderText(/your\.email@example\.com/i), 'new@user.com');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => expect(handleNavigate).toHaveBeenCalledWith('new@user.com'));
  });

  it('validates password length before submitting login', async () => {
    mockedCheckUserExists.mockResolvedValue(true);
    const user = userEvent.setup();

    render(<AuthScreen />);

    await user.type(screen.getByPlaceholderText(/your\.email@example\.com/i), 'short@test.com');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => expect(mockedCheckUserExists).toHaveBeenCalled());

    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    await user.type(passwordInput, '123');
    await user.click(screen.getByRole('button', { name: /^Continue$/i }));

    expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    expect(mockedLoginWithPassword).not.toHaveBeenCalled();
  });

  it('submits valid credentials and forwards to OTP verification', async () => {
    mockedCheckUserExists.mockResolvedValue(true);
    mockedLoginWithPassword.mockResolvedValue({ success: true, message: 'ok' });
    const handleShowOtp = vi.fn();
    const user = userEvent.setup();

    render(<AuthScreen onShowOtp={handleShowOtp} />);

    await user.type(screen.getByPlaceholderText(/your\.email@example\.com/i), 'member@test.com');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => expect(mockedCheckUserExists).toHaveBeenCalled());

    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    await user.type(passwordInput, 'secret123');
    await user.click(screen.getByRole('button', { name: /^Continue$/i }));

    await waitFor(() =>
      expect(mockedLoginWithPassword).toHaveBeenCalledWith('member@test.com', 'secret123'),
    );
    expect(handleShowOtp).toHaveBeenCalledWith('member@test.com');
  });
});
