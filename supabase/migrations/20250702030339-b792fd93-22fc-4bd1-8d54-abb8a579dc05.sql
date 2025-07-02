
-- Insert admin user directly into auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@financeapp.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Administrator"}',
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Insert admin profile (the trigger should handle this, but let's make sure)
INSERT INTO public.profiles (id, name, email, role, created_at, updated_at)
SELECT 
  au.id,
  'Administrator',
  'admin@financeapp.com',
  'admin'::user_role,
  NOW(),
  NOW()
FROM auth.users au 
WHERE au.email = 'admin@financeapp.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin'::user_role,
  updated_at = NOW();
