import { useState } from 'react';
import QueryInput from './QueryInput';
import ResponseDisplay from './ResponseDisplay';
import './UserDashboard.css';

function UserDashboard({ user }) {
  const [result, setResult] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    window.location.reload();
  };

  const handleQuerySubmit = (newResult) => {
    setResult(newResult);
    // Add to query history
    setQueryHistory(prev => [
      {
        id: Date.now(),
        query: newResult.query || 'Query',
        timestamp: new Date().toLocaleString(),
        response: newResult.response || 'No response'
      },
      ...prev.slice(0, 9) // Keep only last 10 queries
    ]);
  };

  return (
    <div className="user-dashboard">
      <div className="user-header">
        <div className="user-header-left">
          <h1>PortIQ</h1>
          <span className="user-badge">User Dashboard</span>
        </div>
        <div className="user-header-right">
          <div className="user-info">
            <span className="username">Welcome, {user.username}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="user-content">
        <div className="user-main">
          <div className="query-section">
            <div className="section-header">
              <h2>Ask Your Question</h2>
              <p>Get insights about your wealth portfolio using natural language</p>
            </div>
            
            <div className="user-query-layout">
              <div className="user-query-input-section">
                <QueryInput setResult={handleQuerySubmit} isAdmin={false} />
              </div>
              <div className="user-query-response-section">
                <ResponseDisplay result={result} isAdmin={false} />
              </div>
            </div>
          </div>

          <div className="user-sidebar">
            <div className="sidebar-section">
              <h3>Quick Tips</h3>
              <div className="tips-list">
                <div className="tip-item">
                  <div className="tip-icon">💡</div>
                  <div className="tip-content">
                    <h4>Portfolio Analysis</h4>
                    <p>Ask about your portfolio performance, risk assessment, or asset allocation</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">📊</div>
                  <div className="tip-content">
                    <h4>Market Insights</h4>
                    <p>Get information about market trends, sector analysis, or economic indicators</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">🎯</div>
                  <div className="tip-content">
                    <h4>Investment Advice</h4>
                    <p>Request recommendations for portfolio optimization or new investment opportunities</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Recent Queries</h3>
              <div className="query-history">
                {queryHistory.length === 0 ? (
                  <p className="no-history">No recent queries</p>
                ) : (
                  queryHistory.map((item) => (
                    <div key={item.id} className="history-item">
                      <div className="history-query">{item.query}</div>
                      <div className="history-time">{item.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Your Stats</h3>
              <div className="user-stats">
                <div className="stat-item">
                  <span className="stat-number">{queryHistory.length}</span>
                  <span className="stat-label">Queries Made</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">Today</span>
                  <span className="stat-label">Last Active</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">Standard</span>
                  <span className="stat-label">Access Level</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <button 
        className="user-query-fab"
        onClick={() => {
          const responseSection = document.querySelector('.user-query-response-section');
          if (responseSection) {
            responseSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        title="Scroll to results"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </div>
  );
}

export default UserDashboard; 