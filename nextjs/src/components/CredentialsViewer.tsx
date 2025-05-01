import { useState } from 'react';
import { createClient } from '@/app/supabase/client';
import { getUserCredentials } from '@/services/api';

export default function CredentialsViewer() {
  const [credentials, setCredentials] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  const fetchCredentials = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Initialize Supabase client
      const supabase = createClient();
      
      // Get the session which contains the JWT token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session. Please log in first.');
      }
      
      // Get the access token (JWT)
      const token = session.access_token;
      
      // Use the token to fetch credentials from the API
      const response = await getUserCredentials(token);
      
      setCredentials(response.data);
      setShowCredentials(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credentials');
      console.error('Error fetching credentials:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCredentialsVisibility = () => {
    setShowCredentials(!showCredentials);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-xl mx-auto my-4">
      <h2 className="text-xl font-semibold mb-4">API Credentials</h2>
      
      <button
        onClick={fetchCredentials}
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 mb-4"
      >
        {loading ? 'Loading...' : 'Fetch API Credentials'}
      </button>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-4">
          {error}
        </div>
      )}
      
      {credentials && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Your Credentials</h3>
            <button 
              onClick={toggleCredentialsVisibility}
              className="text-sm text-blue-600 underline"
            >
              {showCredentials ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showCredentials && (
            <div className="bg-gray-100 p-3 rounded overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(credentials, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>This component demonstrates secure retrieval of API credentials using JWT authentication.</p>
        <p>Your access token is automatically included in the request header to authenticate with the backend.</p>
      </div>
    </div>
  );
} 