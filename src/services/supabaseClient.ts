import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface RedditOAuthConfig {
  id: string;
  client_id: string;
  client_secret?: string;
  redirect_uri: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Function to get active Reddit OAuth configuration
export async function getActiveRedditConfig(): Promise<{ client_id: string; redirect_uri: string } | null> {
  try {
    const { data, error } = await supabase.rpc('get_active_reddit_config');
    
    if (error) {
      console.error('Error fetching Reddit config:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Failed to fetch Reddit config:', error);
    return null;
  }
}

// Function to update Reddit OAuth configuration (admin only)
export async function updateRedditConfig(
  clientId: string,
  clientSecret?: string,
  redirectUri: string = window.location.origin + '/auth/callback'
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('update_reddit_config', {
      p_client_id: clientId,
      p_client_secret: clientSecret,
      p_redirect_uri: redirectUri
    });
    
    if (error) {
      console.error('Error updating Reddit config:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to update Reddit config:', error);
    return null;
  }
}