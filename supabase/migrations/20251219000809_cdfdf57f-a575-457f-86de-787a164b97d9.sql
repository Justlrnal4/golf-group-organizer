-- Create courses table for golf courses
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  price_tier TEXT NOT NULL DEFAULT '$$',
  holes_available TEXT NOT NULL DEFAULT 'both',
  phone TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Anyone can view courses
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);

-- Create plan_cards table for AI-generated plans
CREATE TABLE public.plan_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outing_id UUID NOT NULL REFERENCES public.outings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  course_name TEXT NOT NULL,
  course_address TEXT NOT NULL,
  time_window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  time_window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_cost TEXT NOT NULL,
  drive_time TEXT NOT NULL,
  rationale TEXT[] NOT NULL DEFAULT '{}',
  fit_score INTEGER NOT NULL DEFAULT 80,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on plan_cards
ALTER TABLE public.plan_cards ENABLE ROW LEVEL SECURITY;

-- Anyone can view plan cards
CREATE POLICY "Anyone can view plan cards" ON public.plan_cards FOR SELECT USING (true);

-- Anyone can create plan cards (edge function)
CREATE POLICY "Anyone can create plan cards" ON public.plan_cards FOR INSERT WITH CHECK (true);

-- Anyone can delete plan cards (for regeneration)
CREATE POLICY "Anyone can delete plan cards" ON public.plan_cards FOR DELETE USING (true);

-- Create votes table
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_card_id UUID NOT NULL REFERENCES public.plan_cards(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(plan_card_id, participant_id)
);

-- Enable RLS on votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Anyone can view votes
CREATE POLICY "Anyone can view votes" ON public.votes FOR SELECT USING (true);

-- Anyone can create votes
CREATE POLICY "Anyone can create votes" ON public.votes FOR INSERT WITH CHECK (true);

-- Anyone can update their votes
CREATE POLICY "Anyone can update votes" ON public.votes FOR UPDATE USING (true);

-- Enable realtime for votes
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;

-- Insert some sample courses
INSERT INTO public.courses (name, address, zip_code, price_tier, holes_available) VALUES
  ('Pinehurst Golf Club', '123 Pine Drive, Pinehurst, NC 28374', '28374', '$$', 'both'),
  ('Ocean Breeze Links', '456 Ocean Blvd, Myrtle Beach, SC 29577', '29577', '$$$', 'both'),
  ('Budget Fairways', '789 Fairway Lane, Charlotte, NC 28202', '28202', '$', '18'),
  ('Mountain View Golf', '321 Mountain Rd, Asheville, NC 28801', '28801', '$$', 'both'),
  ('Lake Country Club', '654 Lake Shore Dr, Raleigh, NC 27601', '27601', '$$$', 'both'),
  ('Green Valley Golf', '987 Valley Way, Durham, NC 27701', '27701', '$', '9'),
  ('Sunset Hills Golf', '147 Sunset Blvd, Greensboro, NC 27401', '27401', '$$', 'both'),
  ('Eagle Ridge Course', '258 Eagle Nest Ln, Winston-Salem, NC 27101', '27101', '$$', '18');