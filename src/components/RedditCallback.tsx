import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RedditCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const storedState = localStorage.getItem('redditAuthState');

        if (!code) {
          throw new Error('No authorization code received');
        }

        if (state !== storedState) {
          throw new Error('State mismatch - possible CSRF attack');
        }

        // Store the code temporarily
        localStorage.setItem('redditAuthCode', code);
        localStorage.removeItem('redditAuthState');

        // Redirect back to the main app
        navigate('/');
      } catch (err) {
        console.error('Reddit callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
};

export default RedditCallback;