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
      appointment_booking_rules: {
        Row: {
          allow_group_appointments: boolean
          allow_team_member_selection: boolean
          cancellation_allowed: boolean
          cancellation_buffer_hours: number
          created_at: string
          future_booking_limit_months: number
          id: string
          immediate_booking_allowed: boolean
          immediate_booking_buffer_minutes: number
          max_group_size: number
          online_booking_enabled: boolean
          rescheduling_allowed: boolean
          rescheduling_buffer_hours: number
          studio_id: string
          updated_at: string
        }
        Insert: {
          allow_group_appointments?: boolean
          allow_team_member_selection?: boolean
          cancellation_allowed?: boolean
          cancellation_buffer_hours?: number
          created_at?: string
          future_booking_limit_months?: number
          id?: string
          immediate_booking_allowed?: boolean
          immediate_booking_buffer_minutes?: number
          max_group_size?: number
          online_booking_enabled?: boolean
          rescheduling_allowed?: boolean
          rescheduling_buffer_hours?: number
          studio_id: string
          updated_at?: string
        }
        Update: {
          allow_group_appointments?: boolean
          allow_team_member_selection?: boolean
          cancellation_allowed?: boolean
          cancellation_buffer_hours?: number
          created_at?: string
          future_booking_limit_months?: number
          id?: string
          immediate_booking_allowed?: boolean
          immediate_booking_buffer_minutes?: number
          max_group_size?: number
          online_booking_enabled?: boolean
          rescheduling_allowed?: boolean
          rescheduling_buffer_hours?: number
          studio_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointment_history: {
        Row: {
          appointment_id: string
          change_type: string
          changed_by: string
          created_at: string
          id: string
          new_values: Json | null
          notes: string | null
          old_values: Json | null
        }
        Insert: {
          appointment_id: string
          change_type: string
          changed_by: string
          created_at?: string
          id?: string
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
        }
        Update: {
          appointment_id?: string
          change_type?: string
          changed_by?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          booking_source: string | null
          client_arrived_at: string | null
          client_id: string | null
          confirmation_sent_at: string | null
          created_at: string
          end_time: string
          id: string
          internal_notes: string | null
          location_id: string
          notes: string | null
          paid_amount: number
          payment_status: string
          reminder_sent_at: string | null
          service_completed_at: string | null
          service_id: string
          service_started_at: string | null
          start_time: string
          status: string
          studio_id: string
          team_member_id: string
          total_price: number
          updated_at: string
        }
        Insert: {
          appointment_date: string
          booking_source?: string | null
          client_arrived_at?: string | null
          client_id?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          end_time: string
          id?: string
          internal_notes?: string | null
          location_id: string
          notes?: string | null
          paid_amount?: number
          payment_status?: string
          reminder_sent_at?: string | null
          service_completed_at?: string | null
          service_id: string
          service_started_at?: string | null
          start_time: string
          status?: string
          studio_id: string
          team_member_id: string
          total_price?: number
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          booking_source?: string | null
          client_arrived_at?: string | null
          client_id?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          end_time?: string
          id?: string
          internal_notes?: string | null
          location_id?: string
          notes?: string | null
          paid_amount?: number
          payment_status?: string
          reminder_sent_at?: string | null
          service_completed_at?: string | null
          service_id?: string
          service_started_at?: string | null
          start_time?: string
          status?: string
          studio_id?: string
          team_member_id?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_rules: {
        Row: {
          created_at: string
          day_of_week: number | null
          effective_from: string
          effective_until: string | null
          end_time: string
          id: string
          is_available: boolean
          location_id: string | null
          rule_type: string
          service_id: string | null
          start_time: string
          studio_id: string
          team_member_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          effective_from?: string
          effective_until?: string | null
          end_time: string
          id?: string
          is_available?: boolean
          location_id?: string | null
          rule_type: string
          service_id?: string | null
          start_time: string
          studio_id: string
          team_member_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          effective_from?: string
          effective_until?: string | null
          end_time?: string
          id?: string
          is_available?: boolean
          location_id?: string | null
          rule_type?: string
          service_id?: string | null
          start_time?: string
          studio_id?: string
          team_member_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_rules_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_time: {
        Row: {
          block_type: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          end_time: string | null
          id: string
          is_all_day: boolean
          is_recurring: boolean
          location_id: string | null
          recurring_pattern: Json | null
          start_date: string
          start_time: string | null
          studio_id: string
          team_member_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          block_type?: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          end_time?: string | null
          id?: string
          is_all_day?: boolean
          is_recurring?: boolean
          location_id?: string | null
          recurring_pattern?: Json | null
          start_date: string
          start_time?: string | null
          studio_id: string
          team_member_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          block_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          end_time?: string | null
          id?: string
          is_all_day?: boolean
          is_recurring?: boolean
          location_id?: string | null
          recurring_pattern?: Json | null
          start_date?: string
          start_time?: string | null
          studio_id?: string
          team_member_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_time_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_time_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
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
      business_hours: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string | null
          id: string
          is_closed: boolean
          location_id: string
          start_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time?: string | null
          id?: string
          is_closed?: boolean
          location_id: string
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string | null
          id?: string
          is_closed?: boolean
          location_id?: string
          start_time?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      client_preferences: {
        Row: {
          accessibility_needs: string | null
          allergies: string | null
          booking_preferences: Json | null
          client_id: string
          communication_preferences: Json | null
          created_at: string
          id: string
          preferred_locations: string[] | null
          preferred_team_members: string[] | null
          preferred_times: Json | null
          updated_at: string
        }
        Insert: {
          accessibility_needs?: string | null
          allergies?: string | null
          booking_preferences?: Json | null
          client_id: string
          communication_preferences?: Json | null
          created_at?: string
          id?: string
          preferred_locations?: string[] | null
          preferred_team_members?: string[] | null
          preferred_times?: Json | null
          updated_at?: string
        }
        Update: {
          accessibility_needs?: string | null
          allergies?: string | null
          booking_preferences?: Json | null
          client_id?: string
          communication_preferences?: Json | null
          created_at?: string
          id?: string
          preferred_locations?: string[] | null
          preferred_team_members?: string[] | null
          preferred_times?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          preferences: Json | null
          studio_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          studio_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          studio_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string
          address_components: Json | null
          city: string
          country: string
          created_at: string
          google_maps_shortlink: string | null
          id: string
          is_active: boolean
          is_primary: boolean
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          place_id: string | null
          postal_code: string
          shortlink_generated_at: string | null
          state: string
          studio_id: string
          updated_at: string
        }
        Insert: {
          address: string
          address_components?: Json | null
          city?: string
          country?: string
          created_at?: string
          google_maps_shortlink?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          place_id?: string | null
          postal_code?: string
          shortlink_generated_at?: string | null
          state?: string
          studio_id: string
          updated_at?: string
        }
        Update: {
          address?: string
          address_components?: Json | null
          city?: string
          country?: string
          created_at?: string
          google_maps_shortlink?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          place_id?: string | null
          postal_code?: string
          shortlink_generated_at?: string | null
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
        ]
      }
      packages: {
        Row: {
          category: string
          created_at: string
          description: string | null
          discount_type: string | null
          discount_value: number | null
          id: string
          is_active: boolean
          name: string
          price: number
          services: Json
          studio_id: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
          services?: Json
          studio_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          services?: Json
          studio_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_setup_complete: boolean
          avatar_url: string | null
          country: string | null
          country_code: string | null
          created_at: string
          currency: string | null
          email: string
          full_name: string | null
          id: string
          language: string | null
          onboarding_complete: boolean
          phone_prefix: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          account_setup_complete?: boolean
          avatar_url?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          currency?: string | null
          email: string
          full_name?: string | null
          id: string
          language?: string | null
          onboarding_complete?: boolean
          phone_prefix?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          account_setup_complete?: boolean
          avatar_url?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          currency?: string | null
          email?: string
          full_name?: string | null
          id?: string
          language?: string | null
          onboarding_complete?: boolean
          phone_prefix?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quick_link_settings: {
        Row: {
          auto_generate_maps_links: boolean
          created_at: string
          id: string
          maps_link_refresh_days: number
          studio_id: string
          updated_at: string
          whatsapp_link_template: string | null
        }
        Insert: {
          auto_generate_maps_links?: boolean
          created_at?: string
          id?: string
          maps_link_refresh_days?: number
          studio_id: string
          updated_at?: string
          whatsapp_link_template?: string | null
        }
        Update: {
          auto_generate_maps_links?: boolean
          created_at?: string
          id?: string
          maps_link_refresh_days?: number
          studio_id?: string
          updated_at?: string
          whatsapp_link_template?: string | null
        }
        Relationships: []
      }
      rate_limit_attempts: {
        Row: {
          action_type: string
          attempt_count: number
          created_at: string
          id: string
          ip_address: unknown | null
          user_id: string | null
          window_start: string
        }
        Insert: {
          action_type: string
          attempt_count?: number
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_id?: string | null
          window_start?: string
        }
        Update: {
          action_type?: string
          attempt_count?: number
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_id?: string | null
          window_start?: string
        }
        Relationships: []
      }
      recurring_appointments: {
        Row: {
          client_id: string
          created_at: string
          end_date: string | null
          end_time: string
          id: string
          is_active: boolean
          location_id: string
          notes: string | null
          pattern_config: Json
          pattern_type: string
          service_id: string
          start_date: string
          start_time: string
          studio_id: string
          team_member_id: string
          total_price: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          end_date?: string | null
          end_time: string
          id?: string
          is_active?: boolean
          location_id: string
          notes?: string | null
          pattern_config?: Json
          pattern_type: string
          service_id: string
          start_date: string
          start_time: string
          studio_id: string
          team_member_id: string
          total_price?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          end_date?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          location_id?: string
          notes?: string | null
          pattern_config?: Json
          pattern_type?: string
          service_id?: string
          start_date?: string
          start_time?: string
          studio_id?: string
          team_member_id?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_appointments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_appointments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string
          event_details: Json
          event_type: string
          id: string
          ip_address: unknown | null
          studio_id: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_details?: Json
          event_type: string
          id?: string
          ip_address?: unknown | null
          studio_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_details?: Json
          event_type?: string
          id?: string
          ip_address?: unknown | null
          studio_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_buffers: {
        Row: {
          cleanup_time: number
          created_at: string
          id: string
          service_id: string
          setup_time: number
          travel_time: number
          updated_at: string
        }
        Insert: {
          cleanup_time?: number
          created_at?: string
          id?: string
          service_id: string
          setup_time?: number
          travel_time?: number
          updated_at?: string
        }
        Update: {
          cleanup_time?: number
          created_at?: string
          id?: string
          service_id?: string
          setup_time?: number
          travel_time?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_buffers_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
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
          category?: string
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
          category?: string
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
        ]
      }
      studio_business_categories: {
        Row: {
          business_category_id: string
          created_at: string
          id: string
          is_primary: boolean
          studio_id: string
        }
        Insert: {
          business_category_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          studio_id: string
        }
        Update: {
          business_category_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_business_categories_business_category_id_fkey"
            columns: ["business_category_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_business_categories_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          country: string | null
          created_at: string
          currency: string | null
          default_client_language: string | null
          default_team_language: string | null
          description: string | null
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          name: string
          phone: string | null
          studio_manager_whatsapp: string | null
          studio_owner_whatsapp: string | null
          tax_included: boolean | null
          tiktok_url: string | null
          timezone: string
          updated_at: string
          website: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          currency?: string | null
          default_client_language?: string | null
          default_team_language?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          name: string
          phone?: string | null
          studio_manager_whatsapp?: string | null
          studio_owner_whatsapp?: string | null
          tax_included?: boolean | null
          tiktok_url?: string | null
          timezone?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          currency?: string | null
          default_client_language?: string | null
          default_team_language?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          name?: string
          phone?: string | null
          studio_manager_whatsapp?: string | null
          studio_owner_whatsapp?: string | null
          tax_included?: boolean | null
          tiktok_url?: string | null
          timezone?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      team_member_addresses: {
        Row: {
          address_type: Database["public"]["Enums"]["address_type"]
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
          address_type?: Database["public"]["Enums"]["address_type"]
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
          address_type?: Database["public"]["Enums"]["address_type"]
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
      waitlist: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_active: boolean
          location_id: string | null
          notes: string | null
          notification_preferences: Json | null
          preferred_date_end: string | null
          preferred_date_start: string | null
          preferred_team_member_id: string | null
          preferred_time_end: string | null
          preferred_time_start: string | null
          priority_score: number | null
          service_id: string
          studio_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          location_id?: string | null
          notes?: string | null
          notification_preferences?: Json | null
          preferred_date_end?: string | null
          preferred_date_start?: string | null
          preferred_team_member_id?: string | null
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          priority_score?: number | null
          service_id: string
          studio_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          location_id?: string | null
          notes?: string | null
          notification_preferences?: Json | null
          preferred_date_end?: string | null
          preferred_date_start?: string | null
          preferred_team_member_id?: string | null
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          priority_score?: number | null
          service_id?: string
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_preferred_team_member_id_fkey"
            columns: ["preferred_team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_role_secure: {
        Args: {
          p_assigned_by?: string
          p_role: Database["public"]["Enums"]["app_role"]
          p_studio_id: string
          p_user_id: string
        }
        Returns: string
      }
      can_manage_studio: {
        Args: { _studio_id: string; _user_id: string }
        Returns: boolean
      }
      check_email_exists: {
        Args: { email_address: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_action_type?: string
          p_ip_address?: unknown
          p_max_attempts?: number
          p_user_id?: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      create_studio_with_data: {
        Args: {
          p_additional_category_ids?: string[]
          p_studio_business_category_id?: string
          p_studio_description?: string
          p_studio_email?: string
          p_studio_name: string
          p_studio_phone?: string
          p_studio_timezone?: string
          p_studio_website?: string
        }
        Returns: string
      }
      enhanced_rate_limit_check: {
        Args: {
          p_action_type?: string
          p_ip_address?: unknown
          p_max_attempts?: number
          p_user_id?: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      get_studio_by_id: {
        Args: { studio_id: string }
        Returns: {
          country: string
          created_at: string
          currency: string
          default_client_language: string
          default_team_language: string
          description: string
          email: string
          facebook_url: string
          id: string
          instagram_url: string
          name: string
          phone: string
          tax_included: boolean
          tiktok_url: string
          timezone: string
          updated_at: string
          website: string
        }[]
      }
      get_studio_categories: {
        Args: { studio_id: string }
        Returns: {
          category_description: string
          category_id: string
          category_name: string
          is_primary: boolean
        }[]
      }
      get_user_role: {
        Args: { _studio_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_studios: {
        Args: Record<PropertyKey, never>
        Returns: {
          country: string
          created_at: string
          currency: string
          default_client_language: string
          default_team_language: string
          description: string
          email: string
          facebook_url: string
          id: string
          instagram_url: string
          name: string
          phone: string
          tax_included: boolean
          tiktok_url: string
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
      log_security_event_enhanced: {
        Args: {
          p_event_details?: Json
          p_event_type: string
          p_ip_address?: unknown
          p_studio_id?: string
          p_user_id?: string
        }
        Returns: undefined
      }
      remove_user_role_secure: {
        Args: { p_removed_by?: string; p_role_id: string }
        Returns: boolean
      }
      update_studio_data: {
        Args:
          | {
              studio_country?: string
              studio_currency?: string
              studio_default_client_language?: string
              studio_default_team_language?: string
              studio_description?: string
              studio_email?: string
              studio_facebook_url?: string
              studio_id: string
              studio_instagram_url?: string
              studio_linkedin_url?: string
              studio_name?: string
              studio_phone?: string
              studio_tax_included?: boolean
              studio_timezone?: string
              studio_twitter_url?: string
              studio_website?: string
            }
          | {
              studio_country?: string
              studio_currency?: string
              studio_default_client_language?: string
              studio_default_team_language?: string
              studio_description?: string
              studio_email?: string
              studio_facebook_url?: string
              studio_id: string
              studio_instagram_url?: string
              studio_name?: string
              studio_phone?: string
              studio_tax_included?: boolean
              studio_tiktok_url?: string
              studio_timezone?: string
              studio_website?: string
            }
        Returns: {
          country: string
          created_at: string
          currency: string
          default_client_language: string
          default_team_language: string
          description: string
          email: string
          facebook_url: string
          id: string
          instagram_url: string
          linkedin_url: string
          name: string
          phone: string
          tax_included: boolean
          timezone: string
          twitter_url: string
          updated_at: string
          website: string
        }[]
      }
      validate_studio_access_secure: {
        Args: { p_action?: string; p_studio_id: string; p_user_id: string }
        Returns: boolean
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
      permission_level: "low" | "medium" | "high" | "admin"
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
      permission_level: ["low", "medium", "high", "admin"],
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
