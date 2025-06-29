/*
  # Reddit OAuth Configuration Functions

  1. Functions
    - `get_active_reddit_config()` - Get the active Reddit OAuth configuration
    - `update_reddit_config()` - Update Reddit OAuth configuration (admin only)

  2. Security
    - Functions use security definer to bypass RLS
    - Public users can read config (needed for OAuth initialization)
    - Only service role can modify config
*/

-- Function to get active Reddit OAuth configuration
CREATE OR REPLACE FUNCTION get_active_reddit_config()
RETURNS TABLE(client_id text, redirect_uri text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    roc.client_id,
    roc.redirect_uri
  FROM reddit_oauth_config roc
  WHERE roc.is_active = true
  ORDER BY roc.updated_at DESC
  LIMIT 1;
END;
$$;

-- Function to update Reddit OAuth configuration
CREATE OR REPLACE FUNCTION update_reddit_config(
  p_client_id text,
  p_client_secret text DEFAULT NULL,
  p_redirect_uri text DEFAULT 'http://localhost:5173/auth/callback'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_id uuid;
BEGIN
  -- Deactivate all existing configs
  UPDATE reddit_oauth_config SET is_active = false;
  
  -- Insert new config
  INSERT INTO reddit_oauth_config (
    client_id,
    client_secret,
    redirect_uri,
    is_active
  ) VALUES (
    p_client_id,
    p_client_secret,
    p_redirect_uri,
    true
  ) RETURNING id INTO config_id;
  
  RETURN config_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_active_reddit_config() TO public;
GRANT EXECUTE ON FUNCTION update_reddit_config(text, text, text) TO service_role;