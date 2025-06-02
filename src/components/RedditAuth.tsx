import React from 'react';
import { LogIn } from 'lucide-react';

const RedditAuth: React.FC = () => {
  const handleRedditLogin = () => {
    // Reddit OAuth configuration
    const clientId = import.meta.env.VITE_REDDIT_CLIENT_ID;
    const redirectUri = encodeURIComponent('http://localhost:5173/auth/callback');
    const scope = encodeURIComponent('identity read');
    const state = Math.random().toString(36).substring(7);
    
    // Store state for verification
    localStorage.setItem('redditAuthState', state);
    
    // Construct Reddit OAuth URL
    const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${redirectUri}&scope=${scope}&duration=temporary`;
    
    // Redirect to Reddit OAuth
    window.location.href = authUrl;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-orange-400 mb-4">Welcome to Karma Kingdom</h2>
        <p className="text-gray-300 mb-6">
          Connect with your Reddit account to start playing and earning karma!
        </p>
        <button
          onClick={handleRedditLogin}
          className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
        >
          <LogIn size={20} />
          Login with Reddit
        </button>
      </div>
    </div>
  );
};

export default RedditAuth;