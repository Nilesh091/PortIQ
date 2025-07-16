import { useState } from 'react';
import QueryInput from '../components/QueryInput';
import ResponseDisplay from '../components/ResponseDisplay';

function Dashboard() {
  const [result, setResult] = useState(null);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Wealth Portfolio RAG Agent</h2>
      <QueryInput setResult={setResult} />
      <ResponseDisplay result={result} />
    </div>
  );
}

export default Dashboard;
