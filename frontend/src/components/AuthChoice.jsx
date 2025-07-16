import { useState } from 'react';
import './AuthChoice.css';

function AuthChoice({ onAuthChoice }) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleChoice = (choice) => {
    onAuthChoice(choice);
    setIsVisible(false);
  };

  return (
    <div className="auth-choice-container">
      <button 
        className="auth-toggle-btn"
        onClick={toggleVisibility}
        aria-label="Authentication options"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10,17 15,12 10,7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
      </button>
      
      {isVisible && (
        <div className="auth-choice-dropdown">
          <button 
            className="auth-choice-btn login-btn"
            onClick={() => handleChoice('login')}
          >
            Login
          </button>
          <button 
            className="auth-choice-btn signup-btn"
            onClick={() => handleChoice('signup')}
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  );
}

export default AuthChoice; 