
-- First, let's insert the admin user into auth.users with proper constraints
DO $$
DECLARE
    admin_user_id uuid := gen_random_uuid();
BEGIN
    -- Insert admin user into auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        email_change_confirm_status,
        created_at,
        updated_at,
        raw_user_meta_data,
        is_super_admin,
        role,
        aud
    ) VALUES (
        admin_user_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@financeapp.com',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        0,
        NOW(),
        NOW(),
        '{"name": "Administrator"}'::jsonb,
        false,
        'authenticated',
        'authenticated'
    ) ON CONFLICT (email) DO NOTHING;

    -- Get the actual user ID (in case of conflict)
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@financeapp.com';

    -- Insert admin profile
    INSERT INTO public.profiles (id, name, email, role, created_at, updated_at)
    VALUES (
        admin_user_id,
        'Administrator',
        'admin@financeapp.com',
        'admin'::user_role,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        role = 'admin'::user_role,
        email = 'admin@financeapp.com',
        updated_at = NOW();
END $$;
