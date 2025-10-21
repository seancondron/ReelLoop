// Supabase Configuration
// Replace these with your actual Supabase project credentials

export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'your-supabase-url',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key',
};

// Instructions:
// 1. Create a Supabase project at https://supabase.com
// 2. Get your project URL and anon key from the project settings
// 3. Create a .env file in your project root with:
//    EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
//    EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
// 4. Or replace the values directly in this file


