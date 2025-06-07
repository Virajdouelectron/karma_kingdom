import { useState, useEffect } from 'react';
import { redditAuth, RedditUser } from '../services/redditAuth';

interface UseRedditAuthReturn {
  isAuthenticated: boolean;
  user: RedditUser | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
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

      // Check if we have a valid token
      if (!redditAuth.isTokenValid()) {
        // Try to refresh the token
        const refreshed = await redditAuth.refreshToken();
        if (!refreshed) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }
      }

      // Get current user info
      const currentUser = await redditAuth.getCurrentUser();
      if (currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
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
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
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
    refreshAuth
  };
};