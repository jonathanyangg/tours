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
    <div className="p-4 border rounded-lg bg-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-white">Weaviate Connection Test</h2>
      
      <button
        onClick={handleTest}
        disabled={loading}
        className={`px-4 py-2 rounded ${
          loading 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-900 text-red-200 rounded-md">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-white mb-2">Result:</h3>
          <pre className="bg-gray-900 p-3 rounded overflow-auto max-h-60 text-sm text-gray-300">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 