import React, { useState } from 'react';
import { resetPassword } from '../services/authApi';

interface ResetPasswordProps {
  email: string;
  code: string;
  onPasswordReset: () => void;
  onBack?: () => void;
}

const ResetPassword = ({ email, code, onPasswordReset, onBack }: ResetPasswordProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('Password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email, code, newPassword);

      // Password reset successful - return to login
      if (onPasswordReset) {
        onPasswordReset();
      }
    } catch (error: any) {
      console.error('Password reset failed:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error?.details ||
                          error.response?.data?.error?.message ||
                          error.response?.data?.message ||
                          error.message ||
                          'Password reset failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box">
      <h2 className="auth-heading">Create New Password</h2>
      <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
        Enter your new password for <strong>{email}</strong>
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="question-label">New Password</label>
        <div style={{ position: 'relative' }}>
          <input
            className="auth-input"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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

        <label className="question-label">Confirm New Password</label>
        <div style={{ position: 'relative' }}>
          <input
            className="auth-input"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            style={{ paddingRight: '40px' }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

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
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      {onBack && (
        <p className="auth-switch">
          <button type="button" className="auth-link" onClick={onBack} disabled={loading}>
            Back
          </button>
        </p>
      )}
    </div>
  );
};

export default ResetPassword;
