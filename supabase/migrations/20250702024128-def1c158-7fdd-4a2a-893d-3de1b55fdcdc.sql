
-- Tambahkan kolom email ke tabel profiles
ALTER TABLE profiles ADD COLUMN email TEXT;

-- Insert admin user ke tabel profiles
INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'name', 'Administrator'),
    email,
    'admin'::user_role,
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'admin@financeapp.com'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = 'admin'::user_role,
    updated_at = NOW();

-- Insert employee user ke tabel profiles
INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'name', 'Karyawan'),
    email,
    'employee'::user_role,
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'employee@financeapp.com'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = 'employee'::user_role,
    updated_at = NOW();

-- Update function handle_new_user untuk include email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'employee'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
