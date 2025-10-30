import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'register'>('login');

  return (
    <div className="app-root">
      <div className="page-wrapper">
        <header>
          <div className="page-header">
            <h1 className="page-title">IntelliBrief</h1>
          </div>
        </header>

        <main className="main-content">
          {currentPage === 'login' ? (
            <LoginPage onNavigateToRegister={() => setCurrentPage('register')} />
          ) : (
            <RegisterPage onNavigateToLogin={() => setCurrentPage('login')} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
