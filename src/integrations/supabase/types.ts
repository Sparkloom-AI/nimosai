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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      business_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string
          city: string
          country: string
          created_at: string
          id: string
          is_active: boolean
          is_primary: boolean
          name: string
          phone: string | null
          postal_code: string
          state: string
          studio_id: string
          updated_at: string
        }
        Insert: {
          address: string
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          name: string
          phone?: string | null
          postal_code?: string
          state?: string
          studio_id: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          name?: string
          phone?: string | null
          postal_code?: string
          state?: string
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_locations_studio_id"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          country_code: string | null
          created_at: string
          currency: string | null
          email: string
          full_name: string | null
          id: string
          language: string | null
          phone_prefix: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          currency?: string | null
          email: string
          full_name?: string | null
          id: string
          language?: string | null
          phone_prefix?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          currency?: string | null
          email?: string
          full_name?: string | null
          id?: string
          language?: string | null
          phone_prefix?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration: number
          id: string
          is_active: boolean
          name: string
          price: number
          studio_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration: number
          id?: string
          is_active?: boolean
          name: string
          price: number
          studio_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_services_studio_id"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          business_category: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          timezone: string
          updated_at: string
          website: string | null
        }
        Insert: {
          business_category?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          timezone?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          business_category?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          timezone?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      team_member_addresses: {
        Row: {
          address_type: string
          city: string
          country: string
          created_at: string
          id: string
          is_primary: boolean
          postal_code: string
          state: string
          street_address: string
          team_member_id: string
        }
        Insert: {
          address_type?: string
          city: string
          country?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          postal_code: string
          state: string
          street_address: string
          team_member_id: string
        }
        Update: {
          address_type?: string
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          postal_code?: string
          state?: string
          street_address?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_addresses_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_emergency_contacts: {
        Row: {
          contact_name: string
          created_at: string
          email: string | null
          id: string
          is_primary: boolean
          phone: string
          relationship: string
          team_member_id: string
        }
        Insert: {
          contact_name: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          phone: string
          relationship: string
          team_member_id: string
        }
        Update: {
          contact_name?: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          phone?: string
          relationship?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_emergency_contacts_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_locations: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          location_id: string
          team_member_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          location_id: string
          team_member_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          location_id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_locations_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_services: {
        Row: {
          created_at: string
          custom_price: number | null
          id: string
          service_id: string
          team_member_id: string
        }
        Insert: {
          created_at?: string
          custom_price?: number | null
          id?: string
          service_id: string
          team_member_id: string
        }
        Update: {
          created_at?: string
          custom_price?: number | null
          id?: string
          service_id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_services_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_url: string | null
          calendar_color: string | null
          commission_rate: number | null
          created_at: string
          email: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          end_date: string | null
          first_name: string
          hourly_rate: number | null
          id: string
          is_bookable: boolean
          job_title: string | null
          last_name: string
          notes: string | null
          permission_level: Database["public"]["Enums"]["permission_level"]
          phone: string | null
          start_date: string
          studio_id: string
          team_member_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          calendar_color?: string | null
          commission_rate?: number | null
          created_at?: string
          email: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          end_date?: string | null
          first_name: string
          hourly_rate?: number | null
          id?: string
          is_bookable?: boolean
          job_title?: string | null
          last_name: string
          notes?: string | null
          permission_level?: Database["public"]["Enums"]["permission_level"]
          phone?: string | null
          start_date?: string
          studio_id: string
          team_member_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          calendar_color?: string | null
          commission_rate?: number | null
          created_at?: string
          email?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          end_date?: string | null
          first_name?: string
          hourly_rate?: number | null
          id?: string
          is_bookable?: boolean
          job_title?: string | null
          last_name?: string
          notes?: string | null
          permission_level?: Database["public"]["Enums"]["permission_level"]
          phone?: string | null
          start_date?: string
          studio_id?: string
          team_member_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_members_studio_id"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      team_shifts: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_recurring: boolean
          location_id: string
          notes: string | null
          recurring_pattern: string | null
          shift_date: string
          start_time: string
          status: Database["public"]["Enums"]["shift_status"]
          team_member_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_recurring?: boolean
          location_id: string
          notes?: string | null
          recurring_pattern?: string | null
          shift_date: string
          start_time: string
          status?: Database["public"]["Enums"]["shift_status"]
          team_member_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_recurring?: boolean
          location_id?: string
          notes?: string | null
          recurring_pattern?: string | null
          shift_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["shift_status"]
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_shifts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_shifts_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          studio_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          studio_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          studio_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_studio: {
        Args: { _studio_id: string; _user_id: string }
        Returns: boolean
      }
      check_email_exists: {
        Args: { email_address: string }
        Returns: boolean
      }
      create_studio_with_data: {
        Args: {
          studio_business_category?: string
          studio_description?: string
          studio_email?: string
          studio_name: string
          studio_phone?: string
          studio_timezone?: string
          studio_website?: string
        }
        Returns: {
          business_category: string
          created_at: string
          description: string
          email: string
          id: string
          name: string
          phone: string
          timezone: string
          updated_at: string
          website: string
        }[]
      }
      get_studio_by_id: {
        Args: { studio_id: string }
        Returns: {
          business_category: string
          created_at: string
          description: string
          email: string
          id: string
          name: string
          phone: string
          timezone: string
          updated_at: string
          website: string
        }[]
      }
      get_user_role: {
        Args: { _studio_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_studios: {
        Args: Record<PropertyKey, never>
        Returns: {
          business_category: string
          created_at: string
          description: string
          email: string
          id: string
          name: string
          phone: string
          timezone: string
          updated_at: string
          website: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _studio_id?: string
          _user_id: string
        }
        Returns: boolean
      }
      update_studio_data: {
        Args: {
          studio_business_category?: string
          studio_description?: string
          studio_email?: string
          studio_id: string
          studio_name?: string
          studio_phone?: string
          studio_timezone?: string
          studio_website?: string
        }
        Returns: {
          business_category: string
          created_at: string
          description: string
          email: string
          id: string
          name: string
          phone: string
          timezone: string
          updated_at: string
          website: string
        }[]
      }
    }
    Enums: {
      address_type: "home" | "work" | "mailing" | "emergency"
      app_role:
        | "studio_owner"
        | "manager"
        | "staff"
        | "freelancer"
        | "super_admin"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      employment_type: "full_time" | "part_time" | "contractor" | "intern"
      permission_level: "low" | "medium" | "high"
      service_category:
        | "haircut"
        | "color"
        | "styling"
        | "treatment"
        | "nails"
        | "skincare"
        | "massage"
        | "other"
      shift_status:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
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
    Enums: {
      address_type: ["home", "work", "mailing", "emergency"],
      app_role: [
        "studio_owner",
        "manager",
        "staff",
        "freelancer",
        "super_admin",
      ],
      appointment_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      employment_type: ["full_time", "part_time", "contractor", "intern"],
      permission_level: ["low", "medium", "high"],
      service_category: [
        "haircut",
        "color",
        "styling",
        "treatment",
        "nails",
        "skincare",
        "massage",
        "other",
      ],
      shift_status: [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
    },
  },
} as const
