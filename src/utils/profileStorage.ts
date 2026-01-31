import { Profile } from '../types/profile';
import { FinanceModel } from '../types';

const PROFILES_KEY = 'pf_profiles_v1';
const CURRENT_PROFILE_KEY = 'pf_current_profile_v1';

/**
 * Get all profiles
 */
export function getProfiles(): Profile[] {
  try {
    const stored = localStorage.getItem(PROFILES_KEY);
    if (!stored) {
      // Check if there's old data to migrate
      const oldData = localStorage.getItem('pf_model_v1');
      const defaultProfile: Profile = {
        id: 'default',
        name: 'Karim',
        createdAt: new Date().toISOString(),
      };
      saveProfiles([defaultProfile]);
      setCurrentProfileId(defaultProfile.id);
      
      // Migrate old data if it exists, otherwise initialize with sample data
      if (oldData) {
        try {
          const oldModel = JSON.parse(oldData);
          saveModelForProfile(defaultProfile.id, oldModel);
          // Remove old storage key
          localStorage.removeItem('pf_model_v1');
        } catch (e) {
          console.error('Error migrating old data:', e);
          // If migration fails, use sample data
          saveModelForProfile(defaultProfile.id, getSampleModel());
        }
      } else {
        // Initialize Karim with sample data
        saveModelForProfile(defaultProfile.id, getSampleModel());
      }
      
      return [defaultProfile];
    }
    return JSON.parse(stored) as Profile[];
  } catch (error) {
    console.error('Error loading profiles:', error);
    return [];
  }
}

/**
 * Save profiles list
 */
export function saveProfiles(profiles: Profile[]): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Error saving profiles:', error);
  }
}

/**
 * Get current profile ID
 */
export function getCurrentProfileId(): string | null {
  try {
    return localStorage.getItem(CURRENT_PROFILE_KEY);
  } catch (error) {
    console.error('Error loading current profile:', error);
    return null;
  }
}

/**
 * Set current profile ID
 */
export function setCurrentProfileId(profileId: string): void {
  try {
    localStorage.setItem(CURRENT_PROFILE_KEY, profileId);
  } catch (error) {
    console.error('Error saving current profile:', error);
  }
}

/**
 * Create a new profile
 */
export function createProfile(name: string): Profile {
  const profiles = getProfiles();
  const newProfile: Profile = {
    id: Date.now().toString(),
    name: name.trim() || 'New Profile',
    createdAt: new Date().toISOString(),
  };
  profiles.push(newProfile);
  saveProfiles(profiles);
  
  // Initialize with empty model
  const emptyModel = getEmptyModel();
  saveModelForProfile(newProfile.id, emptyModel);
  
  return newProfile;
}

/**
 * Delete a profile
 */
export function deleteProfile(profileId: string): void {
  const profiles = getProfiles();
  const filtered = profiles.filter(p => p.id !== profileId);
  saveProfiles(filtered);
  
  // Also delete the profile's data
  localStorage.removeItem(`pf_model_v1_${profileId}`);
  
  // If deleted profile was current, switch to first available or null
  if (getCurrentProfileId() === profileId) {
    if (filtered.length > 0) {
      setCurrentProfileId(filtered[0].id);
    } else {
      localStorage.removeItem(CURRENT_PROFILE_KEY);
    }
  }
}

/**
 * Load model for a specific profile
 */
export function loadModelForProfile(profileId: string): FinanceModel | null {
  try {
    const stored = localStorage.getItem(`pf_model_v1_${profileId}`);
    if (!stored) {
      // If it's the default/Karim profile and no data exists, initialize with sample
      const profiles = getProfiles();
      const profile = profiles.find(p => p.id === profileId);
      if (profile && profile.name === 'Karim') {
        const sampleModel = getSampleModel();
        saveModelForProfile(profileId, sampleModel);
        return sampleModel;
      }
      return null;
    }
    const model = JSON.parse(stored) as FinanceModel;
    
    // Migrate old data: add apy and monthlyAllocation fields if missing
    if (model.balanceItems) {
      model.balanceItems = model.balanceItems.map(item => ({
        ...item,
        apy: item.apy !== undefined ? item.apy : 0,
        monthlyAllocation: item.monthlyAllocation !== undefined ? item.monthlyAllocation : 0,
      }));
    }
    
    // Migrate old data: add debtItems if missing
    if (!model.debtItems) {
      model.debtItems = [];
    }
    
    return model;
  } catch (error) {
    console.error('Error loading model for profile:', error);
    return null;
  }
}

/**
 * Save model for a specific profile
 */
export function saveModelForProfile(profileId: string, model: FinanceModel): void {
  try {
    const modelToSave: FinanceModel = {
      ...model,
      meta: {
        ...model.meta,
        lastSavedAt: new Date().toISOString(),
      },
    };
    localStorage.setItem(`pf_model_v1_${profileId}`, JSON.stringify(modelToSave));
  } catch (error) {
    console.error('Error saving model for profile:', error);
  }
}

/**
 * Get sample model (Karim's data)
 */
export function getSampleModel(): FinanceModel {
  return {
    salaryConfig: {
      mode: "net_only",
      annualGross: 72000,
      netPercent: 0.7, // Approximate 70% net (30% taxes/deductions)
      netMonthly: 4200,
    },
    incomeItems: [
      { id: '1', name: 'Additional Income', monthlyAmount: 600 },
    ],
    expenseItems: [
      { id: '1', name: 'Subscriptions', monthlyAmount: 100 },
      { id: '2', name: 'Food', monthlyAmount: 750 },
      { id: '3', name: 'Fun & Social', monthlyAmount: 300 },
      { id: '4', name: 'Car Insurance', monthlyAmount: 130 },
      { id: '5', name: 'Misc.', monthlyAmount: 400 },
      { id: '6', name: 'Rent', monthlyAmount: 0 },
    ],
    debtItems: [],
    allocationItems: [
      { id: '1', name: 'Robinhood', monthlyAmount: 937 },
      { id: '2', name: 'Amex HYSA', monthlyAmount: 100 },
      { id: '3', name: 'Roth IRA', monthlyAmount: 583 },
      { id: '4', name: 'Real Estate (Sofi)', monthlyAmount: 900 },
      { id: '5', name: 'Travel (Sofi)', monthlyAmount: 600 },
    ],
    balanceItems: [
      { id: '1', name: 'Checking', amount: 2618, apy: 0, monthlyAllocation: 0 },
      { id: '2', name: 'Robinhood', amount: 9422, apy: 0.07, monthlyAllocation: 937 },
      { id: '3', name: 'Amex HYSA', amount: 8475, apy: 0.045, monthlyAllocation: 100 },
      { id: '4', name: 'Roth IRA', amount: 0, apy: 0.08, monthlyAllocation: 583 },
      { id: '5', name: 'Real Estate (Sofi)', amount: 0, apy: 0.06, monthlyAllocation: 900 },
      { id: '6', name: 'Travel (Sofi)', amount: 0, apy: 0.04, monthlyAllocation: 600 },
    ],
    meta: {
      lastSavedAt: new Date().toISOString(),
    },
  };
}

/**
 * Get empty model for new profiles
 */
export function getEmptyModel(): FinanceModel {
  return {
    salaryConfig: {
      mode: "net_only",
      annualGross: 0,
      netPercent: 0.7,
      netMonthly: 0,
    },
    incomeItems: [],
    expenseItems: [],
    debtItems: [],
    allocationItems: [],
    balanceItems: [
      { id: 'default-checking', name: 'Checking', amount: 0, apy: 0, monthlyAllocation: 0 },
    ],
    meta: {
      lastSavedAt: new Date().toISOString(),
    },
  };
}

