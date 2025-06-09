import React, { useState } from 'react';
import { LogIn, ExternalLink, AlertCircle, Settings, RefreshCw } from 'lucide-react';
import { redditAuth } from '../services/redditAuth';

const RedditAuth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if environment variables are configured
      if (!redditAuth.isConfigured()) {
        throw new Error('Reddit OAuth is not configured. Please set up your configuration in the admin panel.');
      }

      // Redirect to Reddit OAuth
      const authUrl = redditAuth.getAuthorizationUrl();
      console.log('Redirecting to Reddit OAuth:', authUrl);
      window.location.href = authUrl;
    } catch (err) {
      console.error('Reddit auth error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleRefreshConfig = async () => {
    setIsRefreshing(true);
    try {
      await redditAuth.refreshConfig();
      setError(null);
    } catch (err) {
      console.error('Failed to refresh config:', err);
      setError('Failed to refresh configuration');
    } finally {
      setIsRefreshing(false);
    }
  };

  const authStatus = redditAuth.getAuthStatus();
  const isConfigured = redditAuth.isConfigured();
  const config = redditAuth.getConfig();

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
                  <p>Reddit OAuth needs to be configured by an administrator.</p>
                  <p className="mt-1">Contact the site admin to set up Reddit integration.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <button
            onClick={handleLogin}
            disabled={isLoading || !isConfigured}
            className="flex items-center justify-center gap-2 flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-orange-800 disabled:cursor-not-allowed group"
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

          <button
            onClick={handleRefreshConfig}
            disabled={isRefreshing}
            className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed"
            title="Refresh Configuration"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Debug Information */}
        <div className="mt-4">
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 mx-auto"
          >
            <Settings size={12} />
            Debug Info
          </button>
          
          {showDebugInfo && (
            <div className="mt-2 text-xs text-left bg-gray-900 p-3 rounded border">
              <div className="space-y-1">
                <div>OAuth Configured: <span className={isConfigured ? 'text-green-400' : 'text-red-400'}>{isConfigured ? 'Yes' : 'No'}</span></div>
                {config && (
                  <>
                    <div>Client ID: <span className="text-gray-300">{config.client_id ? 'Set' : 'Missing'}</span></div>
                    <div>Redirect URI: <span className="text-gray-300">{config.redirect_uri || 'Missing'}</span></div>
                  </>
                )}
                <div>Has Access Token: <span className={authStatus.hasAccessToken ? 'text-green-400' : 'text-red-400'}>{authStatus.hasAccessToken ? 'Yes' : 'No'}</span></div>
                <div>Has Refresh Token: <span className={authStatus.hasRefreshToken ? 'text-green-400' : 'text-red-400'}>{authStatus.hasRefreshToken ? 'Yes' : 'No'}</span></div>
                <div>Token Valid: <span className={authStatus.isTokenValid ? 'text-green-400' : 'text-red-400'}>{authStatus.isTokenValid ? 'Yes' : 'No'}</span></div>
                {authStatus.tokenExpiresAt && (
                  <div>Token Expires: <span className="text-gray-300">{authStatus.tokenExpiresAt.toLocaleString()}</span></div>
                )}
              </div>
            </div>
          )}
        </div>

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