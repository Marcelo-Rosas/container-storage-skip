// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      billing_lines: {
        Row: {
          allocated_cost_brl: number
          base_cost_brl: number
          billed_at: string | null
          billing_period_end: string
          billing_period_start: string
          client_id: string
          client_reference: string | null
          container_id: string
          created_at: string | null
          created_by: string | null
          id: string
          initial_quantity: number
          initial_volume_m3: number | null
          invoice_date: string | null
          invoice_number: string | null
          model_code: string | null
          notes: string | null
          paid_at: string | null
          product_name: string
          remaining_quantity: number
          removal_percentage: number
          removed_quantity: number
          removed_volume_m3: number | null
          sku: string
          snapshot_id: string
          status: Database['public']['Enums']['billing_status'] | null
          unit_cost_brl: number | null
          volume_percentage: number | null
        }
        Insert: {
          allocated_cost_brl: number
          base_cost_brl: number
          billed_at?: string | null
          billing_period_end: string
          billing_period_start: string
          client_id: string
          client_reference?: string | null
          container_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          initial_quantity: number
          initial_volume_m3?: number | null
          invoice_date?: string | null
          invoice_number?: string | null
          model_code?: string | null
          notes?: string | null
          paid_at?: string | null
          product_name: string
          remaining_quantity: number
          removal_percentage: number
          removed_quantity: number
          removed_volume_m3?: number | null
          sku: string
          snapshot_id: string
          status?: Database['public']['Enums']['billing_status'] | null
          unit_cost_brl?: number | null
          volume_percentage?: number | null
        }
        Update: {
          allocated_cost_brl?: number
          base_cost_brl?: number
          billed_at?: string | null
          billing_period_end?: string
          billing_period_start?: string
          client_id?: string
          client_reference?: string | null
          container_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          initial_quantity?: number
          initial_volume_m3?: number | null
          invoice_date?: string | null
          invoice_number?: string | null
          model_code?: string | null
          notes?: string | null
          paid_at?: string | null
          product_name?: string
          remaining_quantity?: number
          removal_percentage?: number
          removed_quantity?: number
          removed_volume_m3?: number | null
          sku?: string
          snapshot_id?: string
          status?: Database['public']['Enums']['billing_status'] | null
          unit_cost_brl?: number | null
          volume_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'billing_lines_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['client_id']
          },
          {
            foreignKeyName: 'billing_lines_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'billing_lines_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'container_summary'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'billing_lines_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'containers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'billing_lines_snapshot_id_fkey'
            columns: ['snapshot_id']
            isOneToOne: false
            referencedRelation: 'snapshots'
            referencedColumns: ['id']
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'client_users_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['client_id']
          },
          {
            foreignKeyName: 'client_users_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          billing_email: string | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          default_base_cost_brl: number | null
          default_measurement_day: number | null
          email: string | null
          id: string
          name: string
          phone: string | null
          state: string | null
          status: string | null
          tax_id: string
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          billing_email?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          default_base_cost_brl?: number | null
          default_measurement_day?: number | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          status?: string | null
          tax_id: string
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          billing_email?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          default_base_cost_brl?: number | null
          default_measurement_day?: number | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          status?: string | null
          tax_id?: string
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      container_types: {
        Row: {
          code: string
          cubic_capacity_m3: number | null
          description: string | null
          door_height_mm: number | null
          door_width_mm: number | null
          external_height_mm: number | null
          external_length_mm: number | null
          external_width_mm: number | null
          has_open_sides: boolean | null
          has_open_top: boolean | null
          has_refrigeration: boolean | null
          has_ventilation: boolean | null
          id: number
          internal_height_mm: number | null
          internal_length_mm: number | null
          internal_width_mm: number | null
          is_active: boolean | null
          is_tank: boolean | null
          max_gross_weight_kg: number | null
          max_payload_kg: number | null
          max_temperature_celsius: number | null
          min_temperature_celsius: number | null
          name: string
          size_feet: string | null
          special_features: Json | null
          suitable_cargo: Json | null
          tare_weight_kg: number | null
          type_category: string
        }
        Insert: {
          code: string
          cubic_capacity_m3?: number | null
          description?: string | null
          door_height_mm?: number | null
          door_width_mm?: number | null
          external_height_mm?: number | null
          external_length_mm?: number | null
          external_width_mm?: number | null
          has_open_sides?: boolean | null
          has_open_top?: boolean | null
          has_refrigeration?: boolean | null
          has_ventilation?: boolean | null
          id?: number
          internal_height_mm?: number | null
          internal_length_mm?: number | null
          internal_width_mm?: number | null
          is_active?: boolean | null
          is_tank?: boolean | null
          max_gross_weight_kg?: number | null
          max_payload_kg?: number | null
          max_temperature_celsius?: number | null
          min_temperature_celsius?: number | null
          name: string
          size_feet?: string | null
          special_features?: Json | null
          suitable_cargo?: Json | null
          tare_weight_kg?: number | null
          type_category: string
        }
        Update: {
          code?: string
          cubic_capacity_m3?: number | null
          description?: string | null
          door_height_mm?: number | null
          door_width_mm?: number | null
          external_height_mm?: number | null
          external_length_mm?: number | null
          external_width_mm?: number | null
          has_open_sides?: boolean | null
          has_open_top?: boolean | null
          has_refrigeration?: boolean | null
          has_ventilation?: boolean | null
          id?: number
          internal_height_mm?: number | null
          internal_length_mm?: number | null
          internal_width_mm?: number | null
          is_active?: boolean | null
          is_tank?: boolean | null
          max_gross_weight_kg?: number | null
          max_payload_kg?: number | null
          max_temperature_celsius?: number | null
          min_temperature_celsius?: number | null
          name?: string
          size_feet?: string | null
          special_features?: Json | null
          suitable_cargo?: Json | null
          tare_weight_kg?: number | null
          type_category?: string
        }
        Relationships: []
      }
      containers: {
        Row: {
          base_cost_brl: number | null
          client_id: string
          container_number: string
          container_type: string
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          measurement_day: number | null
          nominal_volume_m3: number | null
          notes: string | null
          start_date: string
          status: Database['public']['Enums']['container_status'] | null
          updated_at: string | null
          yard_location: string | null
        }
        Insert: {
          base_cost_brl?: number | null
          client_id: string
          container_number: string
          container_type: string
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          measurement_day?: number | null
          nominal_volume_m3?: number | null
          notes?: string | null
          start_date: string
          status?: Database['public']['Enums']['container_status'] | null
          updated_at?: string | null
          yard_location?: string | null
        }
        Update: {
          base_cost_brl?: number | null
          client_id?: string
          container_number?: string
          container_type?: string
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          measurement_day?: number | null
          nominal_volume_m3?: number | null
          notes?: string | null
          start_date?: string
          status?: Database['public']['Enums']['container_status'] | null
          updated_at?: string | null
          yard_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'containers_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['client_id']
          },
          {
            foreignKeyName: 'containers_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      events: {
        Row: {
          client_reference: string | null
          container_id: string
          created_at: string | null
          created_by: string | null
          document_number: string | null
          document_type: string | null
          document_url: string | null
          event_date: string
          event_type: Database['public']['Enums']['event_type']
          id: string
          import_batch_id: string | null
          imported_from: string | null
          justification: string | null
          model_code: string | null
          notes: string | null
          origin_destination: string | null
          product_name: string
          quantity: number
          sku: string
          total_gross_weight_kg: number | null
          total_net_weight_kg: number | null
          total_volume_m3: number | null
          unit: string | null
          unit_gross_weight_kg: number | null
          unit_net_weight_kg: number | null
          unit_value_usd: number | null
          unit_volume_m3: number | null
        }
        Insert: {
          client_reference?: string | null
          container_id: string
          created_at?: string | null
          created_by?: string | null
          document_number?: string | null
          document_type?: string | null
          document_url?: string | null
          event_date?: string
          event_type: Database['public']['Enums']['event_type']
          id?: string
          import_batch_id?: string | null
          imported_from?: string | null
          justification?: string | null
          model_code?: string | null
          notes?: string | null
          origin_destination?: string | null
          product_name: string
          quantity: number
          sku: string
          total_gross_weight_kg?: number | null
          total_net_weight_kg?: number | null
          total_volume_m3?: number | null
          unit?: string | null
          unit_gross_weight_kg?: number | null
          unit_net_weight_kg?: number | null
          unit_value_usd?: number | null
          unit_volume_m3?: number | null
        }
        Update: {
          client_reference?: string | null
          container_id?: string
          created_at?: string | null
          created_by?: string | null
          document_number?: string | null
          document_type?: string | null
          document_url?: string | null
          event_date?: string
          event_type?: Database['public']['Enums']['event_type']
          id?: string
          import_batch_id?: string | null
          imported_from?: string | null
          justification?: string | null
          model_code?: string | null
          notes?: string | null
          origin_destination?: string | null
          product_name?: string
          quantity?: number
          sku?: string
          total_gross_weight_kg?: number | null
          total_net_weight_kg?: number | null
          total_volume_m3?: number | null
          unit?: string | null
          unit_gross_weight_kg?: number | null
          unit_net_weight_kg?: number | null
          unit_value_usd?: number | null
          unit_volume_m3?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'events_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'container_summary'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'events_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'containers'
            referencedColumns: ['id']
          },
        ]
      }
      import_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          errors: Json | null
          failed_records: number | null
          file_name: string | null
          file_size_bytes: number | null
          file_url: string | null
          id: string
          job_type: string
          max_retries: number | null
          next_retry_at: string | null
          payload: Json
          processed_records: number | null
          progress_message: string | null
          progress_percentage: number | null
          result: Json | null
          retry_count: number | null
          started_at: string | null
          status: Database['public']['Enums']['job_status'] | null
          total_records: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          errors?: Json | null
          failed_records?: number | null
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          job_type: string
          max_retries?: number | null
          next_retry_at?: string | null
          payload: Json
          processed_records?: number | null
          progress_message?: string | null
          progress_percentage?: number | null
          result?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: Database['public']['Enums']['job_status'] | null
          total_records?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          errors?: Json | null
          failed_records?: number | null
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          job_type?: string
          max_retries?: number | null
          next_retry_at?: string | null
          payload?: Json
          processed_records?: number | null
          progress_message?: string | null
          progress_percentage?: number | null
          result?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: Database['public']['Enums']['job_status'] | null
          total_records?: number | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          container_id: string
          current_quantity: number
          description: string | null
          id: string
          last_movement_at: string | null
          last_movement_type: Database['public']['Enums']['event_type'] | null
          model_code: string | null
          product_name: string
          sku: string
          total_gross_weight_kg: number | null
          total_net_weight_kg: number | null
          total_value_usd: number | null
          total_volume_m3: number | null
          unit: string | null
          unit_gross_weight_kg: number | null
          unit_net_weight_kg: number | null
          unit_value_usd: number | null
          unit_volume_m3: number | null
          updated_at: string | null
        }
        Insert: {
          container_id: string
          current_quantity?: number
          description?: string | null
          id?: string
          last_movement_at?: string | null
          last_movement_type?: Database['public']['Enums']['event_type'] | null
          model_code?: string | null
          product_name: string
          sku: string
          total_gross_weight_kg?: number | null
          total_net_weight_kg?: number | null
          total_value_usd?: number | null
          total_volume_m3?: number | null
          unit?: string | null
          unit_gross_weight_kg?: number | null
          unit_net_weight_kg?: number | null
          unit_value_usd?: number | null
          unit_volume_m3?: number | null
          updated_at?: string | null
        }
        Update: {
          container_id?: string
          current_quantity?: number
          description?: string | null
          id?: string
          last_movement_at?: string | null
          last_movement_type?: Database['public']['Enums']['event_type'] | null
          model_code?: string | null
          product_name?: string
          sku?: string
          total_gross_weight_kg?: number | null
          total_net_weight_kg?: number | null
          total_value_usd?: number | null
          total_volume_m3?: number | null
          unit?: string | null
          unit_gross_weight_kg?: number | null
          unit_net_weight_kg?: number | null
          unit_value_usd?: number | null
          unit_volume_m3?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'inventory_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'container_summary'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'inventory_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'containers'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          notification_type: string
          read: boolean | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          notification_type: string
          read?: boolean | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          notification_type?: string
          read?: boolean | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          role: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      snapshots: {
        Row: {
          allocated_cost_brl: number | null
          approved_at: string | null
          approved_by: string | null
          base_cost_brl: number
          container_id: string
          created_at: string | null
          created_by: string | null
          events_summary: Json | null
          id: string
          initial_volume_m3: number | null
          inventory_snapshot: Json
          measurement_day: number
          notes: string | null
          period_end: string
          period_start: string
          remaining_volume_m3: number | null
          removal_percentage: number | null
          removed_volume_m3: number | null
          snapshot_date: string
          status: Database['public']['Enums']['snapshot_status'] | null
          total_items: number | null
          total_volume_m3: number | null
          total_weight_kg: number | null
        }
        Insert: {
          allocated_cost_brl?: number | null
          approved_at?: string | null
          approved_by?: string | null
          base_cost_brl: number
          container_id: string
          created_at?: string | null
          created_by?: string | null
          events_summary?: Json | null
          id?: string
          initial_volume_m3?: number | null
          inventory_snapshot: Json
          measurement_day: number
          notes?: string | null
          period_end: string
          period_start: string
          remaining_volume_m3?: number | null
          removal_percentage?: number | null
          removed_volume_m3?: number | null
          snapshot_date: string
          status?: Database['public']['Enums']['snapshot_status'] | null
          total_items?: number | null
          total_volume_m3?: number | null
          total_weight_kg?: number | null
        }
        Update: {
          allocated_cost_brl?: number | null
          approved_at?: string | null
          approved_by?: string | null
          base_cost_brl?: number
          container_id?: string
          created_at?: string | null
          created_by?: string | null
          events_summary?: Json | null
          id?: string
          initial_volume_m3?: number | null
          inventory_snapshot?: Json
          measurement_day?: number
          notes?: string | null
          period_end?: string
          period_start?: string
          remaining_volume_m3?: number | null
          removal_percentage?: number | null
          removed_volume_m3?: number | null
          snapshot_date?: string
          status?: Database['public']['Enums']['snapshot_status'] | null
          total_items?: number | null
          total_volume_m3?: number | null
          total_weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'snapshots_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'container_summary'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'snapshots_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'containers'
            referencedColumns: ['id']
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          auth_user_id: string
          created_at: string | null
          full_name: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          auth_user_id: string
          created_at?: string | null
          full_name?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string
          created_at?: string | null
          full_name?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database['public']['Enums']['app_role']
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database['public']['Enums']['app_role']
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database['public']['Enums']['app_role']
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_users_view: {
        Row: {
          client_id: string | null
          client_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          is_active: boolean | null
          role: string | null
        }
        Relationships: []
      }
      container_summary: {
        Row: {
          base_cost_brl: number | null
          client_id: string | null
          client_name: string | null
          container_number: string | null
          container_type: string | null
          created_at: string | null
          id: string | null
          last_event_date: string | null
          occupancy_percentage: number | null
          start_date: string | null
          status: Database['public']['Enums']['container_status'] | null
          total_items: number | null
          total_skus: number | null
          total_volume_m3: number | null
          total_weight_kg: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'containers_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['client_id']
          },
          {
            foreignKeyName: 'containers_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      container_types_public: {
        Row: {
          code: string | null
          cubic_capacity_m3: number | null
          has_open_sides: boolean | null
          has_open_top: boolean | null
          has_refrigeration: boolean | null
          id: number | null
          is_active: boolean | null
          is_tank: boolean | null
          max_payload_kg: number | null
          name: string | null
          size_feet: string | null
          type_category: string | null
        }
        Insert: {
          code?: string | null
          cubic_capacity_m3?: number | null
          has_open_sides?: boolean | null
          has_open_top?: boolean | null
          has_refrigeration?: boolean | null
          id?: number | null
          is_active?: boolean | null
          is_tank?: boolean | null
          max_payload_kg?: number | null
          name?: string | null
          size_feet?: string | null
          type_category?: string | null
        }
        Update: {
          code?: string | null
          cubic_capacity_m3?: number | null
          has_open_sides?: boolean | null
          has_open_top?: boolean | null
          has_refrigeration?: boolean | null
          id?: number | null
          is_active?: boolean | null
          is_tank?: boolean | null
          max_payload_kg?: number | null
          name?: string | null
          size_feet?: string | null
          type_category?: string | null
        }
        Relationships: []
      }
      dashboard_kpis: {
        Row: {
          active_containers: number | null
          empty_containers: number | null
          events_last_24h: number | null
          events_last_7d: number | null
          failed_jobs_last_7d: number | null
          full_containers: number | null
          last_updated: string | null
          pending_billing_amount: number | null
          pending_jobs: number | null
          projected_monthly_revenue: number | null
          total_clients: number | null
          total_items_in_storage: number | null
          total_value_usd: number | null
          total_volume_m3: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_billing_lines: {
        Args: { p_snapshot_id: string }
        Returns: {
          allocated_cost_brl: number
          billing_line_id: string
          sku: string
        }[]
      }
      calculate_container_totals: {
        Args: { p_container_id: string }
        Returns: {
          occupancy_percentage: number
          total_items: number
          total_skus: number
          total_value_usd: number
          total_volume_m3: number
          total_weight_kg: number
        }[]
      }
      create_monthly_snapshot: {
        Args: { p_container_id: string; p_snapshot_date: string }
        Returns: string
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database['public']['Enums']['app_role']
      }
      has_role: {
        Args: {
          _role: Database['public']['Enums']['app_role']
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      normalize_code: { Args: { t: string }; Returns: string }
      normalize_container_type: { Args: { t: string }; Returns: string }
      normalize_size_feet: { Args: { t: string }; Returns: string }
      upsert_inventory_bulk: {
        Args: { p_container_id: string; p_items: Json }
        Returns: {
          affected_rows: number
          errors: string
          success: boolean
        }[]
      }
      user_client_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      app_role: 'admin' | 'operator' | 'viewer'
      billing_status: 'pending' | 'approved' | 'billed' | 'paid' | 'cancelled'
      container_status: 'active' | 'full' | 'empty' | 'closed'
      event_type: 'entry' | 'exit' | 'adjustment' | 'transfer'
      job_status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
      snapshot_status: 'draft' | 'approved' | 'billed' | 'paid'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ['admin', 'operator', 'viewer'],
      billing_status: ['pending', 'approved', 'billed', 'paid', 'cancelled'],
      container_status: ['active', 'full', 'empty', 'closed'],
      event_type: ['entry', 'exit', 'adjustment', 'transfer'],
      job_status: ['queued', 'processing', 'completed', 'failed', 'cancelled'],
      snapshot_status: ['draft', 'approved', 'billed', 'paid'],
    },
  },
} as const
