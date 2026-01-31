/**
 * Storage Adapter - Abstracts storage between localStorage (dev) and Supabase (prod)
 * 
 * In development: Uses localStorage with profile system
 * In production: Uses Supabase with authentication
 */

import { FinanceModel } from '../types';
import { Profile } from '../types/profile';
import * as profileStorage from './profileStorage';
import * as supabaseStorage from './supabaseStorage';
import { supabase } from './supabase';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV || (import.meta as any).env?.MODE === 'development';

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
      // In dev, create a local profile instead
      const profile = profileStorage.createProfile(email);
      profileStorage.setCurrentProfileId(profile.id);
      return { user: { id: profile.id, email, name: profile.name }, error: null };
    } else {
      // In prod, use Supabase
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { user: null, error: error.message };
      
      if (data.user) {
        // Initialize empty finance data
        await supabaseStorage.saveModelToSupabase(data.user.id, profileStorage.getEmptyModel());
        return { user: { id: data.user.id, email: data.user.email }, error: null };
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
      
      return { user: { id: data.user.id, email: data.user.email }, error: null };
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
      
      return { id: session.user.id, email: session.user.email };
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    if (isDevelopment) {
      // In dev, check localStorage periodically (simple approach)
      const checkAuth = () => {
        const profileId = profileStorage.getCurrentProfileId();
        if (profileId) {
          const profiles = profileStorage.getProfiles();
          const profile = profiles.find(p => p.id === profileId);
          callback(profile ? { id: profile.id, email: profile.name, name: profile.name } : null);
        } else {
          callback(null);
        }
      };
      
      checkAuth();
      const interval = setInterval(checkAuth, 1000);
      return () => clearInterval(interval);
    } else {
      // In prod, use Supabase auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ? { id: session.user.id, email: session.user.email } : null);
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

