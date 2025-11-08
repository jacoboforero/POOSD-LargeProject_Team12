import React, { useState } from 'react';
import { checkUserExists, loginWithPassword } from '../services/authApi';

interface AuthScreenProps {
  onNavigateToRegister?: (email: string) => void;
  onShowOtp?: (email: string) => void;
  onForgotPassword?: (email: string) => void;
  successMessage?: string;
}

const AuthScreen = ({ onNavigateToRegister, onShowOtp, onForgotPassword, successMessage }: AuthScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required.');
      return;
    }

    try {
      setIsCheckingUser(true);
      const userExists = await checkUserExists(email);

      if (userExists) {
        // Existing user - show password field
        setShowPasswordField(true);
      } else {
        // New user - navigate to registration
        if (onNavigateToRegister) {
          onNavigateToRegister(email);
        }
      }
    } catch (error: any) {
      console.error('Error checking user:', error);
      setError('Error checking user. Please try again.');
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Password is required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await loginWithPassword(email, password);

      // Password verified - show OTP field
      if (onShowOtp) {
        onShowOtp(email);
      }
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error?.details ||
                          error.response?.data?.error?.message ||
                          error.response?.data?.message ||
                          error.message ||
                          'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setShowPasswordField(false);
    setPassword('');
    setError('');
  };

  return (
    <div className="auth-box">
      <h2 className="auth-heading">
        {showPasswordField ? 'Welcome Back' : 'Welcome'}
      </h2>

      {successMessage && (
        <p style={{ color: '#28a745', textAlign: 'center', marginBottom: '1rem' }}>
          {successMessage}
        </p>
      )}

      {showPasswordField ? (
        // Password login screen
        <>
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#666' }}>
            Enter your password to continue
          </p>

          <form className="auth-form" onSubmit={handlePasswordLogin}>
            <label className="question-label">Email</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              disabled
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />

            <label className="question-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {error && (
              <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
                {error}
              </div>
            )}

            {onForgotPassword && (
              <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => onForgotPassword(email)}
                  disabled={loading}
                  style={{ fontSize: '0.9rem' }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              className="auth-button"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>

          <p className="auth-switch">
            <button
              type="button"
              className="auth-link"
              onClick={handleBackToEmail}
              disabled={loading}
            >
              Back to email
            </button>
          </p>
        </>
      ) : (
        // Email entry screen
        <>
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#666' }}>
            Enter your email to continue
          </p>

          <form className="auth-form" onSubmit={handleEmailSubmit}>
            <label className="question-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isCheckingUser}
            />

            {error && (
              <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
                {error}
              </div>
            )}

            <button
              className="auth-button"
              type="submit"
              disabled={isCheckingUser}
            >
              {isCheckingUser ? 'Checking...' : 'Continue'}
            </button>
          </form>

          <p className="auth-switch">
            New to IntelliBrief?{' '}
            <span style={{ color: '#666' }}>Enter your email above to get started</span>
          </p>
        </>
      )}
    </div>
  );
};

export default AuthScreen;
