import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

const RedditAuth: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleRedditLogin = () => {
    try {
      // Reddit OAuth configuration
      const clientId = 'o9ezEMqjvDl0WZ-oUhb8fw';
      if (!clientId) {
        setError('Reddit Client ID is not configured');
        return;
      }

      // Use the correct callback URL that matches your Reddit app configuration
      const redirectUri = encodeURIComponent('http://localhost:5173/auth/callback');
      const scope = encodeURIComponent('identity read');
      const state = Math.random().toString(36).substring(7);
      const duration = 'permanent'; // Changed to permanent for refresh token support
      
      // Store state for verification
      localStorage.setItem('redditAuthState', state);
      
      // Construct Reddit OAuth URL with proper encoding
      const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${redirectUri}&scope=${scope}&duration=${duration}`;
      
      window.location.href = authUrl;
    } catch (err) {
      console.error('Reddit auth error:', err);
      setError('Failed to initialize Reddit authentication');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-orange-400 mb-4">Welcome to Karma Kingdom</h2>
        <p className="text-gray-300 mb-6">
          Connect with your Reddit account to start playing and earning karma!
        </p>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        <button
          onClick={handleRedditLogin}
          className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
        >
          <LogIn size={20} />
          Login with Reddit
        </button>
        <p className="text-gray-400 text-sm mt-4">
          Make sure you're logged into Reddit before connecting.
        </p>
      </div>
    </div>
  );
};

export default RedditAuth;