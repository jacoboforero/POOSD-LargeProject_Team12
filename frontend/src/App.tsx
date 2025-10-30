import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'landing'>('login');
  const [username, setUsername] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>(''); // new state for messages

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
              onLogin={(name) => {
                setUsername(name);
                setCurrentPage('landing');
              }}
              successMessage={successMessage} // pass message
            />
          )}

          {currentPage === 'register' && (
            <RegisterPage
              onNavigateToLogin={() => setCurrentPage('login')}
              onRegister={(name) => {
                setUsername(name); // optional, could skip
                setSuccessMessage('Registration successful! Please log in.');
                setCurrentPage('login'); // go back to login
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
