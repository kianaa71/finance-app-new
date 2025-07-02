
-- Buat ulang tabel profiles dengan struktur yang lebih lengkap
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Buat enum untuk role
CREATE TYPE public.user_role AS ENUM ('admin', 'employee');

-- Buat tabel profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy untuk SELECT - Admin bisa lihat semua, Employee hanya milik sendiri
CREATE POLICY "Admin can view all profiles, employees can view own" 
ON public.profiles FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  OR id = auth.uid()
);

-- Policy untuk INSERT - Admin bisa insert siapa saja, Employee hanya diri sendiri
CREATE POLICY "Admin can insert any profile, employees can insert own" 
ON public.profiles FOR INSERT 
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  OR id = auth.uid()
);

-- Policy untuk UPDATE - Admin bisa update siapa saja, Employee hanya diri sendiri
CREATE POLICY "Admin can update any profile, employees can update own" 
ON public.profiles FOR UPDATE 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  OR id = auth.uid()
);

-- Policy untuk DELETE - Hanya admin yang bisa delete, tapi tidak bisa delete diri sendiri
CREATE POLICY "Admin can delete other profiles" 
ON public.profiles FOR DELETE 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  AND id != auth.uid()
);

-- Buat function untuk handle user baru saat registrasi
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    'employee'::user_role,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Buat trigger untuk menjalankan function saat user baru dibuat
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert admin user untuk testing (gunakan password yang kuat di production)
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
  '{"name": "Administrator"}'::jsonb,
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Update profile admin jika sudah ada
UPDATE public.profiles 
SET role = 'admin'::user_role, name = 'Administrator'
WHERE email = 'admin@financeapp.com';

-- Insert profile admin jika belum ada
INSERT INTO public.profiles (id, name, email, role, created_at, updated_at)
SELECT 
  u.id,
  'Administrator',
  'admin@financeapp.com',
  'admin'::user_role,
  NOW(),
  NOW()
FROM auth.users u 
WHERE u.email = 'admin@financeapp.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin'::user_role,
  name = 'Administrator',
  updated_at = NOW();
