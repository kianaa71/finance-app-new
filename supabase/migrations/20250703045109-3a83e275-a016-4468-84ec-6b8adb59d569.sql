-- Update RLS policies for transactions to allow employees to view all transactions
-- but only edit their own

-- Drop the restrictive policy that only allows users to see their own transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;

-- Create a new policy that allows all authenticated users to view all transactions
CREATE POLICY "All authenticated users can view all transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Keep the existing policies for insert, update, delete that restrict to own transactions
-- These policies already exist and work correctly:
-- - "Users can create their own transactions" 
-- - "Users can update their own transactions"
-- - "Users can delete their own transactions"
-- - "Admins can view all transactions" (this becomes redundant but harmless)