-- Create preferences table
CREATE TABLE public.preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  outing_id UUID NOT NULL REFERENCES public.outings(id) ON DELETE CASCADE,
  availability JSONB NOT NULL DEFAULT '{}',
  max_drive_minutes INTEGER NOT NULL DEFAULT 30,
  budget TEXT NOT NULL DEFAULT '$$',
  holes_preference TEXT NOT NULL DEFAULT 'either',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_id)
);

-- Enable Row Level Security
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for preferences
CREATE POLICY "Anyone can view preferences" 
ON public.preferences 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create preferences" 
ON public.preferences 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update preferences" 
ON public.preferences 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_preferences_updated_at
BEFORE UPDATE ON public.preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();