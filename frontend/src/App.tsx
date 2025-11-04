import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'landing'>('login');
  const [username, setUsername] = useState<string>('');
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
                // Email verification link sent - user will verify via email
                // After verification, they'll be logged in
                setUsername(email);
                // Note: In a real app, you'd wait for email verification before redirecting
                // For now, we'll show a success message
              }}
              successMessage={successMessage}
            />
          )}

          {currentPage === 'register' && (
            <RegisterPage
              onNavigateToLogin={() => setCurrentPage('login')}
              onRegister={() => {
                setSuccessMessage('Registration successful! Please log in.');
                setCurrentPage('login');
              }}
            />
          )}

          {currentPage === 'landing' && <LandingPage username={username} />}
        </main>
      </div>
    </div>
  );
}

export default App;
