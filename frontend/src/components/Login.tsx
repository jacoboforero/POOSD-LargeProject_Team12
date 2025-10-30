import React, { useState } from 'react';

interface LoginProps {
  onNavigateToRegister?: () => void;
  onLogin?: (username: string) => void;
  successMessage?: string;
}

const Login = ({ onNavigateToRegister, onLogin, successMessage }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin) onLogin(username);
  };

  return (
    <div className="auth-box">
      <h2 className="auth-heading">Welcome Back</h2>

      {successMessage && (
        <p style={{ color: '#dff0d8', textAlign: 'center', marginBottom: '1rem' }}>
          {successMessage}
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          className="auth-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="auth-button" type="submit">Log In</button>
      </form>

      <p className="auth-switch">
        Don’t have an account?{' '}
        <button type="button" className="auth-link" onClick={onNavigateToRegister}>
          Sign up
        </button>
      </p>
    </div>
  );
};

export default Login;
