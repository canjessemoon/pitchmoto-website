export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          user_type: 'founder' | 'investor' | 'admin'
          bio: string | null
          company: string | null
          location: string | null
          website: string | null
          linkedin_url: string | null
          profile_picture_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          user_type: 'founder' | 'investor' | 'admin'
          bio?: string | null
          company?: string | null
          location?: string | null
          website?: string | null
          linkedin_url?: string | null
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          user_type?: 'founder' | 'investor' | 'admin'
          bio?: string | null
          company?: string | null
          location?: string | null
          website?: string | null
          linkedin_url?: string | null
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      startups: {
        Row: {
          id: string
          founder_id: string
          name: string
          tagline: string
          description: string
          industry: string
          stage: string
          funding_goal: number
          current_funding: number
          pitch_deck_url: string | null
          logo_url: string | null
          website_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          founder_id: string
          name: string
          tagline: string
          description: string
          industry: string
          stage: string
          funding_goal: number
          current_funding?: number
          pitch_deck_url?: string | null
          logo_url?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          founder_id?: string
          name?: string
          tagline?: string
          description?: string
          industry?: string
          stage?: string
          funding_goal?: number
          current_funding?: number
          pitch_deck_url?: string | null
          logo_url?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pitches: {
        Row: {
          id: string
          startup_id: string
          title: string
          content: string
          pitch_type: 'text' | 'video' | 'slide'
          funding_ask: number
          video_url: string | null
          slide_url: string | null
          upvote_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          startup_id: string
          title: string
          content: string
          pitch_type: 'text' | 'video' | 'slide'
          funding_ask: number
          video_url?: string | null
          slide_url?: string | null
          upvote_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          startup_id?: string
          title?: string
          content?: string
          pitch_type?: 'text' | 'video' | 'slide'
          funding_ask?: number
          video_url?: string | null
          slide_url?: string | null
          upvote_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      upvotes: {
        Row: {
          id: string
          user_id: string
          pitch_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pitch_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pitch_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          pitch_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pitch_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pitch_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      watchlists: {
        Row: {
          id: string
          investor_id: string
          startup_id: string
          created_at: string
        }
        Insert: {
          id?: string
          investor_id: string
          startup_id: string
          created_at?: string
        }
        Update: {
          id?: string
          investor_id?: string
          startup_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          startup_id: string | null
          subject: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          startup_id?: string | null
          subject: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          startup_id?: string | null
          subject?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          status: 'active' | 'canceled' | 'past_due' | 'unpaid'
          plan_type: 'basic' | 'premium'
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          status: 'active' | 'canceled' | 'past_due' | 'unpaid'
          plan_type: 'basic' | 'premium'
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid'
          plan_type?: 'basic' | 'premium'
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      investor_theses: {
        Row: {
          id: string
          investor_id: string
          min_funding_ask: number
          max_funding_ask: number
          preferred_industries: string[]
          preferred_stages: string[]
          preferred_locations: string[]
          min_equity_percentage: number
          max_equity_percentage: number
          industry_weight: number
          stage_weight: number
          funding_weight: number
          location_weight: number
          traction_weight: number
          team_weight: number
          keywords: string[]
          exclude_keywords: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          investor_id: string
          min_funding_ask?: number
          max_funding_ask?: number
          preferred_industries?: string[]
          preferred_stages?: string[]
          preferred_locations?: string[]
          min_equity_percentage?: number
          max_equity_percentage?: number
          industry_weight?: number
          stage_weight?: number
          funding_weight?: number
          location_weight?: number
          traction_weight?: number
          team_weight?: number
          keywords?: string[]
          exclude_keywords?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          investor_id?: string
          min_funding_ask?: number
          max_funding_ask?: number
          preferred_industries?: string[]
          preferred_stages?: string[]
          preferred_locations?: string[]
          min_equity_percentage?: number
          max_equity_percentage?: number
          industry_weight?: number
          stage_weight?: number
          funding_weight?: number
          location_weight?: number
          traction_weight?: number
          team_weight?: number
          keywords?: string[]
          exclude_keywords?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      startup_matches: {
        Row: {
          id: string
          startup_id: string
          investor_id: string
          thesis_id: string
          overall_score: number
          industry_score: number
          stage_score: number
          funding_score: number
          location_score: number
          traction_score: number
          team_score: number
          match_reason: string | null
          confidence_level: 'low' | 'medium' | 'high'
          status: 'pending' | 'viewed' | 'interested' | 'not_interested' | 'contacted'
          viewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          startup_id: string
          investor_id: string
          thesis_id: string
          overall_score?: number
          industry_score?: number
          stage_score?: number
          funding_score?: number
          location_score?: number
          traction_score?: number
          team_score?: number
          match_reason?: string | null
          confidence_level?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'viewed' | 'interested' | 'not_interested' | 'contacted'
          viewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          startup_id?: string
          investor_id?: string
          thesis_id?: string
          overall_score?: number
          industry_score?: number
          stage_score?: number
          funding_score?: number
          location_score?: number
          traction_score?: number
          team_score?: number
          match_reason?: string | null
          confidence_level?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'viewed' | 'interested' | 'not_interested' | 'contacted'
          viewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      match_interactions: {
        Row: {
          id: string
          match_id: string
          investor_id: string
          startup_id: string
          interaction_type: 'view' | 'like' | 'pass' | 'save' | 'contact' | 'note'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          investor_id: string
          startup_id: string
          interaction_type: 'view' | 'like' | 'pass' | 'save' | 'contact' | 'note'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          investor_id?: string
          startup_id?: string
          interaction_type?: 'view' | 'like' | 'pass' | 'save' | 'contact' | 'note'
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: 'founder' | 'investor' | 'admin'
      pitch_type: 'text' | 'video' | 'slide'
      subscription_status: 'active' | 'canceled' | 'past_due' | 'unpaid'
      plan_type: 'basic' | 'premium'
      confidence_level: 'low' | 'medium' | 'high'
      match_status: 'pending' | 'viewed' | 'interested' | 'not_interested' | 'contacted'
      interaction_type: 'view' | 'like' | 'pass' | 'save' | 'contact' | 'note'
    }
  }
}
