import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { redditAuth } from '../services/redditAuth';

const RedditCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        // Check for OAuth errors
        if (errorParam) {
          throw new Error(`OAuth error: ${errorParam}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Exchange code for token
        await redditAuth.exchangeCodeForToken(code, state);
        
        // Get user info to verify authentication
        const user = await redditAuth.getCurrentUser();
        if (!user) {
          throw new Error('Failed to get user information');
        }

        setStatus('success');
        
        // Redirect to main app after a short delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);

      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
        
        // Redirect to home after error display
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 5000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="text-white animate-spin" size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connecting to Reddit...</h2>
            <p className="text-gray-300">Please wait while we verify your authentication.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-white" size={32} />
            </div>
            <h2 className="text-xl font-bold text-green-400 mb-2">Successfully Connected!</h2>
            <p className="text-gray-300">Redirecting you to Karma Kingdom...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="text-white" size={32} />
            </div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Authentication Failed</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <p className="text-gray-400 text-sm">Redirecting you back to try again...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default RedditCallback;