import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OverlapWindow {
  date: string;
  time_slot: "morning" | "afternoon";
  participant_count: number;
  total_participants: number;
}

interface Constraints {
  budget: string;
  max_drive_minutes: number;
  holes_preference: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { outing_id } = await req.json();

    if (!outing_id) {
      return new Response(
        JSON.stringify({ error: "outing_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch outing
    const { data: outing, error: outingError } = await supabase
      .from("outings")
      .select("*")
      .eq("id", outing_id)
      .single();

    if (outingError || !outing) {
      console.error("Error fetching outing:", outingError);
      return new Response(
        JSON.stringify({ error: "Outing not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch participants
    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select("*")
      .eq("outing_id", outing_id);

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      throw participantsError;
    }

    // Fetch preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from("preferences")
      .select("*")
      .eq("outing_id", outing_id);

    if (preferencesError) {
      console.error("Error fetching preferences:", preferencesError);
      throw preferencesError;
    }

    // Compute constraints from preferences
    const constraints = computeConstraints(preferences || []);
    const overlapWindows = computeOverlapWindows(outing, participants || [], preferences || []);

    console.log("Constraints:", constraints);
    console.log("Overlap windows:", overlapWindows.slice(0, 3));

    // Fetch matching courses
    const coursesQuery = supabase.from("courses").select("*");

    // Filter by budget tier (equal or lower)
    const budgetOrder: Record<string, number> = { "$": 1, "$$": 2, "$$$": 3 };
    const maxBudgetOrder = budgetOrder[constraints.budget] || 2;

    const { data: allCourses, error: coursesError } = await coursesQuery;

    if (coursesError) {
      console.error("Error fetching courses:", coursesError);
      throw coursesError;
    }

    // Filter courses manually for budget and holes
    const matchingCourses = (allCourses || []).filter((course) => {
      const courseOrder = budgetOrder[course.price_tier] || 2;
      if (courseOrder > maxBudgetOrder) return false;

      if (constraints.holes_preference !== "either") {
        if (course.holes_available !== "both" && course.holes_available !== constraints.holes_preference) {
          return false;
        }
      }

      return true;
    });

    console.log("Matching courses:", matchingCourses.length);

    if (matchingCourses.length === 0) {
      return new Response(
        JSON.stringify({ error: "No courses match your group's constraints", plans: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build prompt for AI
    const prompt = buildAIPrompt(outing, participants || [], overlapWindows, constraints, matchingCourses);
    console.log("AI Prompt:", prompt.substring(0, 500) + "...");

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a golf outing planner. Generate plan options as valid JSON only, no markdown or extra text."
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI service error");
    }

    const aiData = await aiResponse.json();
    const generatedText = aiData.choices?.[0]?.message?.content || "";
    console.log("AI Response:", generatedText.substring(0, 500));

    // Parse the JSON response
    let plans: any[];
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        plans = JSON.parse(jsonMatch[0]);
      } else {
        plans = JSON.parse(generatedText);
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, generatedText);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete existing plan cards for this outing (regeneration)
    await supabase.from("plan_cards").delete().eq("outing_id", outing_id);

    // Save plan cards to database
    const planCards = plans.map((plan: any) => ({
      outing_id,
      title: plan.title || `Golf at ${plan.course_name}`,
      course_name: plan.course_name,
      course_address: plan.course_address,
      time_window_start: plan.time_window?.start || new Date().toISOString(),
      time_window_end: plan.time_window?.end || new Date().toISOString(),
      estimated_cost: plan.estimated_cost,
      drive_time: plan.drive_time,
      rationale: plan.rationale || [],
      fit_score: plan.fit_score || 80,
    }));

    const { data: savedPlans, error: saveError } = await supabase
      .from("plan_cards")
      .insert(planCards)
      .select();

    if (saveError) {
      console.error("Error saving plans:", saveError);
      throw saveError;
    }

    console.log("Saved plans:", savedPlans?.length);

    return new Response(
      JSON.stringify({ plans: savedPlans }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-plans:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function computeConstraints(preferences: any[]): Constraints {
  if (preferences.length === 0) {
    return { budget: "$$", max_drive_minutes: 30, holes_preference: "either" };
  }

  const budgetOrder: Record<string, number> = { "$": 1, "$$": 2, "$$$": 3 };
  let minBudget = "$$$";
  let minBudgetOrder = 3;

  for (const pref of preferences) {
    const order = budgetOrder[pref.budget] || 2;
    if (order < minBudgetOrder) {
      minBudgetOrder = order;
      minBudget = pref.budget;
    }
  }

  const minDrive = Math.min(...preferences.map((p) => p.max_drive_minutes || 30));

  const holesPrefs = preferences.map((p) => p.holes_preference || "either");
  let holesResult = "either";
  if (holesPrefs.every((h) => h === "18")) holesResult = "18";
  else if (holesPrefs.every((h) => h === "9")) holesResult = "9";

  return { budget: minBudget, max_drive_minutes: minDrive, holes_preference: holesResult };
}

function computeOverlapWindows(outing: any, participants: any[], preferences: any[]): OverlapWindow[] {
  const start = new Date(outing.date_range_start);
  const end = new Date(outing.date_range_end);
  const windows: OverlapWindow[] = [];

  const participantMap = new Map(participants.map((p) => [p.id, p]));

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split("T")[0];

    for (const slot of ["morning", "afternoon"] as const) {
      let count = 0;

      for (const pref of preferences) {
        const avail = pref.availability?.[dateKey];
        if (avail && avail !== "cant" && (avail === "either" || avail === slot)) {
          count++;
        }
      }

      if (count > 0) {
        windows.push({
          date: dateKey,
          time_slot: slot,
          participant_count: count,
          total_participants: participants.length,
        });
      }
    }
  }

  windows.sort((a, b) => b.participant_count - a.participant_count);
  return windows;
}

function buildAIPrompt(
  outing: any,
  participants: any[],
  windows: OverlapWindow[],
  constraints: Constraints,
  courses: any[]
): string {
  const topWindows = windows.slice(0, 5);
  const windowsList = topWindows
    .map((w) => `${w.date} ${w.time_slot}: ${w.participant_count}/${w.total_participants} available`)
    .join("\n");

  const coursesList = courses
    .map((c) => `- ${c.name}: ${c.address}, Price: ${c.price_tier}, Holes: ${c.holes_available}`)
    .join("\n");

  return `Generate 2-3 plan options for a group golf outing.

Group constraints:
- Best time windows:
${windowsList}
- Budget: ${constraints.budget}
- Max drive from ${outing.location_zip}: ${constraints.max_drive_minutes} minutes
- Holes: ${constraints.holes_preference}
- Group size: ${participants.length} people

Available courses:
${coursesList}

Return a JSON array of 2-3 plan cards. Each card must have this exact structure:
{
  "id": "plan-1",
  "title": "Saturday Morning at [Course Name]",
  "course_name": "[exact course name from list]",
  "course_address": "[exact address from list]",
  "time_window": {"start": "2024-01-20T08:00:00Z", "end": "2024-01-20T12:00:00Z"},
  "estimated_cost": "$XX per person",
  "drive_time": "XX min from center",
  "rationale": ["reason 1", "reason 2", "reason 3"],
  "fit_score": 85
}

Use the actual dates from the time windows provided.
Vary the options: one budget-friendly, one best-fit, one premium if courses allow.
Output valid JSON only, no markdown, no explanation.`;
}