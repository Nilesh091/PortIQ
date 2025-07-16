import { useState, useEffect } from 'react';
import api from '../utils/api';
import './QueryInput.css';

function QueryInput({ setResult, isAdmin = false }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sampleQueries, setSampleQueries] = useState([]);

  const defaultExampleQueries = [
    "Show me the top 3 clients by total portfolio value",
    "What is the asset allocation for Nikesh Sahoo's portfolio?",
    "Who holds the most Tesla stock?",
    "Show me all clients and their portfolio values",
    "What are the total investments by asset type?"
  ];

  useEffect(() => {
    // Fetch sample queries from the backend
    const fetchSampleQueries = async () => {
      try {
        const response = await api.get('/rag/sample-queries');
        setSampleQueries(response.data.sample_queries);
      } catch (error) {
        console.log('Using default sample queries');
        setSampleQueries(defaultExampleQueries);
      }
    };

    fetchSampleQueries();
  }, []);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const requestData = {
        question: query
      };

      const res = await api.post('/rag/query', requestData);
      
      // Format the response for the UI
      const formattedResult = {
        question: res.data.question,
        sql_query: res.data.sql_query,
        result: res.data.result,
        visualization: res.data.visualization,
        query_type: res.data.query_type,
        table_data: res.data.table_data,
        summary: res.data.summary,
        error: res.data.error,
        mode: res.data.mode,
        timestamp: new Date().toISOString()
      };
      
      setResult(formattedResult);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error communicating with server';
      setError(errorMessage);
      setResult({ error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="query-input-container">
      <div className="query-input-header">
        <h2 className="query-input-title">
          {isAdmin ? '🔧 Admin RAG Query Interface' : '💬 Ask about your portfolio'}
        </h2>
        <p className="query-input-subtitle">
          {isAdmin 
            ? 'Natural language queries with AI-powered portfolio analysis and visualizations'
            : 'Ask questions about your investments, performance, and portfolio insights'
          }
        </p>
      </div>

      <form className="query-form" onSubmit={(e) => e.preventDefault()}>
        <div className="query-input-group">
          <label htmlFor="query-input" className="query-label">
            Your Question
          </label>
          <textarea
            id="query-input"
            value={query}
            placeholder="Enter your natural language query here... (e.g., 'Show me the top 3 clients by portfolio value')"
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="query-textarea"
            rows={4}
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="query-error-message">
            <svg className="query-error-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <button 
          onClick={handleSubmit} 
          disabled={isLoading || !query.trim()}
          className="query-submit-btn"
        >
          {isLoading ? (
            <>
              <div className="query-loading-spinner"></div>
              Processing...
            </>
          ) : (
            <>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
              Submit Query
            </>
          )}
        </button>
      </form>

      <div className="query-examples">
        <h3 className="query-examples-title">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Example Queries
        </h3>
        <div className="query-examples-list">
          {sampleQueries.map((example, index) => (
            <div
              key={index}
              className="query-example-item"
              onClick={() => handleExampleClick(example)}
            >
              {example}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QueryInput;