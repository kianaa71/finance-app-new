-- Create categories table for transaction categories
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (public read, admin write)
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for transactions (users can only access their own)
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" 
ON public.transactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add timestamp trigger for transactions
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, type) VALUES
('Gaji', 'income'),
('Bonus', 'income'),
('Investasi', 'income'),
('Freelance', 'income'),
('Makanan', 'expense'),
('Transportasi', 'expense'),
('Belanja', 'expense'),
('Tagihan', 'expense'),
('Hiburan', 'expense'),
('Kesehatan', 'expense'),
('Pendidikan', 'expense'),
('Lainnya', 'expense');