import React, { useState } from 'react';
import { verifyResetCode } from '../services/authApi';

interface ForgotPasswordProps {
  email: string;
  onCodeVerified: (code: string) => void;
  onBack?: () => void;
}

const ForgotPassword = ({ email, onCodeVerified, onBack }: ForgotPasswordProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code) {
      setError('Reset code is required.');
      return;
    }

    if (code.length !== 6) {
      setError('Code must be 6 digits.');
      return;
    }

    try {
      setLoading(true);
      await verifyResetCode(email, code);

      // Code verified - proceed to reset password screen
      if (onCodeVerified) {
        onCodeVerified(code);
      }
    } catch (error: any) {
      console.error('Verification failed:', error?.response?.data || error?.message || error);
      const normalizedMessage =
        typeof error?.message === 'string' && error.message.trim()
          ? error.message
          : 'Verification failed. Please try again.';
      setError(normalizedMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box">
      <h2 className="auth-heading">Reset Your Password</h2>
      <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#666' }}>
        A reset code has been sent to <strong>{email}</strong>
      </p>
      <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#999', fontSize: '0.9rem', fontStyle: 'italic' }}>
        Check your email for the reset code
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="question-label">Enter 6-digit reset code</label>
        <input
          className="auth-input"
          type="text"
          placeholder=""
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength={6}
          disabled={loading}
          style={{
            letterSpacing: '0.5em',
            textAlign: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}
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
          <button type="button" className="auth-link" onClick={onBack} disabled={loading}>
            Back to login
          </button>
        </p>
      )}
    </div>
  );
};

export default ForgotPassword;
