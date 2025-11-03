import React, { useState } from 'react';

interface RegisterProps {
  onNavigateToLogin?: () => void;
  onRegister?: (username: string) => void;
}

const Register = ({ onNavigateToLogin, onRegister }: RegisterProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !username || !password) {
      alert('Please fill in all fields.');
      return;
    }

    console.log('Registered:', { firstName, lastName, email, username, password });

    if (onRegister) onRegister(username); // goes back to login & shows success message
  };

  return (
    <div className="auth-box">
      <h2 className="auth-heading">Create an Account</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          className="auth-input"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="auth-input"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
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
        <button className="auth-button" type="submit">Sign Up</button>
      </form>

      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" className="auth-link" onClick={onNavigateToLogin}>
          Log in
        </button>
      </p>
    </div>
  );
};

export default Register;
