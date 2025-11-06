import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import VerifyOtp from './components/VerifyOtp';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'verify' | 'landing'>('login');
  const [username, setUsername] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  return (
    <div className="app-root">
      <div className="page-wrapper">
        <header>
          <div className="page-header">
            <h1 className="page-title">IntelliBrief</h1>
          </div>
        </header>

        <main className="main-content">
          {currentPage === 'login' && (
            <LoginPage
              onNavigateToRegister={() => {
                setSuccessMessage('');
                setCurrentPage('register');
              }}
              onLogin={(email) => {
                setUserEmail(email);
                setCurrentPage('verify');
              }}
              successMessage={successMessage}
            />
          )}

          {currentPage === 'register' && (
            <RegisterPage
              onNavigateToLogin={() => setCurrentPage('login')}
              onRegister={(email) => {
                setUserEmail(email);
                setCurrentPage('verify');
              }}
            />
          )}

          {currentPage === 'verify' && (
            <VerifyOtp
              email={userEmail}
              onVerified={(name) => {
                setUsername(name);
                setCurrentPage('landing');
              }}
              onBack={() => setCurrentPage('login')}
            />
          )}

          {currentPage === 'landing' && <LandingPage username={username} />}
        </main>
      </div>
    </div>
  );
}

export default App;
