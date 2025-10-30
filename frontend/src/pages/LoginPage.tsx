import React from 'react';
import Login from '../components/Login';

interface Props {
  onNavigateToRegister?: () => void;
  onLogin?: (username: string) => void;
  successMessage?: string;
}

const LoginPage = ({ onNavigateToRegister, onLogin, successMessage }: Props) => {
  return <Login onNavigateToRegister={onNavigateToRegister} onLogin={onLogin} successMessage={successMessage} />;
};

export default LoginPage;
