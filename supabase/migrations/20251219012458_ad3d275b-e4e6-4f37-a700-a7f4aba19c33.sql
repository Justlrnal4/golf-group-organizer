-- Drop existing RESTRICTIVE policies and recreate as PERMISSIVE for outings
DROP POLICY IF EXISTS "Anyone can create outings" ON public.outings;
DROP POLICY IF EXISTS "Anyone can update outings" ON public.outings;
DROP POLICY IF EXISTS "Anyone can view outings" ON public.outings;

CREATE POLICY "Anyone can create outings" ON public.outings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update outings" ON public.outings FOR UPDATE USING (true);
CREATE POLICY "Anyone can view outings" ON public.outings FOR SELECT USING (true);

-- Drop existing RESTRICTIVE policies and recreate as PERMISSIVE for participants
DROP POLICY IF EXISTS "Anyone can create participants" ON public.participants;
DROP POLICY IF EXISTS "Anyone can update participants" ON public.participants;
DROP POLICY IF EXISTS "Anyone can view participants" ON public.participants;

CREATE POLICY "Anyone can create participants" ON public.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update participants" ON public.participants FOR UPDATE USING (true);
CREATE POLICY "Anyone can view participants" ON public.participants FOR SELECT USING (true);

-- Drop existing RESTRICTIVE policies and recreate as PERMISSIVE for preferences
DROP POLICY IF EXISTS "Anyone can create preferences" ON public.preferences;
DROP POLICY IF EXISTS "Anyone can update preferences" ON public.preferences;
DROP POLICY IF EXISTS "Anyone can view preferences" ON public.preferences;

CREATE POLICY "Anyone can create preferences" ON public.preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update preferences" ON public.preferences FOR UPDATE USING (true);
CREATE POLICY "Anyone can view preferences" ON public.preferences FOR SELECT USING (true);

-- Drop existing RESTRICTIVE policies and recreate as PERMISSIVE for plan_cards
DROP POLICY IF EXISTS "Anyone can create plan_cards" ON public.plan_cards;
DROP POLICY IF EXISTS "Anyone can delete plan_cards" ON public.plan_cards;
DROP POLICY IF EXISTS "Anyone can view plan_cards" ON public.plan_cards;

CREATE POLICY "Anyone can create plan_cards" ON public.plan_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete plan_cards" ON public.plan_cards FOR DELETE USING (true);
CREATE POLICY "Anyone can view plan_cards" ON public.plan_cards FOR SELECT USING (true);

-- Drop existing RESTRICTIVE policies and recreate as PERMISSIVE for votes
DROP POLICY IF EXISTS "Anyone can create votes" ON public.votes;
DROP POLICY IF EXISTS "Anyone can view votes" ON public.votes;

CREATE POLICY "Anyone can create votes" ON public.votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view votes" ON public.votes FOR SELECT USING (true);

-- Drop existing RESTRICTIVE policies and recreate as PERMISSIVE for courses
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;

CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);