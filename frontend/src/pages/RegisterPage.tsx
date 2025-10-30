import React from 'react';
import Register from '../components/Register';

interface Props {
  onNavigateToLogin?: () => void;
}

const RegisterPage = ({ onNavigateToLogin }: Props) => {
  return (
    <div className="auth-page">
      <Register onNavigateToLogin={onNavigateToLogin ?? (() => {})} />
    </div>
  );
};

export default RegisterPage;
