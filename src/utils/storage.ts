/**
 * LocalStorage persistence utilities
 * 
 * Handles saving and loading the finance model to/from localStorage.
 * This enables local-first data storage without a backend.
 */

import { FinanceModel } from '../types';

const STORAGE_KEY = 'pf_model_v1';

/**
 * Load the finance model from localStorage
 * @returns The loaded model or null if not found
 */
export function loadModel(): FinanceModel | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const model = JSON.parse(stored) as FinanceModel;
    
    // Migrate old data: add apy and monthlyAllocation fields if missing
    if (model.balanceItems) {
      model.balanceItems = model.balanceItems.map(item => ({
        ...item,
        apy: item.apy !== undefined ? item.apy : 0,
        monthlyAllocation: item.monthlyAllocation !== undefined ? item.monthlyAllocation : 0,
      }));
    }
    
    // Migrate old allocationItems to balanceItems monthlyAllocation
    if (model.allocationItems && model.allocationItems.length > 0) {
      model.allocationItems.forEach(allocation => {
        const matchingAccount = model.balanceItems.find(acc => acc.name === allocation.name);
        if (matchingAccount) {
          matchingAccount.monthlyAllocation = allocation.monthlyAmount;
        }
      });
    }
    
    return model;
  } catch (error) {
    console.error('Error loading model from localStorage:', error);
    return null;
  }
}

/**
 * Save the finance model to localStorage
 * @param model - The finance model to save
 */
export function saveModel(model: FinanceModel): void {
  try {
    const modelToSave: FinanceModel = {
      ...model,
      meta: {
        ...model.meta,
        lastSavedAt: new Date().toISOString(),
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modelToSave));
  } catch (error) {
    console.error('Error saving model to localStorage:', error);
  }
}

/**
 * Get sample/default finance model data
 * @returns A FinanceModel with sample values
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

