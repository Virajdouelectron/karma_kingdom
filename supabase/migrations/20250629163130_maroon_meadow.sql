/*
  # Reddit OAuth Configuration Functions

  1. Functions
    - `get_active_reddit_config()` - Get the active Reddit OAuth configuration
    - `update_reddit_config()` - Update Reddit OAuth configuration (admin only)

  2. Security
    - Functions use security definer to bypass RLS
    - Only authenticated users can read config
    - Only service role can modify config
*/

-- Drop existing functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS public.get_active_reddit_config();
DROP FUNCTION IF EXISTS public.update_reddit_config(text, text, text);

-- Function to get active Reddit OAuth configuration
CREATE OR REPLACE FUNCTION public.get_active_reddit_config()
RETURNS TABLE(client_id text, redirect_uri text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT r.client_id, r.redirect_uri
  FROM public.reddit_oauth_config r
  WHERE r.is_active = TRUE
  ORDER BY r.updated_at DESC
  LIMIT 1;
END;
$$;

-- Function to update Reddit OAuth configuration
CREATE OR REPLACE FUNCTION public.update_reddit_config(
  p_client_id text,
  p_client_secret text DEFAULT NULL,
  p_redirect_uri text DEFAULT 'http://localhost:5173/auth/callback'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_id uuid;
BEGIN
  -- Check if user has service role (only service role can modify config)
  IF NOT (SELECT auth.jwt() ->> 'role' = 'service_role') THEN
    RAISE EXCEPTION 'Insufficient permissions to update Reddit configuration';
  END IF;

  -- Deactivate all existing configurations
  UPDATE public.reddit_oauth_config 
  SET is_active = FALSE, updated_at = now();

  -- Insert or update the configuration
  INSERT INTO public.reddit_oauth_config (
    client_id,
    client_secret,
    redirect_uri,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    p_client_id,
    p_client_secret,
    p_redirect_uri,
    TRUE,
    now(),
    now()
  )
  ON CONFLICT (client_id) 
  DO UPDATE SET
    client_secret = EXCLUDED.client_secret,
    redirect_uri = EXCLUDED.redirect_uri,
    is_active = TRUE,
    updated_at = now()
  RETURNING id INTO config_id;

  RETURN config_id::text;
END;
$$;

-- Grant execute permissions to authenticated users for get function
GRANT EXECUTE ON FUNCTION public.get_active_reddit_config() TO authenticated;

-- Grant execute permissions to service role for update function
GRANT EXECUTE ON FUNCTION public.update_reddit_config(text, text, text) TO service_role;