import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface App {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  platform: string;
  version: string;
  license: string;
  developer: string;
  source_name: string;
  source_url: string;
  original_download_url: string;
  safelinku_url?: string;
  icon_url?: string;
  screenshot_url?: string;
  file_type: string;
  file_size?: string;
  stars?: number;
  downloads_count?: number;
  changelog?: string;
  is_active: boolean;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}