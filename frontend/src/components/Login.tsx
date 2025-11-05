import React, { useState } from 'react';
import { loginUser, verifyOtp } from '../services/authApi';

interface LoginProps {
  onNavigateToRegister?: () => void;
  onLogin?: (email: string, token: string) => void;
  successMessage?: string;
}

const Login = ({ onNavigateToRegister, onLogin, successMessage }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [loginSent, setLoginSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required.');
      return;
    }

    try {
      setLoading(true);
      await loginUser(email);
      setLoginSent(true);
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }

    try {
      setLoading(true);
      const session = await verifyOtp({ email, code: otp });
      if (onLogin) onLogin(session.user.name || email, session.token);
    } catch (error: any) {
      console.error('Verification failed:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box">
      <h2 className="auth-heading">Your headlines missed you.</h2>

      {successMessage && (
        <p style={{ color: '#28a745', textAlign: 'center', marginBottom: '1rem' }}>
          {successMessage}
        </p>
      )}

      {!loginSent ? (
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="question-label">Email</label>
          <input
            className="auth-input"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
              {error}
            </div>
          )}

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Login Code'}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleVerifyOtp}>
          <p style={{ color: '#28a745', textAlign: 'center', marginBottom: '1rem' }}>
            Verification code sent to {email}
          </p>

          <label className="question-label">Enter Verification Code</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            autoFocus
          />

          {error && (
            <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
              {error}
            </div>
          )}

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <button
            type="button"
            className="auth-link"
            onClick={() => setLoginSent(false)}
            style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}
          >
            Change email
          </button>
        </form>
      )}

      <p className="auth-switch">
        Don't have an account?{' '}
        <button type="button" className="auth-link" onClick={onNavigateToRegister}>
          Sign up
        </button>
      </p>
    </div>
  );
};

export default Login;
