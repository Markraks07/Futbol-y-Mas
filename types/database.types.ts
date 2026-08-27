export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string;
          role: 'user' | 'moderator' | 'admin' | 'socio_vip';
          xp: number;
          level: number;
          favorite_team: string;
          favorite_competition: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string;
          role?: 'user' | 'moderator' | 'admin' | 'socio_vip';
          xp?: number;
          level?: number;
          favorite_team?: string;
          favorite_competition?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string;
          role?: 'user' | 'moderator' | 'admin' | 'socio_vip';
          xp?: number;
          level?: number;
          favorite_team?: string;
          favorite_competition?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      news: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          category: string;
          cover_image_url: string | null;
          author_id: string | null;
          is_featured: boolean;
          is_published: boolean;
          views_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          category?: string;
          cover_image_url?: string | null;
          author_id?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string;
          content?: string;
          category?: string;
          cover_image_url?: string | null;
          author_id?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      debates: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          cover_image_url: string | null;
          author_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category?: string;
          cover_image_url?: string | null;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          cover_image_url?: string | null;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          debate_id: string | null;
          news_id: string | null;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          debate_id?: string | null;
          news_id?: string | null;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          debate_id?: string | null;
          news_id?: string | null;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      reactions: {
        Row: {
          id: string;
          debate_id: string;
          user_id: string;
          reaction_type: 'fuego' | 'gol' | 'factos' | 'robo';
          created_at: string;
        };
        Insert: {
          id?: string;
          debate_id: string;
          user_id: string;
          reaction_type: 'fuego' | 'gol' | 'factos' | 'robo';
          created_at?: string;
        };
        Update: {
          id?: string;
          debate_id?: string;
          user_id?: string;
          reaction_type?: 'fuego' | 'gol' | 'factos' | 'robo';
          created_at?: string;
        };
      };
      polls: {
        Row: {
          id: string;
          question: string;
          is_active: boolean;
          starts_at: string;
          ends_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          is_active?: boolean;
          starts_at?: string;
          ends_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          is_active?: boolean;
          starts_at?: string;
          ends_at?: string | null;
          created_at?: string;
        };
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          option_text: string;
          order_num: number;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_text: string;
          order_num?: number;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_text?: string;
          order_num?: number;
        };
      };
      poll_votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      porra_rounds: {
        Row: {
          id: string;
          title: string;
          competition: string;
          is_active: boolean;
          deadline: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          competition?: string;
          is_active?: boolean;
          deadline?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          competition?: string;
          is_active?: boolean;
          deadline?: string | null;
          created_at?: string;
        };
      };
      porra_matches: {
        Row: {
          id: string;
          round_id: string;
          home_team: string;
          away_team: string;
          home_score: number | null;
          away_score: number | null;
          status: string;
          match_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          round_id: string;
          home_team: string;
          away_team: string;
          home_score?: number | null;
          away_score?: number | null;
          status?: string;
          match_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          round_id?: string;
          home_team?: string;
          away_team?: string;
          home_score?: number | null;
          away_score?: number | null;
          status?: string;
          match_date?: string;
          created_at?: string;
        };
      };
      porra_predictions: {
        Row: {
          id: string;
          match_id: string;
          user_id: string;
          predicted_home_score: number;
          predicted_away_score: number;
          points_earned: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          user_id: string;
          predicted_home_score: number;
          predicted_away_score: number;
          points_earned?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          user_id?: string;
          predicted_home_score?: number;
          predicted_away_score?: number;
          points_earned?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      club_socios: {
        Row: {
          carnet_num: number;
          name: string;
          status: 'active' | 'locked';
          user_id: string | null;
          updated_at: string;
        };
        Insert: {
          carnet_num: number;
          name: string;
          status?: 'active' | 'locked';
          user_id?: string | null;
          updated_at?: string;
        };
        Update: {
          carnet_num?: number;
          name?: string;
          status?: 'active' | 'locked';
          user_id?: string | null;
          updated_at?: string;
        };
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
      xp_events: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          reason: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          reason?: string;
          created_at?: string;
        };
      };
    };
  };
}
