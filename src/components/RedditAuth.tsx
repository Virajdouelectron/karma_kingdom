import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

const RedditAuth: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa('o9ezEMqjvDl0WZ-oUhb8fw:8lwxPTL0TWyEs2uJJ-vNr_eIm1JAVg')}`
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: credentials.username,
          password: credentials.password
        })
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      localStorage.setItem('redditAccessToken', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('redditRefreshToken', data.refresh_token);
      }

      window.location.href = '/';
    } catch (err) {
      console.error('Reddit auth error:', err);
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Reddit Username"
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Reddit Password"
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-orange-800 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <LogIn size={20} />
                Login with Reddit
              </>
            )}
          </button>
        </form>

        <p className="text-gray-400 text-sm mt-4">
          Your credentials are sent directly to Reddit's servers.
        </p>
      </div>
    </div>
  );
};

export default RedditAuth;