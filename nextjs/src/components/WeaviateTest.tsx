'use client';

import { useState } from 'react';
import { testWeaviateConnection } from '@/services/api';

export default function WeaviateTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await testWeaviateConnection();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-base-200 border-base-300">
      <h2 className="text-xl font-semibold mb-4 text-base-content">Weaviate Connection Test</h2>
      
      <button
        onClick={handleTest}
        disabled={loading}
        className={`btn ${loading ? 'btn-disabled' : 'btn-primary'}`}
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-error/20 text-error-content rounded-md">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-base-content mb-2">Result:</h3>
          <pre className="bg-base-300 p-3 rounded overflow-auto max-h-60 text-sm text-base-content/70">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 