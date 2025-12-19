export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      courses: {
        Row: {
          address: string
          created_at: string
          holes_available: string
          id: string
          name: string
          phone: string | null
          price_tier: string
          website: string | null
          zip_code: string
        }
        Insert: {
          address: string
          created_at?: string
          holes_available?: string
          id?: string
          name: string
          phone?: string | null
          price_tier?: string
          website?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          created_at?: string
          holes_available?: string
          id?: string
          name?: string
          phone?: string | null
          price_tier?: string
          website?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      outings: {
        Row: {
          created_at: string
          date_range_end: string
          date_range_start: string
          deadline: string
          id: string
          location_zip: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_range_end: string
          date_range_start: string
          deadline: string
          id?: string
          location_zip: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_range_end?: string
          date_range_start?: string
          deadline?: string
          id?: string
          location_zip?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          available_dates: string[] | null
          created_at: string
          id: string
          is_organizer: boolean
          name: string
          outing_id: string
          phone: string | null
        }
        Insert: {
          available_dates?: string[] | null
          created_at?: string
          id?: string
          is_organizer?: boolean
          name: string
          outing_id: string
          phone?: string | null
        }
        Update: {
          available_dates?: string[] | null
          created_at?: string
          id?: string
          is_organizer?: boolean
          name?: string
          outing_id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_outing_id_fkey"
            columns: ["outing_id"]
            isOneToOne: false
            referencedRelation: "outings"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_cards: {
        Row: {
          course_address: string
          course_name: string
          created_at: string
          drive_time: string
          estimated_cost: string
          fit_score: number
          id: string
          outing_id: string
          rationale: string[]
          time_window_end: string
          time_window_start: string
          title: string
        }
        Insert: {
          course_address: string
          course_name: string
          created_at?: string
          drive_time: string
          estimated_cost: string
          fit_score?: number
          id?: string
          outing_id: string
          rationale?: string[]
          time_window_end: string
          time_window_start: string
          title: string
        }
        Update: {
          course_address?: string
          course_name?: string
          created_at?: string
          drive_time?: string
          estimated_cost?: string
          fit_score?: number
          id?: string
          outing_id?: string
          rationale?: string[]
          time_window_end?: string
          time_window_start?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_cards_outing_id_fkey"
            columns: ["outing_id"]
            isOneToOne: false
            referencedRelation: "outings"
            referencedColumns: ["id"]
          },
        ]
      }
      preferences: {
        Row: {
          availability: Json
          budget: string
          created_at: string
          holes_preference: string
          id: string
          max_drive_minutes: number
          outing_id: string
          participant_id: string
          updated_at: string
        }
        Insert: {
          availability?: Json
          budget?: string
          created_at?: string
          holes_preference?: string
          id?: string
          max_drive_minutes?: number
          outing_id: string
          participant_id: string
          updated_at?: string
        }
        Update: {
          availability?: Json
          budget?: string
          created_at?: string
          holes_preference?: string
          id?: string
          max_drive_minutes?: number
          outing_id?: string
          participant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferences_outing_id_fkey"
            columns: ["outing_id"]
            isOneToOne: false
            referencedRelation: "outings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preferences_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: true
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          plan_card_id: string
          vote: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          plan_card_id: string
          vote: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          plan_card_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_plan_card_id_fkey"
            columns: ["plan_card_id"]
            isOneToOne: false
            referencedRelation: "plan_cards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
