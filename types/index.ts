import { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type News = Database['public']['Tables']['news']['Row'];
export type Debate = Database['public']['Tables']['debates']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Reaction = Database['public']['Tables']['reactions']['Row'];
export type Poll = Database['public']['Tables']['polls']['Row'];
export type PollOption = Database['public']['Tables']['poll_options']['Row'];
export type PollVote = Database['public']['Tables']['poll_votes']['Row'];
export type PorraRound = Database['public']['Tables']['porra_rounds']['Row'];
export type PorraMatch = Database['public']['Tables']['porra_matches']['Row'];
export type PorraPrediction = Database['public']['Tables']['porra_predictions']['Row'];
export type ClubSocio = Database['public']['Tables']['club_socios']['Row'];
export type SiteSettings = Database['public']['Tables']['site_settings']['Row'];

export interface DebateWithDetails extends Debate {
  author?: {
    display_name: string;
    username: string;
    avatar_url: string | null;
  } | null;
  reactions_count: {
    fuego: number;
    gol: number;
    factos: number;
    robo: number;
  };
  comments_count: number;
  user_reaction?: 'fuego' | 'gol' | 'factos' | 'robo' | null;
}

export interface CommentWithAuthor extends Comment {
  author: {
    display_name: string;
    username: string;
    avatar_url: string | null;
    role: string;
  };
}

export interface PollWithResults extends Poll {
  options: (PollOption & {
    votes_count: number;
    percentage: number;
  })[];
  total_votes: number;
  user_voted_option_id?: string | null;
}

export interface GlobalAlertSettings {
  active: boolean;
  text: string;
  link?: string;
}

export interface SiteStatsSettings {
  visits: number;
  whatsapp_clicks: number;
  followers: number;
}
