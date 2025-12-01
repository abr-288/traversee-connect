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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          available: boolean | null
          category: string
          created_at: string
          currency: string
          description: string | null
          duration: string
          featured: boolean | null
          highlights: string[] | null
          id: string
          image_url: string | null
          included: string[] | null
          location: string
          name: string
          price_per_unit: number
          rating: number | null
          reviews: number | null
          updated_at: string
        }
        Insert: {
          available?: boolean | null
          category: string
          created_at?: string
          currency?: string
          description?: string | null
          duration: string
          featured?: boolean | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          included?: string[] | null
          location: string
          name: string
          price_per_unit: number
          rating?: number | null
          reviews?: number | null
          updated_at?: string
        }
        Update: {
          available?: boolean | null
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          duration?: string
          featured?: boolean | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          included?: string[] | null
          location?: string
          name?: string
          price_per_unit?: number
          rating?: number | null
          reviews?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_details: Json | null
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string
          end_date: string | null
          external_ref: string | null
          guests: number
          id: string
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          service_id: string
          start_date: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_details?: Json | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          end_date?: string | null
          external_ref?: string | null
          guests?: number
          id?: string
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          service_id: string
          start_date: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_details?: Json | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          end_date?: string | null
          external_ref?: string | null
          guests?: number
          id?: string
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          service_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_preferences: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          layout_name: string
          updated_at: string | null
          user_id: string
          widgets_config: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          layout_name?: string
          updated_at?: string | null
          user_id: string
          widgets_config?: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          layout_name?: string
          updated_at?: string | null
          user_id?: string
          widgets_config?: Json
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          subscribed_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          subscribed_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      passengers: {
        Row: {
          booking_id: string
          created_at: string | null
          date_of_birth: string | null
          document_number: string | null
          document_type: string | null
          first_name: string
          id: string
          last_name: string
          nationality: string | null
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          date_of_birth?: string | null
          document_number?: string | null
          document_type?: string | null
          first_name: string
          id?: string
          last_name: string
          nationality?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          date_of_birth?: string | null
          document_number?: string | null
          document_type?: string | null
          first_name?: string
          id?: string
          last_name?: string
          nationality?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "passengers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          currency: string
          id: string
          payment_data: Json | null
          payment_method: string
          payment_provider: string
          status: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          currency?: string
          id?: string
          payment_data?: Json | null
          payment_method: string
          payment_provider?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          currency?: string
          id?: string
          payment_data?: Json | null
          payment_method?: string
          payment_provider?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          alert_threshold: number | null
          created_at: string
          currency: string
          current_price: number | null
          departure_date: string | null
          destination: string
          id: string
          is_active: boolean
          last_checked_at: string | null
          origin: string | null
          passengers: number | null
          return_date: string | null
          rooms: number | null
          service_type: string
          target_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_threshold?: number | null
          created_at?: string
          currency?: string
          current_price?: number | null
          departure_date?: string | null
          destination: string
          id?: string
          is_active?: boolean
          last_checked_at?: string | null
          origin?: string | null
          passengers?: number | null
          return_date?: string | null
          rooms?: number | null
          service_type: string
          target_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_threshold?: number | null
          created_at?: string
          currency?: string
          current_price?: number | null
          departure_date?: string | null
          destination?: string
          id?: string
          is_active?: boolean
          last_checked_at?: string | null
          origin?: string | null
          passengers?: number | null
          return_date?: string | null
          rooms?: number | null
          service_type?: string
          target_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          discount: number
          expires_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location: string
          name: string
          original_price: number
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount: number
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location: string
          name: string
          original_price: number
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount?: number
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string
          name?: string
          original_price?: number
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          id: string
          rating: number
          service_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          service_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          service_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          amenities: Json | null
          available: boolean | null
          created_at: string
          currency: string
          description: string | null
          destination: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          images: string[] | null
          location: string
          name: string
          price_per_unit: number
          rating: number | null
          specifications: Json | null
          total_reviews: number | null
          type: Database["public"]["Enums"]["service_type"]
          updated_at: string
        }
        Insert: {
          amenities?: Json | null
          available?: boolean | null
          created_at?: string
          currency?: string
          description?: string | null
          destination?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          location: string
          name: string
          price_per_unit: number
          rating?: number | null
          specifications?: Json | null
          total_reviews?: number | null
          type: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Update: {
          amenities?: Json | null
          available?: boolean | null
          created_at?: string
          currency?: string
          description?: string | null
          destination?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          location?: string
          name?: string
          price_per_unit?: number
          rating?: number | null
          specifications?: Json | null
          total_reviews?: number | null
          type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Relationships: []
      }
      site_config: {
        Row: {
          category: string
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          config_key: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stays: {
        Row: {
          available: boolean | null
          created_at: string
          currency: string
          description: string | null
          duration: string
          featured: boolean | null
          highlights: string[] | null
          id: string
          image_url: string | null
          location: string
          name: string
          price_per_unit: number
          rating: number | null
          reviews: number | null
          type: string
          updated_at: string
        }
        Insert: {
          available?: boolean | null
          created_at?: string
          currency?: string
          description?: string | null
          duration: string
          featured?: boolean | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          location: string
          name: string
          price_per_unit: number
          rating?: number | null
          reviews?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          available?: boolean | null
          created_at?: string
          currency?: string
          description?: string | null
          duration?: string
          featured?: boolean | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          price_per_unit?: number
          rating?: number | null
          reviews?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          color: string | null
          created_at: string | null
          features: string[] | null
          icon: string
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          plan_id: string
          popular: boolean | null
          price: string
          price_note: string | null
          sort_order: number | null
          subtitle: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          features?: string[] | null
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          plan_id: string
          popular?: boolean | null
          price: string
          price_note?: string | null
          sort_order?: number | null
          subtitle?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          features?: string[] | null
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          plan_id?: string
          popular?: boolean | null
          price?: string
          price_note?: string | null
          sort_order?: number | null
          subtitle?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_requests: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          notes: string | null
          phone: string
          plan_id: string
          plan_name: string
          status: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          phone: string
          plan_id: string
          plan_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string
          plan_id?: string
          plan_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      payment_status: "pending" | "paid" | "refunded" | "failed"
      service_type:
        | "hotel"
        | "flight"
        | "car"
        | "tour"
        | "event"
        | "flight_hotel"
        | "stay"
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
      app_role: ["admin", "user"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      payment_status: ["pending", "paid", "refunded", "failed"],
      service_type: [
        "hotel",
        "flight",
        "car",
        "tour",
        "event",
        "flight_hotel",
        "stay",
      ],
    },
  },
} as const
