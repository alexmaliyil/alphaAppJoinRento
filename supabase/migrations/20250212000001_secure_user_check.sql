/*
  # Secure User Check Function
  
  ## Query Description:
  Creates a secure RPC function to check if a user exists by email or phone.
  This allows the frontend to check existence without having direct SELECT access to the profiles table for anonymous users.
  
  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
  
  ## Security Implications:
  - RLS Status: Function is SECURITY DEFINER (runs with creator privileges)
  - Grants execute permission to anon and authenticated roles
*/

CREATE OR REPLACE FUNCTION check_user_exists(identifier_input text, type_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF type_input = 'email' THEN
    RETURN EXISTS(SELECT 1 FROM profiles WHERE email = identifier_input);
  ELSE
    RETURN EXISTS(SELECT 1 FROM profiles WHERE phone = identifier_input);
  END IF;
END;
$$;

-- Grant access to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION check_user_exists(text, text) TO anon, authenticated, service_role;
