interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

interface RedditUser {
  id: string;
  name: string;
  icon_img: string;
  total_karma: number;
  created_utc: number;
}

class RedditAuthService {
  private readonly clientId = 'oRHe6dkduxlHnAT8PEh2AQ';
  private readonly clientSecret = 'j32JfgPu_RM84a0CiEErt8eCqmKhhg';
  private readonly redirectUri = 'https://karmakingdom.netlify.app/auth/callback';
  private readonly baseUrl = 'https://www.reddit.com';
  private readonly apiUrl = 'https://oauth.reddit.com';
  
  // Required scopes for the application
  private readonly scopes = ['identity', 'read', 'submit', 'vote'];
  
  // Rate limiting
  private lastRequestTime = 0;
  private readonly minRequestInterval = 1000; // 1 second between requests

  /**
   * Generate a random state parameter for CSRF protection
   */
  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Rate limiting helper
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Check if OAuth is properly configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.redirectUri);
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      client_id: this.clientId,
      redirect_uri: this.redirectUri
    };
  }

  /**
   * Construct the Reddit authorization URL
   */
  getAuthorizationUrl(): string {
    if (!this.isConfigured()) {
      throw new Error('Reddit OAuth is not configured properly.');
    }

    const state = this.generateState();
    sessionStorage.setItem('reddit_oauth_state', state);
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      state: state,
      redirect_uri: this.redirectUri,
      duration: 'permanent', // This ensures we get a refresh token
      scope: this.scopes.join(' ')
    });

    return `${this.baseUrl}/api/v1/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<RedditTokenResponse> {
    if (!this.isConfigured()) {
      throw new Error('Reddit OAuth is not configured');
    }

    // Verify state parameter
    const storedState = sessionStorage.getItem('reddit_oauth_state');
    if (!storedState || storedState !== state) {
      throw new Error('Invalid state parameter. Possible CSRF attack.');
    }
    
    sessionStorage.removeItem('reddit_oauth_state');
    
    await this.enforceRateLimit();

    const response = await fetch(`${this.baseUrl}/api/v1/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
        'User-Agent': 'KarmaKingdom/1.0.0'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const tokenData: RedditTokenResponse = await response.json();
    
    // Store tokens securely
    this.storeTokens(tokenData);
    
    return tokenData;
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshToken(): Promise<RedditTokenResponse | null> {
    if (!this.isConfigured()) {
      console.error('Reddit OAuth is not configured');
      return null;
    }

    const refreshToken = localStorage.getItem('reddit_refresh_token');
    if (!refreshToken) {
      console.warn('No refresh token available for token refresh');
      return null;
    }

    await this.enforceRateLimit();

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
          'User-Agent': 'KarmaKingdom/1.0.0'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token refresh failed:', response.status, errorText);
        
        // If refresh fails, clear all tokens
        this.clearTokens();
        return null;
      }

      const tokenData: RedditTokenResponse = await response.json();
      
      // Store the new tokens (refresh token might be the same or new)
      this.storeTokens(tokenData, refreshToken);
      
      return tokenData;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<RedditUser | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const accessToken = localStorage.getItem('reddit_access_token');
    if (!accessToken) {
      console.warn('No access token available');
      return null;
    }

    await this.enforceRateLimit();

    try {
      const response = await fetch(`${this.apiUrl}/api/v1/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'KarmaKingdom/1.0.0'
        }
      });

      if (response.status === 401) {
        console.log('Access token expired, attempting refresh...');
        // Token expired, try to refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
          console.log('Token refreshed successfully, retrying user request...');
          return this.getCurrentUser(); // Retry with new token
        }
        console.warn('Token refresh failed, user needs to re-authenticate');
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status}`);
      }

      const userData = await response.json();
      console.log('User data retrieved successfully');
      return userData;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Make authenticated API request to Reddit
   */
  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.isConfigured()) {
      throw new Error('Reddit OAuth is not configured');
    }

    const accessToken = localStorage.getItem('reddit_access_token');
    if (!accessToken) {
      throw new Error('No access token available');
    }

    await this.enforceRateLimit();

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'KarmaKingdom/1.0.0',
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry the request with new token
        return this.makeAuthenticatedRequest(endpoint, options);
      }
      throw new Error('Authentication failed and token refresh unsuccessful');
    }

    return response;
  }

  /**
   * Store tokens securely with better error handling
   */
  private storeTokens(tokenData: RedditTokenResponse, existingRefreshToken?: string): void {
    try {
      // Store access token and expiration
      localStorage.setItem('reddit_access_token', tokenData.access_token);
      localStorage.setItem('reddit_token_expires_at', 
        (Date.now() + (tokenData.expires_in * 1000)).toString()
      );
      
      // Store refresh token (use new one if provided, otherwise keep existing)
      const refreshToken = tokenData.refresh_token || existingRefreshToken;
      if (refreshToken) {
        localStorage.setItem('reddit_refresh_token', refreshToken);
        console.log('Tokens stored successfully with refresh token');
      } else {
        console.warn('No refresh token to store - this may cause authentication issues');
      }
      
      // Store additional metadata
      localStorage.setItem('reddit_token_scope', tokenData.scope || '');
      localStorage.setItem('reddit_token_stored_at', Date.now().toString());
      
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  /**
   * Check if current token is valid and not expired
   */
  isTokenValid(): boolean {
    const token = localStorage.getItem('reddit_access_token');
    const expiresAt = localStorage.getItem('reddit_token_expires_at');
    
    if (!token || !expiresAt) {
      return false;
    }

    // Add 5 minute buffer before expiration
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() < (parseInt(expiresAt) - bufferTime);
  }

  /**
   * Check if we have a refresh token available
   */
  hasRefreshToken(): boolean {
    return !!localStorage.getItem('reddit_refresh_token');
  }

  /**
   * Get authentication status summary
   */
  getAuthStatus(): {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    isTokenValid: boolean;
    tokenExpiresAt: Date | null;
  } {
    const expiresAt = localStorage.getItem('reddit_token_expires_at');
    
    return {
      hasAccessToken: !!localStorage.getItem('reddit_access_token'),
      hasRefreshToken: this.hasRefreshToken(),
      isTokenValid: this.isTokenValid(),
      tokenExpiresAt: expiresAt ? new Date(parseInt(expiresAt)) : null
    };
  }

  /**
   * Clear all stored tokens
   */
  clearTokens(): void {
    const keysToRemove = [
      'reddit_access_token',
      'reddit_refresh_token',
      'reddit_token_expires_at',
      'reddit_token_scope',
      'reddit_token_stored_at'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('All Reddit tokens cleared');
  }

  /**
   * Revoke the current access token
   */
  async revokeToken(): Promise<void> {
    if (!this.isConfigured()) {
      this.clearTokens();
      return;
    }

    const accessToken = localStorage.getItem('reddit_access_token');
    if (!accessToken) {
      return;
    }

    try {
      await fetch(`${this.baseUrl}/api/v1/revoke_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
          'User-Agent': 'KarmaKingdom/1.0.0'
        },
        body: new URLSearchParams({
          token: accessToken,
          token_type_hint: 'access_token'
        })
      });
      console.log('Token revoked successfully');
    } catch (error) {
      console.error('Failed to revoke token:', error);
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Logout user and clear all data
   */
  async logout(): Promise<void> {
    await this.revokeToken();
    this.clearTokens();
  }
}

export const redditAuth = new RedditAuthService();
export type { RedditUser, RedditTokenResponse };