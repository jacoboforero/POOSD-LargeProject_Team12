import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'landing'>('login');
  const [username, setUsername] = useState<string>('');
  const [token, setToken] = useState<string>('');
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
              onLogin={(email, authToken) => {
                setUsername(email);
                setToken(authToken);
                setCurrentPage('landing');
              }}
              successMessage={successMessage}
            />
          )}

          {currentPage === 'register' && (
            <RegisterPage
              onNavigateToLogin={() => setCurrentPage('login')}
              onRegister={(email, authToken) => {
                setUsername(email);
                setToken(authToken);
                setCurrentPage('landing');
              }}
            />
          )}

          {currentPage === 'landing' && <LandingPage username={username} token={token} />}
        </main>
      </div>
    </div>
  );
}

export default App;
