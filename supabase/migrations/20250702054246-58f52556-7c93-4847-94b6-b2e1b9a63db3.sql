-- Create admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'junichiroalexandra27@gmail.com',
  crypt('iwakiwak', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Junichiro Alexandra"}',
  false,
  '',
  '',
  '',
  ''
);

-- Create admin profile
INSERT INTO public.profiles (id, name, email, role, created_at, updated_at)
SELECT 
  au.id,
  'Junichiro Alexandra',
  'junichiroalexandra27@gmail.com',
  'admin',
  now(),
  now()
FROM auth.users au 
WHERE au.email = 'junichiroalexandra27@gmail.com';