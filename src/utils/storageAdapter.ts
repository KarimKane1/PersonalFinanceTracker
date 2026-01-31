/**
 * Storage Adapter - Abstracts storage between localStorage (dev) and Supabase (prod)
 * 
 * In development: Uses localStorage with profile system
 * In production: Uses Supabase with authentication
 */

import { FinanceModel } from '../types';
import * as profileStorage from './profileStorage';
import * as supabaseStorage from './supabaseStorage';
import { supabase } from './supabase';

// Check if we're in development mode
const isDevelopment = (import.meta as any).env?.DEV || (import.meta as any).env?.MODE === 'development';

export interface AuthUser {
  id: string;
  email: string | null;
  name?: string;
}

/**
 * Authentication methods
 */
export const auth = {
  async signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    if (isDevelopment) {
      // In dev, check if profile already exists
      const profiles = profileStorage.getProfiles();
      const existingProfile = profiles.find(p => p.name.toLowerCase() === email.toLowerCase());
      
      if (existingProfile) {
        return { user: null, error: 'An account with this email already exists. Please sign in instead.' };
      }
      
      // Create a local profile
      const profile = profileStorage.createProfile(email);
      profileStorage.setCurrentProfileId(profile.id);
      return { user: { id: profile.id, email, name: profile.name }, error: null };
    } else {
      // In prod, try to sign up - Supabase will handle duplicate email check
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        // Check if it's a duplicate email error
        if (error.message.includes('already registered') || error.message.includes('already exists') || error.message.includes('User already registered')) {
          return { user: null, error: 'An account with this email already exists. Please sign in instead.' };
        }
        return { user: null, error: error.message };
      }
      
      if (data.user) {
        // Initialize empty finance data
        await supabaseStorage.saveModelToSupabase(data.user.id, profileStorage.getEmptyModel());
        return { user: { id: data.user.id, email: data.user.email || null }, error: null };
      }
      return { user: null, error: 'Failed to create user' };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    if (isDevelopment) {
      // In dev, password is optional - find or create profile by email
      const profiles = profileStorage.getProfiles();
      let profile = profiles.find(p => p.name === email || p.name.toLowerCase() === email.toLowerCase());
      
      if (!profile) {
        // Create profile if it doesn't exist
        profile = profileStorage.createProfile(email);
      }
      
      profileStorage.setCurrentProfileId(profile.id);
      return { user: { id: profile.id, email, name: profile.name }, error: null };
    } else {
      // In prod, use Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { user: null, error: error.message };
      
      return { user: { id: data.user.id, email: data.user.email || null }, error: null };
    }
  },

  async signOut(): Promise<void> {
    if (isDevelopment) {
      profileStorage.setCurrentProfileId('');
      localStorage.removeItem('pf_current_profile_v1');
    } else {
      await supabase.auth.signOut();
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    if (isDevelopment) {
      const profileId = profileStorage.getCurrentProfileId();
      if (!profileId) return null;
      
      const profiles = profileStorage.getProfiles();
      const profile = profiles.find(p => p.id === profileId);
      if (!profile) return null;
      
      return { id: profile.id, email: profile.name, name: profile.name };
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      
      return { id: session.user.id, email: session.user.email || null };
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    if (isDevelopment) {
      // In dev, check periodically to detect auth changes
      let lastProfileId: string | null = null;
      
      const checkAuth = () => {
        const profileId = profileStorage.getCurrentProfileId();
        
        // Only call callback if profile ID actually changed
        if (profileId !== lastProfileId) {
          lastProfileId = profileId;
          
          if (profileId) {
            const profiles = profileStorage.getProfiles();
            const profile = profiles.find(p => p.id === profileId);
            callback(profile ? { id: profile.id, email: profile.name, name: profile.name } : null);
          } else {
            callback(null);
          }
        }
      };
      
      checkAuth();
      // Check every 500ms - fast enough to feel instant, slow enough not to cause issues
      const interval = setInterval(checkAuth, 500);
      
      return () => {
        clearInterval(interval);
      };
    } else {
      // In prod, use Supabase auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        callback(session?.user ? { id: session.user.id, email: session.user.email || null } : null);
      });
      return () => subscription.unsubscribe();
    }
  },
};

/**
 * Data storage methods
 */
export const storage = {
  async loadModel(userId: string): Promise<FinanceModel | null> {
    if (isDevelopment) {
      return profileStorage.loadModelForProfile(userId);
    } else {
      return await supabaseStorage.loadModelFromSupabase(userId);
    }
  },

  async saveModel(userId: string, model: FinanceModel): Promise<boolean> {
    if (isDevelopment) {
      profileStorage.saveModelForProfile(userId, model);
      return true;
    } else {
      return await supabaseStorage.saveModelToSupabase(userId, model);
    }
  },

  getEmptyModel(): FinanceModel {
    return profileStorage.getEmptyModel();
  },
};

