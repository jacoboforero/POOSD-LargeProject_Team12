import React from 'react';
import Register from '../components/Register';

interface Props {
  onNavigateToLogin?: () => void;
  onRegister?: (username: string) => void;
}

const RegisterPage = ({ onNavigateToLogin, onRegister }: Props) => {
  return <Register onNavigateToLogin={onNavigateToLogin} onRegister={onRegister} />;
};

export default RegisterPage;
