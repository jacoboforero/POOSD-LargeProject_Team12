import { useState } from 'react';
import AuthScreen from './components/AuthScreen';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import VerifyOtp from './components/VerifyOtp';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { requestPasswordReset } from './services/authApi';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'auth' | 'register' | 'verify' | 'landing' | 'forgot-password' | 'reset-password'>('auth');
  const [username, setUsername] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [resetCode, setResetCode] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleForgotPassword = async (email: string) => {
    try {
      await requestPasswordReset(email);
      setUserEmail(email);
      setCurrentPage('forgot-password');
    } catch (error: any) {
      console.error('Failed to send reset code:', error);
      alert('Failed to send reset code. Please try again.');
    }
  };

  return (
    <div className="app-root">
      <div className="page-wrapper">
        <header>
          <div className="page-header">
            <h1 className="page-title">IntelliBrief</h1>
          </div>
        </header>

        <main className="main-content">
          {currentPage === 'auth' && (
            <AuthScreen
              onNavigateToRegister={(email) => {
                setSuccessMessage('');
                setUserEmail(email);
                setCurrentPage('register');
              }}
              onShowOtp={(email) => {
                setUserEmail(email);
                setCurrentPage('verify');
              }}
              onForgotPassword={handleForgotPassword}
              successMessage={successMessage}
            />
          )}

          {currentPage === 'register' && (
            <RegisterPage
              onNavigateToLogin={() => setCurrentPage('auth')}
              onRegister={(email) => {
                setUserEmail(email);
                setCurrentPage('verify');
              }}
              initialEmail={userEmail}
            />
          )}

          {currentPage === 'verify' && (
            <VerifyOtp
              email={userEmail}
              onVerified={(name) => {
                setUsername(name);
                setCurrentPage('landing');
              }}
              onBack={() => setCurrentPage('auth')}
            />
          )}

          {currentPage === 'forgot-password' && (
            <ForgotPassword
              email={userEmail}
              onCodeVerified={(code) => {
                setResetCode(code);
                setCurrentPage('reset-password');
              }}
              onBack={() => {
                setCurrentPage('auth');
                setUserEmail('');
              }}
            />
          )}

          {currentPage === 'reset-password' && (
            <ResetPassword
              email={userEmail}
              code={resetCode}
              onPasswordReset={() => {
                setSuccessMessage('Password reset successful! Please log in with your new password.');
                setCurrentPage('auth');
                setUserEmail('');
                setResetCode('');
              }}
              onBack={() => setCurrentPage('forgot-password')}
            />
          )}

          {currentPage === 'landing' && <LandingPage username={username} />}
        </main>
      </div>
    </div>
  );
}

export default App;
