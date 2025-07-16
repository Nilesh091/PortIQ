import { useState, useEffect } from 'react';
import QueryInput from './QueryInput';
import ResponseDisplay from './ResponseDisplay';
import api from '../utils/api';
import './AdminDashboard.css';

function AdminDashboard({ user }) {
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('query');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    window.location.reload();
  };

  // Fetch users from database
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data.users);
    } catch (error) {
      setError('Failed to fetch users: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      setError('Username and password are required');
      return;
    }

    try {
      await api.post('/auth/signup', newUser);
      setShowAddUserModal(false);
      setNewUser({ username: '', password: '' });
      setError('');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to create user');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, username) => {
    if (username === 'admin') {
      setError('Cannot delete admin user');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      await api.delete(`/auth/users/${userId}`);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  // Export users to CSV
  const handleExportUsers = () => {
    const csvContent = [
      ['ID', 'Username', 'Role', 'Created At'],
      ...users.map(user => [
        user.id,
        user.username,
        user.username === 'admin' ? 'Administrator' : 'User',
        new Date(user.created_at).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Load users when users tab is active
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-main">
            <div className="admin-brand">
              <div className="admin-logo">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="admin-title">
                  FinQuery
                </h1>
                <p className="admin-subtitle">Advanced AI-Powered Portfolio Analysis</p>
              </div>
            </div>
            <div className="admin-header-right">
              <div className="admin-status">
                <div className="admin-status-indicator"></div>
                <span className="admin-status-text">System Online</span>
              </div>
              <div className="admin-user-info">
                <div className="admin-user-details">
                  <p className="admin-username">{user.username}</p>
                  <p className="admin-role">Administrator</p>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="admin-logout-btn"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-main">
        <div className="admin-grid">
          {/* Sidebar */}
          <aside className="admin-sidebar">
            <div className="admin-sidebar-card">
              <section className="admin-nav-section">
                <h3 className="admin-nav-title">Navigation</h3>
                <nav className="admin-nav">
                  <button onClick={() => setActiveTab('query')} className={`admin-nav-btn ${activeTab === 'query' ? 'active' : ''}`}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Query Agent
                  </button>
                  <button onClick={() => setActiveTab('users')} className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    User Management
                  </button>
                </nav>
              </section>


            </div>
          </aside>

          {/* Main Content */}
          <main className="admin-content">
            {activeTab === 'query' && (
              <div className="admin-content-card">
                <div className="admin-content-header">
                  <h2 className="admin-content-title">Query Agent</h2>
                  <p className="admin-content-subtitle">Advanced AI-powered query interface with full system access and portfolio analysis capabilities</p>
                </div>
                
                <div className="admin-query-layout">
                  <div className="admin-query-input-section">
                    <QueryInput setResult={setResult} isAdmin={true} />
                  </div>
                  <div className="admin-query-response-section">
                    <ResponseDisplay result={result} isAdmin={true} />
                  </div>
                </div>
              </div>
            )}



            {activeTab === 'users' && (
              <div className="admin-content-card">
                <div className="admin-users-section">
                  <div className="admin-users-header">
                    <h2 className="admin-users-title">User Management</h2>
                    <p className="admin-users-subtitle">Manage user accounts, permissions, and access controls</p>
                  </div>
                  
                  {error && (
                    <div className="admin-error-message">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  )}
                  
                  <div className="admin-users-actions">
                    <button 
                      className="admin-btn-primary"
                      onClick={() => setShowAddUserModal(true)}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add New User
                    </button>
                    <button 
                      className="admin-btn-secondary"
                      onClick={handleExportUsers}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export Users
                    </button>
                  </div>
                  
                  <div className="admin-users-table">
                    {loading ? (
                      <div className="admin-loading">
                        <div className="admin-loading-spinner"></div>
                        <p>Loading users...</p>
                      </div>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Created</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id}>
                              <td>
                                <div className="admin-user-cell">
                                  <div className="admin-user-avatar">
                                    {user.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="admin-user-info">
                                    <div className="admin-user-name">{user.username}</div>
                                    <div className="admin-user-id">ID: {user.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`admin-user-role ${user.username === 'admin' ? 'admin' : 'user'}`}>
                                  {user.username === 'admin' ? 'Administrator' : 'User'}
                                </span>
                              </td>
                              <td>{formatDate(user.created_at)}</td>
                              <td>
                                <span className="admin-user-status active">Active</span>
                              </td>
                              <td>
                                <div className="admin-user-actions">
                                  {user.username !== 'admin' && (
                                    <button 
                                      className="admin-action-btn delete"
                                      onClick={() => handleDeleteUser(user.id, user.username)}
                                      title="Delete user"
                                    >
                                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}


          </main>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Add New User</h3>
              <button 
                className="admin-modal-close"
                onClick={() => setShowAddUserModal(false)}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddUser} className="admin-modal-form">
              <div className="admin-form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  required
                  minLength={3}
                  placeholder="Enter username"
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                  minLength={6}
                  placeholder="Enter password"
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowAddUserModal(false)} className="admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <button 
        className="admin-query-fab"
        onClick={() => {
          const responseSection = document.querySelector('.admin-query-response-section');
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

export default AdminDashboard;
