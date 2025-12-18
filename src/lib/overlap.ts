import { eachDayOfInterval, parseISO, format, setHours, setMinutes } from "date-fns";

export type TimeSlot = "morning" | "afternoon" | "either" | "cant";
export type Availability = Record<string, TimeSlot>;

export interface Preference {
  participant_id: string;
  availability: Availability;
  max_drive_minutes: number;
  budget: string;
  holes_preference: string;
}

export interface Participant {
  id: string;
  name: string;
  is_organizer: boolean;
}

export interface OverlapWindow {
  date: string;
  time_slot: "morning" | "afternoon";
  start_time: Date;
  end_time: Date;
  participant_count: number;
  total_participants: number;
  available_names: string[];
  fit_rank: number;
}

export interface ConstraintSummary {
  budget: string;
  budget_description: string;
  max_drive_minutes: number;
  holes_preference: string;
}

export interface OverlapResult {
  windows: OverlapWindow[];
  constraints: ConstraintSummary;
  has_overlap: boolean;
}

const budgetOrder: Record<string, number> = {
  "$": 1,
  "$$": 2,
  "$$$": 3,
};

const budgetDescriptions: Record<string, string> = {
  "$": "Under $50",
  "$$": "$50-100",
  "$$$": "$100+",
};

/**
 * Check if a participant is available for a specific time slot on a given date
 */
function isAvailableForSlot(
  availability: Availability,
  date: string,
  slot: "morning" | "afternoon"
): boolean {
  const dayAvailability = availability[date];
  if (!dayAvailability || dayAvailability === "cant") return false;
  if (dayAvailability === "either") return true;
  return dayAvailability === slot;
}

/**
 * Compute overlap windows and constraint summary from outing and preferences
 */
export function computeOverlapWindows(
  dateRangeStart: string,
  dateRangeEnd: string,
  participants: Participant[],
  preferences: Preference[]
): OverlapResult {
  const days = eachDayOfInterval({
    start: parseISO(dateRangeStart),
    end: parseISO(dateRangeEnd),
  });

  const totalParticipants = participants.length;
  const windows: OverlapWindow[] = [];

  // Create a map of participant_id to participant for easy lookup
  const participantMap = new Map(participants.map((p) => [p.id, p]));

  // For each day, check morning and afternoon slots
  for (const day of days) {
    const dateKey = format(day, "yyyy-MM-dd");

    for (const slot of ["morning", "afternoon"] as const) {
      const availableParticipants: string[] = [];

      for (const pref of preferences) {
        if (isAvailableForSlot(pref.availability, dateKey, slot)) {
          const participant = participantMap.get(pref.participant_id);
          if (participant) {
            availableParticipants.push(participant.name);
          }
        }
      }

      // Also include organizer (they created the outing, so assume they're available)
      const organizer = participants.find((p) => p.is_organizer);
      if (organizer && !availableParticipants.includes(organizer.name)) {
        // Check if organizer has preferences, if not assume available
        const organizerPref = preferences.find((p) => p.participant_id === organizer.id);
        if (!organizerPref || isAvailableForSlot(organizerPref.availability || {}, dateKey, slot)) {
          availableParticipants.push(organizer.name);
        }
      }

      if (availableParticipants.length > 0) {
        const startHour = slot === "morning" ? 6 : 12;
        const endHour = slot === "morning" ? 12 : 18;

        windows.push({
          date: dateKey,
          time_slot: slot,
          start_time: setMinutes(setHours(day, startHour), 0),
          end_time: setMinutes(setHours(day, endHour), 0),
          participant_count: availableParticipants.length,
          total_participants: totalParticipants,
          available_names: availableParticipants,
          fit_rank: 0, // Will be set after sorting
        });
      }
    }
  }

  // Sort by participant count (descending) and assign ranks
  windows.sort((a, b) => b.participant_count - a.participant_count);
  
  let currentRank = 1;
  let previousCount = -1;
  
  for (let i = 0; i < windows.length; i++) {
    if (windows[i].participant_count !== previousCount) {
      currentRank = i + 1;
    }
    windows[i].fit_rank = currentRank;
    previousCount = windows[i].participant_count;
  }

  // Compute constraint summary
  const constraints = computeConstraints(preferences);

  return {
    windows,
    constraints,
    has_overlap: windows.some((w) => w.participant_count >= 2),
  };
}

/**
 * Compute the most restrictive constraints from all preferences
 */
function computeConstraints(preferences: Preference[]): ConstraintSummary {
  if (preferences.length === 0) {
    return {
      budget: "$$",
      budget_description: "$50-100",
      max_drive_minutes: 30,
      holes_preference: "either",
    };
  }

  // Budget: use the most restrictive (lowest)
  let minBudget = "$$$";
  let minBudgetOrder = 3;

  for (const pref of preferences) {
    const order = budgetOrder[pref.budget] || 2;
    if (order < minBudgetOrder) {
      minBudgetOrder = order;
      minBudget = pref.budget;
    }
  }

  // Max drive: use the minimum
  const minDrive = Math.min(...preferences.map((p) => p.max_drive_minutes || 30));

  // Holes: consensus logic
  const holesPrefs = preferences.map((p) => p.holes_preference || "either");
  let holesResult = "either";

  const all18 = holesPrefs.every((h) => h === "18");
  const all9 = holesPrefs.every((h) => h === "9");

  if (all18) {
    holesResult = "18";
  } else if (all9) {
    holesResult = "9";
  } else {
    holesResult = "either";
  }

  return {
    budget: minBudget,
    budget_description: budgetDescriptions[minBudget] || "$50-100",
    max_drive_minutes: minDrive,
    holes_preference: holesResult,
  };
}

/**
 * Format a window for display
 */
export function formatWindowDisplay(window: OverlapWindow): string {
  const dayName = format(parseISO(window.date), "EEEE");
  const slotName = window.time_slot === "morning" ? "Morning" : "Afternoon";
  return `${dayName} ${slotName}`;
}
