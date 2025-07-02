-- Add status column to profiles table for soft delete
ALTER TABLE public.profiles 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Create index for performance
CREATE INDEX idx_profiles_status ON public.profiles(status);