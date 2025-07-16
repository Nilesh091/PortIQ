import './ResponseDisplay.css';
import DataChart from './DataChart';
import './DataChart.css';

function ResponseDisplay({ result, isAdmin = false }) {
  if (!result) return null;

  const formatTimestamp = (timestamp) => {
    if (timestamp) {
      return new Date(timestamp).toLocaleString();
    }
    return new Date().toLocaleString();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResponse = (text) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rag-response-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shouldShowSQL = (question, tableData) => {
    // Always return false to hide SQL queries
    return false;
  };

  const renderSQLQuery = (sqlQuery, question, tableData) => {
    if (!sqlQuery || !shouldShowSQL(question, tableData)) return null;
    
    return (
      <div className="response-sql-section">
        <h4 className="response-sql-title">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          Generated SQL Query
        </h4>
        <div className="response-sql-code">
          <pre>{sqlQuery}</pre>
          <button 
            className="response-copy-btn"
            onClick={() => copyToClipboard(sqlQuery)}
            title="Copy SQL query"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const renderTableData = (tableData) => {
    if (!tableData || !Array.isArray(tableData) || tableData.length === 0) return null;

    const columns = Object.keys(tableData[0]);
    
    return (
      <div className="response-table-section">
        <h4 className="response-table-title">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          Results Table
        </h4>
        <div className="response-table-container">
          <table className="response-data-table">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={index}>{column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {typeof row[column] === 'number' 
                        ? row[column].toLocaleString() 
                        : row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSummary = (summary) => {
    // Always return null to hide summary
    return null;
  };

  const shouldShowChart = (question, tableData) => {
    if (!question || !tableData || !Array.isArray(tableData)) return false;
    
    const questionLower = question.toLowerCase();
    
    // Don't show charts for simple lookup queries
    if (questionLower.includes('who holds') || 
        questionLower.includes('who has') ||
        questionLower.includes('which client') ||
        questionLower.includes('find') ||
        (questionLower.includes('show me') && questionLower.includes('tesla'))) {
      return false;
    }
    
    // Always show charts for asset allocation queries, even with few rows
    if (questionLower.includes('asset allocation') || 
        questionLower.includes('portfolio') && questionLower.includes('allocation') ||
        questionLower.includes('breakdown') ||
        questionLower.includes('composition')) {
      return true;
    }
    
    // Don't show charts if we have very little data (1-2 rows) for non-allocation queries
    if (tableData.length <= 2) {
      return false;
    }
    
    // Don't show charts if data structure is not suitable
    if (tableData.length > 0) {
      const firstItem = tableData[0];
      const columns = Object.keys(firstItem);
      if (columns.length < 2) return false;
    }
    
    return true;
  };

  const renderVisualization = (visualization, tableData, question) => {
    // Use our new DataChart component if we have table data and should show chart
    if (tableData && Array.isArray(tableData) && tableData.length > 0 && shouldShowChart(question, tableData)) {
      return (
        <div className="response-visualization">
          <h4 className="response-viz-title">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Interactive Chart
          </h4>
          <DataChart 
            data={tableData} 
            title={question}
            chartType="auto"
          />
        </div>
      );
    }

    // Fallback to original visualization if no table data
    if (!visualization || !visualization.content) return null;

    if (visualization.type === 'chart') {
      return (
        <div className="response-visualization">
          <h4 className="response-viz-title">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Chart Visualization
          </h4>
          <div 
            className="response-chart-container"
            dangerouslySetInnerHTML={{ __html: visualization.content }}
          />
        </div>
      );
    } else if (visualization.type === 'table') {
      return (
        <div className="response-visualization">
          <h4 className="response-viz-title">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Data Table
          </h4>
          <div 
            className="response-table-container"
            dangerouslySetInnerHTML={{ __html: visualization.content }}
          />
        </div>
      );
    } else {
      return (
        <div className="response-visualization">
          <h4 className="response-viz-title">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Results
          </h4>
          <div className="response-text-content">
            {visualization.content}
          </div>
        </div>
      );
    }
  };

  const renderRawResult = (result) => {
    if (!result) return null;
    
    // Handle different types of result data
    let displayContent = '';
    
    if (typeof result === 'string') {
      displayContent = result;
    } else if (Array.isArray(result)) {
      displayContent = JSON.stringify(result, null, 2);
    } else if (typeof result === 'object') {
      displayContent = JSON.stringify(result, null, 2);
    } else {
      displayContent = String(result);
    }
    
    return (
      <div className="response-raw-section">
        <h4 className="response-raw-title">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          Raw Data
        </h4>
        <div className="response-raw-content">
          <pre>{displayContent}</pre>
        </div>
      </div>
    );
  };

  return (
    <div className="response-display-container">
      <div className={`response-card ${result.question ? 'loaded' : ''}`}>
        <div className="response-header">
          <h3 className="response-title">
            <svg className="response-title-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {isAdmin ? 'RAG Agent Response' : 'AI Response'}
          </h3>
          <div className="response-meta">
            <span className="response-timestamp">{formatTimestamp(result.timestamp)}</span>
            <div className="response-actions">
              <button 
                className="response-action-btn"
                onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                title="Copy to clipboard"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
              <button 
                className="response-action-btn"
                onClick={() => downloadResponse(JSON.stringify(result, null, 2))}
                title="Download response"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="response-content">
          {result.error ? (
            <div className="response-error">
              <svg className="response-error-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {result.error}
            </div>
          ) : (
            <>
              {result.question && (
                <div className="response-question">
                  <h4 className="response-question-title">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Your Question
                  </h4>
                  <p className="response-question-text">{result.question}</p>
                </div>
              )}

              {renderSQLQuery(result.sql_query, result.question, result.table_data)}
              {renderSummary(result.summary)}
              {renderTableData(result.table_data)}
              {renderVisualization(result.visualization, result.table_data, result.question)}
              {/* Raw data display removed as per user request */}
              {/* {renderRawResult(result.result)} */}

              {isAdmin && result.query_type && (
                <div className="response-meta-info">
                  <h4 className="response-meta-title">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Query Analysis
                  </h4>
                  <div className="response-meta-details">
                    <div className="response-meta-item">
                      <span className="response-meta-label">Query Type:</span>
                      <span className="response-meta-value">{result.query_type}</span>
                    </div>
                    {result.mode && (
                      <div className="response-meta-item">
                        <span className="response-meta-label">Mode:</span>
                        <span className="response-meta-value">{result.mode}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResponseDisplay;
  