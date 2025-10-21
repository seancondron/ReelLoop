import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabase';

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Database types
export interface SocialPost {
  id: string;
  user_id?: string;
  url: string;
  title?: string;
  source: string; // 'TikTok', 'Instagram', etc.
  type: string; // 'tiktok', 'instagram', etc.
  thumbnail_url?: string;
  post_id?: string; // video_id for TikTok, post_id for Instagram
  author?: string;
  author_id?: string;
  location?: string;
  captions?: string;
  description?: string;
  play_count?: number;
  digg_count?: number;
  comment_count?: number;
  share_count?: number;
  like_count?: number; // For Instagram
  duration?: number;
  created_at: string;
  updated_at: string;
}

// Legacy type for backward compatibility
export interface TikTokVideo extends SocialPost {}
