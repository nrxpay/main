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
      bank_accounts: {
        Row: {
          account_holder_name: string
          account_number: string
          bank_name: string
          branch_name: string
          created_at: string
          ifsc_code: string
          is_active: boolean
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          account_holder_name: string
          account_number: string
          bank_name: string
          branch_name: string
          created_at?: string
          ifsc_code: string
          is_active?: boolean
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          bank_name?: string
          branch_name?: string
          created_at?: string
          ifsc_code?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      bonus_tasks: {
        Row: {
          created_at: string
          id: string
          reward_amount: number
          task_description: string | null
          task_name: string
          task_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          reward_amount?: number
          task_description?: string | null
          task_name: string
          task_order: number
        }
        Update: {
          created_at?: string
          id?: string
          reward_amount?: number
          task_description?: string | null
          task_name?: string
          task_order?: number
        }
        Relationships: []
      }
      corporate_accounts: {
        Row: {
          address: string
          company_name: string
          company_type: string
          contact_email: string
          contact_person: string
          contact_phone: string
          created_at: string
          documents_uploaded: boolean | null
          gst_number: string | null
          id: string
          pan_number: string
          registration_number: string
          show_recharge_popup: boolean | null
          status: string
          updated_at: string
          user_id: string
          username: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address: string
          company_name: string
          company_type: string
          contact_email: string
          contact_person: string
          contact_phone: string
          created_at?: string
          documents_uploaded?: boolean | null
          gst_number?: string | null
          id?: string
          pan_number: string
          registration_number: string
          show_recharge_popup?: boolean | null
          status?: string
          updated_at?: string
          user_id: string
          username?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string
          company_name?: string
          company_type?: string
          contact_email?: string
          contact_person?: string
          contact_phone?: string
          created_at?: string
          documents_uploaded?: boolean | null
          gst_number?: string | null
          id?: string
          pan_number?: string
          registration_number?: string
          show_recharge_popup?: boolean | null
          status?: string
          updated_at?: string
          user_id?: string
          username?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      crypto_rates: {
        Row: {
          created_at: string
          created_by: string | null
          crypto_symbol: string
          crypto_type: string
          id: string
          is_active: boolean
          rate_inr: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          crypto_symbol: string
          crypto_type: string
          id?: string
          is_active?: boolean
          rate_inr?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          crypto_symbol?: string
          crypto_type?: string
          id?: string
          is_active?: boolean
          rate_inr?: number
          updated_at?: string
        }
        Relationships: []
      }
      crypto_transactions: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          crypto_symbol: string
          crypto_type: string
          id: string
          quantity: number
          rate_inr: number
          status: string
          total_inr: number
          transaction_id: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          crypto_symbol: string
          crypto_type: string
          id?: string
          quantity: number
          rate_inr: number
          status?: string
          total_inr: number
          transaction_id?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          crypto_symbol?: string
          crypto_type?: string
          id?: string
          quantity?: number
          rate_inr?: number
          status?: string
          total_inr?: number
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      current_accounts: {
        Row: {
          aadhar_photo_url: string | null
          account_holder_name: string
          account_number: string
          bank_name: string
          created_at: string
          id: string
          ifsc_code: string
          mobile_number: string
          pan_photo_url: string | null
          show_recharge_popup: boolean | null
          status: string
          updated_at: string
          user_id: string
          username: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          aadhar_photo_url?: string | null
          account_holder_name: string
          account_number: string
          bank_name: string
          created_at?: string
          id?: string
          ifsc_code: string
          mobile_number: string
          pan_photo_url?: string | null
          show_recharge_popup?: boolean | null
          status?: string
          updated_at?: string
          user_id: string
          username?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          aadhar_photo_url?: string | null
          account_holder_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          id?: string
          ifsc_code?: string
          mobile_number?: string
          pan_photo_url?: string | null
          show_recharge_popup?: boolean | null
          status?: string
          updated_at?: string
          user_id?: string
          username?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      daily_rankings: {
        Row: {
          created_at: string
          current_rank: number | null
          id: string
          rank_score: number | null
          total_transactions: number | null
          total_volume: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          current_rank?: number | null
          id?: string
          rank_score?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          current_rank?: number | null
          id?: string
          rank_score?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      deposits: {
        Row: {
          admin_notes: string | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          currency: string
          id: string
          proof_image_url: string | null
          status: string
          transaction_hash: string | null
          updated_at: string
          User: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          id?: string
          proof_image_url?: string | null
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          User?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          id?: string
          proof_image_url?: string | null
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          User?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposits_User_fkey"
            columns: ["User"]
            isOneToOne: false
            referencedRelation: "user_data"
            referencedColumns: ["username"]
          },
        ]
      }
      fund_rates: {
        Row: {
          created_at: string
          created_by: string | null
          fund_type: string
          id: string
          is_active: boolean
          rate: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          fund_type: string
          id?: string
          is_active?: boolean
          rate?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          fund_type?: string
          id?: string
          is_active?: boolean
          rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      minimum_recharge_config: {
        Row: {
          account_type: string
          created_at: string
          created_by: string
          currency: string
          id: string
          is_active: boolean
          minimum_amount: number
          updated_at: string
        }
        Insert: {
          account_type: string
          created_at?: string
          created_by: string
          currency?: string
          id?: string
          is_active?: boolean
          minimum_amount?: number
          updated_at?: string
        }
        Update: {
          account_type?: string
          created_at?: string
          created_by?: string
          currency?: string
          id?: string
          is_active?: boolean
          minimum_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      minimum_withdrawal_config: {
        Row: {
          created_at: string
          created_by: string
          currency: string
          id: string
          is_active: boolean
          minimum_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          currency?: string
          id?: string
          is_active?: boolean
          minimum_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          currency?: string
          id?: string
          is_active?: boolean
          minimum_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pins: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          pin_hash: string
          pin_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          pin_hash: string
          pin_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          pin_hash?: string
          pin_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recharge_bonus_spins: {
        Row: {
          bonus_percentage: number
          created_at: string
          has_spun: boolean
          id: string
          spun_at: string | null
          user_id: string
        }
        Insert: {
          bonus_percentage?: number
          created_at?: string
          has_spun?: boolean
          id?: string
          spun_at?: string | null
          user_id: string
        }
        Update: {
          bonus_percentage?: number
          created_at?: string
          has_spun?: boolean
          id?: string
          spun_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      savings_accounts: {
        Row: {
          aadhar_photo_url: string | null
          account_holder_name: string
          account_number: string
          bank_name: string
          created_at: string
          id: string
          ifsc_code: string
          mobile_number: string
          pan_photo_url: string | null
          show_recharge_popup: boolean | null
          status: string
          updated_at: string
          user_id: string
          username: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          aadhar_photo_url?: string | null
          account_holder_name: string
          account_number: string
          bank_name: string
          created_at?: string
          id?: string
          ifsc_code: string
          mobile_number: string
          pan_photo_url?: string | null
          show_recharge_popup?: boolean | null
          status?: string
          updated_at?: string
          user_id: string
          username?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          aadhar_photo_url?: string | null
          account_holder_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          id?: string
          ifsc_code?: string
          mobile_number?: string
          pan_photo_url?: string | null
          show_recharge_popup?: boolean | null
          status?: string
          updated_at?: string
          user_id?: string
          username?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      sensitive_data_audit_log: {
        Row: {
          accessed_at: string
          accessed_by: string
          accessed_record_id: string | null
          accessed_table: string
          action_type: string
          id: string
          ip_address: string | null
          user_role: string | null
        }
        Insert: {
          accessed_at?: string
          accessed_by: string
          accessed_record_id?: string | null
          accessed_table: string
          action_type: string
          id?: string
          ip_address?: string | null
          user_role?: string | null
        }
        Update: {
          accessed_at?: string
          accessed_by?: string
          accessed_record_id?: string | null
          accessed_table?: string
          action_type?: string
          id?: string
          ip_address?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      spin_wheel_config: {
        Row: {
          body_text: string
          colors: string[]
          created_at: string
          fixed_winning_percentage: number
          id: string
          is_active: boolean
          percentages: number[]
          title: string
          updated_at: string
        }
        Insert: {
          body_text?: string
          colors?: string[]
          created_at?: string
          fixed_winning_percentage?: number
          id?: string
          is_active?: boolean
          percentages?: number[]
          title?: string
          updated_at?: string
        }
        Update: {
          body_text?: string
          colors?: string[]
          created_at?: string
          fixed_winning_percentage?: number
          id?: string
          is_active?: boolean
          percentages?: number[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_stats: {
        Row: {
          created_at: string
          direct_referrals: number
          id: string
          team_members: number
          total_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          direct_referrals?: number
          id?: string
          team_members?: number
          total_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          direct_referrals?: number
          id?: string
          team_members?: number
          total_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          reference_id: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      usdt_rates: {
        Row: {
          buy_rate: number
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          sell_rate: number
          updated_at: string
        }
        Insert: {
          buy_rate: number
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          sell_rate: number
          updated_at?: string
        }
        Update: {
          buy_rate?: number
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          sell_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_balances: {
        Row: {
          created_at: string
          current_balance: number
          id: string
          updated_at: string
          usdt_balance: number
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          current_balance?: number
          id?: string
          updated_at?: string
          usdt_balance?: number
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          current_balance?: number
          id?: string
          updated_at?: string
          usdt_balance?: number
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_data: {
        Row: {
          created_at: string
          id: string
          mobile_number: string
          team: number | null
          updated_at: string
          user_id: string
          user_number: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          mobile_number: string
          team?: number | null
          updated_at?: string
          user_id: string
          user_number: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          mobile_number?: string
          team?: number | null
          updated_at?: string
          user_id?: string
          user_number?: string
          username?: string
        }
        Relationships: []
      }
      user_rankings: {
        Row: {
          created_at: string
          current_rank: number | null
          id: string
          rank_score: number | null
          total_transactions: number | null
          total_volume: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          current_rank?: number | null
          id?: string
          rank_score?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          current_rank?: number | null
          id?: string
          rank_score?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_username_fkey"
            columns: ["username"]
            isOneToOne: false
            referencedRelation: "user_data"
            referencedColumns: ["username"]
          },
        ]
      }
      user_task_completions: {
        Row: {
          bonus_credited: boolean
          bonus_credited_at: string | null
          completed_at: string | null
          created_at: string
          id: string
          is_bonus_active: boolean
          is_completed: boolean
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bonus_credited?: boolean
          bonus_credited_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          is_bonus_active?: boolean
          is_completed?: boolean
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bonus_credited?: boolean
          bonus_credited_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          is_bonus_active?: boolean
          is_completed?: boolean
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "bonus_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_rankings: {
        Row: {
          created_at: string
          current_rank: number | null
          id: string
          rank_score: number | null
          total_transactions: number | null
          total_volume: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          current_rank?: number | null
          id?: string
          rank_score?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          current_rank?: number | null
          id?: string
          rank_score?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_notes: string | null
          amount_inr: number
          amount_usdt: number
          approved_at: string | null
          approved_by: string | null
          bank_account_id: string
          created_at: string
          fund_rate: number | null
          fund_type: string | null
          id: string
          status: string
          updated_at: string
          usdt_rate: number
          user_id: string
          username: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount_inr: number
          amount_usdt: number
          approved_at?: string | null
          approved_by?: string | null
          bank_account_id: string
          created_at?: string
          fund_rate?: number | null
          fund_type?: string | null
          id?: string
          status?: string
          updated_at?: string
          usdt_rate: number
          user_id: string
          username?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount_inr?: number
          amount_usdt?: number
          approved_at?: string | null
          approved_by?: string | null
          bank_account_id?: string
          created_at?: string
          fund_rate?: number | null
          fund_type?: string | null
          id?: string
          status?: string
          updated_at?: string
          usdt_rate?: number
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_user_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "user"
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
      user_role: ["admin", "user"],
    },
  },
} as const
