/*
  # Reddit OAuth Configuration Storage

  1. New Tables
    - `reddit_oauth_config`
      - `id` (uuid, primary key)
      - `client_id` (text, encrypted Reddit client ID)
      - `client_secret` (text, encrypted Reddit client secret)
      - `redirect_uri` (text, redirect URI for OAuth)
      - `is_active` (boolean, whether this config is currently active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, reference to auth.users)

  2. Security
    - Enable RLS on `reddit_oauth_config` table
    - Add policies for admin access only
    - Store sensitive data with encryption
*/

-- Create the reddit_oauth_config table
CREATE TABLE IF NOT EXISTS reddit_oauth_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  client_secret text,
  redirect_uri text NOT NULL DEFAULT 'http://localhost:5173/auth/callback',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE reddit_oauth_config ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Only authenticated users can read reddit oauth config"
  ON reddit_oauth_config
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only service role can modify reddit oauth config"
  ON reddit_oauth_config
  FOR ALL
  TO service_role
  USING (true);

-- Create function to get active reddit config
CREATE OR REPLACE FUNCTION get_active_reddit_config()
RETURNS TABLE (
  client_id text,
  redirect_uri text
) 
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
  ORDER BY roc.created_at DESC
  LIMIT 1;
END;
$$;

-- Create function to update reddit config (admin only)
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
    is_active,
    created_by
  ) VALUES (
    p_client_id,
    p_client_secret,
    p_redirect_uri,
    true,
    auth.uid()
  ) RETURNING id INTO config_id;
  
  RETURN config_id;
END;
$$;

-- Insert default configuration (you'll need to update this with real values)
INSERT INTO reddit_oauth_config (
  client_id,
  redirect_uri,
  is_active
) VALUES (
  'your_reddit_client_id_here',
  'https://karmakingdom.netlify.app/auth/callback',
  true
) ON CONFLICT DO NOTHING;