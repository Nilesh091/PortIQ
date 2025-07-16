import { useState } from 'react';
import api from '../utils/api';
import './AuthModal.css';

function AuthModal({ type, isOpen, onClose, onAuthSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = type === 'login' ? '/auth/login' : '/auth/signup';
      const response = await api.post(endpoint, formData);
      
      if (type === 'login') {
        // Store token and user info from the new response format
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('isAdmin', response.data.is_admin.toString());
        
        onAuthSuccess({
          username: response.data.username,
          isAdmin: response.data.is_admin,
          token: response.data.access_token
        });
      } else {
        // For signup, show success message and close modal
        alert('User created successfully! Please login.');
        onClose();
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>{type === 'login' ? 'Login' : 'Sign Up'}</h2>
          <button className="auth-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              type === 'login' ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="auth-modal-footer">
          {type === 'login' ? (
            <p>Don't have an account? <button className="link-btn" onClick={() => onClose()}>Sign up</button></p>
          ) : (
            <p>Already have an account? <button className="link-btn" onClick={() => onClose()}>Login</button></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal; 