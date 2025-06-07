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
  private readonly clientId: string;
  private readonly redirectUri: string;
  private readonly baseUrl = 'https://www.reddit.com';
  private readonly apiUrl = 'https://oauth.reddit.com';
  
  // Required scopes for the application
  private readonly scopes = ['identity', 'read', 'submit', 'vote'];
  
  // Rate limiting
  private lastRequestTime = 0;
  private readonly minRequestInterval = 1000; // 1 second between requests

  constructor() {
    this.clientId = import.meta.env.VITE_REDDIT_CLIENT_ID;
    this.redirectUri = import.meta.env.VITE_REDDIT_REDIRECT_URI;
    
    if (!this.clientId || !this.redirectUri) {
      throw new Error('Reddit OAuth configuration missing. Please check your environment variables.');
    }
  }

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
   * Construct the Reddit authorization URL
   */
  getAuthorizationUrl(): string {
    const state = this.generateState();
    sessionStorage.setItem('reddit_oauth_state', state);
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      state: state,
      redirect_uri: this.redirectUri,
      duration: 'permanent',
      scope: this.scopes.join(' ')
    });

    return `${this.baseUrl}/api/v1/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<RedditTokenResponse> {
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
        'Authorization': `Basic ${btoa(`${this.clientId}:`)}`,
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
    const refreshToken = localStorage.getItem('reddit_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    await this.enforceRateLimit();

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:`)}`,
          'User-Agent': 'KarmaKingdom/1.0.0'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const tokenData: RedditTokenResponse = await response.json();
      this.storeTokens(tokenData);
      
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
    const accessToken = localStorage.getItem('reddit_access_token');
    if (!accessToken) {
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
        // Token expired, try to refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
          return this.getCurrentUser(); // Retry with new token
        }
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Make authenticated API request to Reddit
   */
  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
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
   * Store tokens securely
   */
  private storeTokens(tokenData: RedditTokenResponse): void {
    localStorage.setItem('reddit_access_token', tokenData.access_token);
    localStorage.setItem('reddit_token_expires_at', 
      (Date.now() + (tokenData.expires_in * 1000)).toString()
    );
    
    if (tokenData.refresh_token) {
      localStorage.setItem('reddit_refresh_token', tokenData.refresh_token);
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

    return Date.now() < parseInt(expiresAt);
  }

  /**
   * Clear all stored tokens
   */
  clearTokens(): void {
    localStorage.removeItem('reddit_access_token');
    localStorage.removeItem('reddit_refresh_token');
    localStorage.removeItem('reddit_token_expires_at');
  }

  /**
   * Revoke the current access token
   */
  async revokeToken(): Promise<void> {
    const accessToken = localStorage.getItem('reddit_access_token');
    if (!accessToken) {
      return;
    }

    try {
      await fetch(`${this.baseUrl}/api/v1/revoke_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:`)}`,
          'User-Agent': 'KarmaKingdom/1.0.0'
        },
        body: new URLSearchParams({
          token: accessToken,
          token_type_hint: 'access_token'
        })
      });
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