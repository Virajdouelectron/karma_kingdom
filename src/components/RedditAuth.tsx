import React, { useState } from 'react';
import { LogIn, ExternalLink, AlertCircle } from 'lucide-react';
import { redditAuth } from '../services/redditAuth';

const RedditAuth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if environment variables are configured
      if (!import.meta.env.VITE_REDDIT_CLIENT_ID) {
        throw new Error('Reddit OAuth is not configured. Please set up your environment variables.');
      }

      // Redirect to Reddit OAuth
      const authUrl = redditAuth.getAuthorizationUrl();
      window.location.href = authUrl;
    } catch (err) {
      console.error('Reddit auth error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-orange-400 mb-2">Welcome to Karma Kingdom</h2>
          <p className="text-gray-300">
            Connect with your Reddit account to start playing and earning karma!
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-md mb-4 flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm text-left">
              {error}
              {error.includes('not configured') && (
                <div className="mt-2 text-xs">
                  <p>To set up Reddit OAuth:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Visit <a href="https://www.reddit.com/prefs/apps" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">Reddit Apps</a></li>
                    <li>Create a new "web app"</li>
                    <li>Set redirect URI to: <code className="bg-gray-700 px-1 rounded">http://localhost:5173/auth/callback</code></li>
                    <li>Copy your client ID to .env file</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-orange-800 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <LogIn size={20} />
              <span>Connect with Reddit</span>
              <ExternalLink size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </button>

        <div className="mt-6 text-xs text-gray-400 space-y-2">
          <p className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Secure OAuth2 authentication
          </p>
          <p>We only request permissions needed for the game</p>
          <p>Your Reddit password is never shared with us</p>
        </div>
      </div>
    </div>
  );
};

export default RedditAuth;