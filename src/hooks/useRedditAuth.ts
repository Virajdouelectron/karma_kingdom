import { useState, useEffect } from 'react';
import { redditAuth, RedditUser } from '../services/redditAuth';

interface UseRedditAuthReturn {
  isAuthenticated: boolean;
  user: RedditUser | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  authStatus: {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    isTokenValid: boolean;
    tokenExpiresAt: Date | null;
  };
}

export const useRedditAuth = (): UseRedditAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<RedditUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if Reddit OAuth is configured
      if (!redditAuth.isConfigured()) {
        console.log('Reddit OAuth not configured');
        setIsAuthenticated(false);
        setUser(null);
        setError('Reddit OAuth is not configured properly.');
        return;
      }

      const authStatus = redditAuth.getAuthStatus();
      console.log('Auth status:', authStatus);

      // If no access token at all, user needs to authenticate
      if (!authStatus.hasAccessToken) {
        console.log('No access token found');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // If token is valid, try to get user info
      if (authStatus.isTokenValid) {
        console.log('Token is valid, getting user info...');
        const currentUser = await redditAuth.getCurrentUser();
        if (currentUser) {
          setIsAuthenticated(true);
          setUser(currentUser);
          console.log('User authenticated successfully:', currentUser.name);
          return;
        }
      }

      // Token is expired or invalid, try to refresh if we have refresh token
      if (authStatus.hasRefreshToken) {
        console.log('Token expired, attempting refresh...');
        const refreshed = await redditAuth.refreshToken();
        if (refreshed) {
          console.log('Token refreshed successfully');
          // Try to get user info with new token
          const currentUser = await redditAuth.getCurrentUser();
          if (currentUser) {
            setIsAuthenticated(true);
            setUser(currentUser);
            console.log('User re-authenticated after refresh:', currentUser.name);
            return;
          }
        } else {
          console.log('Token refresh failed');
          setError('Session expired. Please log in again.');
        }
      } else {
        console.log('No refresh token available');
        setError('No refresh token available. Please log in again.');
      }

      // If we get here, authentication failed
      setIsAuthenticated(false);
      setUser(null);
      
    } catch (err) {
      console.error('Auth check failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication check failed');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await redditAuth.logout();
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
      console.log('User logged out successfully');
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    console.log('Manual auth refresh requested');
    await checkAuthStatus();
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    logout,
    refreshAuth,
    authStatus: redditAuth.getAuthStatus()
  };
};