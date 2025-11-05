import React, { useState } from 'react';
import { loginUser } from '../services/authApi';

interface LoginProps {
  onNavigateToRegister?: () => void;
  onLogin?: (email: string) => void;
  successMessage?: string;
}

const Login = ({ onNavigateToRegister, onLogin, successMessage }: LoginProps) => {
  const [email, setEmail] = useState('');
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
      if (onLogin) onLogin(email);
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
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

      {loginSent && (
        <p style={{ color: '#28a745', textAlign: 'center', marginBottom: '1rem' }}>
          Login link sent! Please check your email for verification.
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="question-label">Email</label>
        <input
          className="auth-input"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loginSent}
        />
        
        {error && (
          <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
            {error}
          </div>
        )}

        <button 
          className="auth-button" 
          type="submit" 
          disabled={loading || loginSent}
        >
          {loading ? 'Sending...' : loginSent ? 'Link Sent' : 'Send Login Link'}
        </button>
      </form>

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
