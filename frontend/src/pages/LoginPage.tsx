import React from 'react';
import Login from '../components/Login';

interface Props {
  onNavigateToRegister?: () => void;
}

const LoginPage = ({ onNavigateToRegister }: Props) => {
  return (
    <div className="auth-page">
      <Login onNavigateToRegister={onNavigateToRegister ?? (() => {})} />
    </div>
  );
};

export default LoginPage;
