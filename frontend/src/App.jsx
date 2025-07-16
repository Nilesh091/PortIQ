import { useState, useEffect } from 'react';
import AuthChoice from './components/AuthChoice';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import './App.css';

function App() {
  const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' });
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (token && username) {
      setUser({
        username,
        isAdmin,
        token
      });
    }
    setIsLoading(false);
  }, []);

  const handleAuthChoice = (choice) => {
    setAuthModal({ isOpen: true, type: choice });
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setAuthModal({ isOpen: false, type: 'login' });
  };

  const handleAuthClose = () => {
    setAuthModal({ isOpen: false, type: 'login' });
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return user.isAdmin ? (
      <AdminDashboard user={user} />
    ) : (
      <UserDashboard user={user} />
    );
  }

  return (
    <div className="app">
      <div className="welcome-screen">
        <div className="welcome-content">
          <div className="hero-section">
            <h1 className="hero-title">
              Welcome to PortIQ — Your AI-Powered Wealth Intelligence Assistant
            </h1>
            <p className="hero-subtitle">
              Ask natural language questions like:
            </p>
            <div className="example-queries">
              <div className="query-example">
                <span className="query-bullet">•</span>
                Who are the top 3 clients by total portfolio value?
              </div>
              <div className="query-example">
                <span className="query-bullet">•</span>
                Show me the investment breakup for Nilesh Ranjan.
              </div>
              <div className="query-example">
                <span className="query-bullet">•</span>
                Which RM manages the highest net-worth clients?
              </div>
            </div>
            <div className="hero-tagline">
              <span className="tagline-icon">📊</span>
              <span className="tagline-text">Query. Understand. Decide — Smarter, Faster.</span>
            </div>
          </div>
          
          <div className="features-section">
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="feature-title">AI-Powered Analysis</h3>
                <p className="feature-description">Get intelligent insights about your portfolio performance with advanced natural language processing</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="feature-title">Real-time Data</h3>
                <p className="feature-description">Access up-to-date market information and portfolio trends with live data integration</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="feature-title">Smart Recommendations</h3>
                <p className="feature-description">Receive personalized investment advice and portfolio optimization suggestions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AuthChoice onAuthChoice={handleAuthChoice} />
      
      <AuthModal
        type={authModal.type}
        isOpen={authModal.isOpen}
        onClose={handleAuthClose}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
