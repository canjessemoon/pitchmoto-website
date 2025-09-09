-- Create simple ping function for testing database connectivity
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION ping() RETURNS text AS $$
BEGIN
  RETURN 'pong';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION ping() TO anon, authenticated;

-- Also create a simple test that bypasses RLS for connection testing
CREATE OR REPLACE FUNCTION test_connection() RETURNS json AS $$
BEGIN
  RETURN json_build_object(
    'status', 'success',
    'timestamp', NOW(),
    'message', 'Database connection is working'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION test_connection() TO anon, authenticated;

COMMIT;
