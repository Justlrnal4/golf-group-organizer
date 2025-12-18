-- Create outings table
CREATE TABLE public.outings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  location_zip TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outing_id UUID NOT NULL REFERENCES public.outings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_organizer BOOLEAN NOT NULL DEFAULT false,
  available_dates DATE[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access for now since no auth)
ALTER TABLE public.outings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for outings (no auth required for MVP)
CREATE POLICY "Anyone can view outings" 
ON public.outings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create outings" 
ON public.outings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update outings" 
ON public.outings 
FOR UPDATE 
USING (true);

-- Allow public read/write for participants
CREATE POLICY "Anyone can view participants" 
ON public.participants 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create participants" 
ON public.participants 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update participants" 
ON public.participants 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_outings_updated_at
BEFORE UPDATE ON public.outings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();