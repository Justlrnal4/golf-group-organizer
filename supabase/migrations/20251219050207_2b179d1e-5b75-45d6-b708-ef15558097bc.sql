-- Add phone number column to participants table
ALTER TABLE public.participants 
ADD COLUMN phone text;

-- Add a comment for clarity
COMMENT ON COLUMN public.participants.phone IS 'Optional phone number for coordination with other participants';