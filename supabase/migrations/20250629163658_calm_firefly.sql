/*
  # Fix Reddit OAuth Configuration Permissions

  1. Functions
    - Update `update_reddit_config()` to allow authenticated users
    - Ensure proper permissions for configuration management

  2. Security
    - Allow authenticated users to update Reddit OAuth config
    - Maintain security while enabling admin panel functionality
*/

-- Drop and recreate the update function with proper permissions
DROP FUNCTION IF EXISTS public.update_reddit_config(text, text, text);

-- Function to update Reddit OAuth configuration (allow authenticated users)
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
  -- Deactivate all existing configurations
  UPDATE public.reddit_oauth_config 
  SET is_active = FALSE, updated_at = now();

  -- Insert the new configuration
  INSERT INTO public.reddit_oauth_config (
    client_id,
    client_secret,
    redirect_uri,
    is_active,
    created_at,
    updated_at,
    created_by
  )
  VALUES (
    p_client_id,
    p_client_secret,
    p_redirect_uri,
    TRUE,
    now(),
    now(),
    auth.uid()
  )
  RETURNING id INTO config_id;

  RETURN config_id::text;
END;
$$;

-- Grant execute permissions to authenticated users for both functions
GRANT EXECUTE ON FUNCTION public.get_active_reddit_config() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_reddit_config(text, text, text) TO authenticated;

-- Also grant to anon for the get function (in case needed)
GRANT EXECUTE ON FUNCTION public.get_active_reddit_config() TO anon;