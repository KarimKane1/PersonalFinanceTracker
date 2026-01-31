import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project URL and anon key
// You can find these in your Supabase project settings under "API"
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// In production, if Supabase credentials are missing, create a dummy client
// This prevents the app from crashing, but Supabase features won't work
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key must be set in environment variables');
  // Create a dummy client with placeholder values to prevent crashes
  export const supabase = createClient(
    'https://placeholder.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  );
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
}

