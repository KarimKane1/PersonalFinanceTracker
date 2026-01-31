import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project URL and anon key
// You can find these in your Supabase project settings under "API"
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// In production, if Supabase credentials are missing, use placeholder values
// This prevents the app from crashing, but Supabase features won't work
const finalUrl = supabaseUrl || 'https://cfjlyjozmkvrdnxkyark.supabase.co';
const finalKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmamx5am96bWt2cmRueGt5YXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjIzNjAsImV4cCI6MjA4NTQzODM2MH0.LW-LVX8LNmYWfhJdPHi3akWZ9c2LwI20GE18-IPvdF0';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key not found in environment variables, using fallback values');
}

export const supabase = createClient(finalUrl, finalKey);

