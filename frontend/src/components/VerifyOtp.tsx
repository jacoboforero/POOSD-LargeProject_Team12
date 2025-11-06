import React, { useState } from 'react';
import { verifyOtp } from '../services/authApi';

interface VerifyOtpProps {
  email: string;
  onVerified: (userName: string) => void;
  onBack?: () => void;
}

const VerifyOtp = ({ email, onVerified, onBack }: VerifyOtpProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code) {
      setError('Verification code is required.');
      return;
    }

    try {
      setLoading(true);
      const session = await verifyOtp({ email, code });

      // Store token and user info
      localStorage.setItem('token', session.token);
      localStorage.setItem('user', JSON.stringify(session.user));

      // Pass the user's name (or email if name not available) to parent
      const userName = session.user.name || session.user.email;
      onVerified(userName);
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
      <h2 className="auth-heading">Verify Your Email</h2>
      <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#666' }}>
        We sent a verification code to <strong>{email}</strong>
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="question-label">Verification Code</label>
        <input
          className="auth-input"
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength={6}
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
      </form>

      {onBack && (
        <p className="auth-switch">
          <button type="button" className="auth-link" onClick={onBack}>
            Back to Login
          </button>
        </p>
      )}
    </div>
  );
};

export default VerifyOtp;
