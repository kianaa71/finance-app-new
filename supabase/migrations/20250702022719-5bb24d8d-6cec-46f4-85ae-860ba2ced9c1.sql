
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
);

-- Insert employee user directly into auth.users table  
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
  'employee@financeapp.com',
  crypt('employee123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Karyawan"}',
  'authenticated',
  'authenticated'
);

-- Update admin profile role
UPDATE profiles 
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@financeapp.com'
);
