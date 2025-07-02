-- Clear existing data
DELETE FROM public.transactions;
DELETE FROM public.profiles;

-- Clear existing auth users (be careful - this removes all users)
DELETE FROM auth.users;