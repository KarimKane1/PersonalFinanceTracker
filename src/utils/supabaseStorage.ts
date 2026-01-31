import { supabase } from './supabase';
import { FinanceModel } from '../types';

/**
 * Load finance model for the current user from Supabase
 */
export async function loadModelFromSupabase(userId: string): Promise<FinanceModel | null> {
  try {
    const { data, error } = await supabase
      .from('finance_data')
      .select('data')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, return null
        return null;
      }
      console.error('Error loading model from Supabase:', error);
      return null;
    }

    const model = (data as any)?.data as FinanceModel;
    
    // Normalize model to ensure all arrays exist
    if (model) {
      if (!model.balanceItems) model.balanceItems = [];
      if (!model.debtItems) model.debtItems = [];
      if (!model.incomeItems) model.incomeItems = [];
      if (!model.expenseItems) model.expenseItems = [];
      if (!model.allocationItems) model.allocationItems = [];
      if (!model.salaryConfig) {
        model.salaryConfig = {
          mode: "net_only",
          annualGross: 0,
          netPercent: 0.7,
          netMonthly: 0,
        };
      }
      if (!model.meta) {
        model.meta = {
          lastSavedAt: new Date().toISOString(),
        };
      }
    }
    
    return model;
  } catch (error) {
    console.error('Error loading model from Supabase:', error);
    return null;
  }
}

/**
 * Save finance model for the current user to Supabase
 */
export async function saveModelToSupabase(userId: string, model: FinanceModel): Promise<boolean> {
  try {
    const modelToSave: FinanceModel = {
      ...model,
      meta: {
        ...model.meta,
        lastSavedAt: new Date().toISOString(),
      },
    };

    const { error } = await supabase
      .from('finance_data')
      .upsert({
        user_id: userId,
        data: modelToSave,
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error saving model to Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving model to Supabase:', error);
    return false;
  }
}

