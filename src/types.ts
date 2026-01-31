/**
 * Personal Finance App - Data Model Types
 * 
 * This file defines the core data structure for the personal finance model.
 * The model is designed to be flexible and extensible, allowing dynamic
 * addition/removal of items in each category.
 */

export type SalaryMode = "gross_to_net" | "net_only";

export interface SalaryConfig {
  mode: SalaryMode;
  annualGross: number;
  netPercent: number; // 0..1
  netMonthly: number; // either derived or user-entered depending on mode
}

export interface IncomeItem {
  id: string;
  name: string;
  monthlyAmount: number;
}

export interface ExpenseItem {
  id: string;
  name: string;
  monthlyAmount: number;
}

export interface DebtItem {
  id: string;
  name: string;
  currentBalance: number; // Remaining balance
  interestRate: number; // Annual Percentage Rate (0-1, e.g., 0.18 = 18%)
  minimumPayment: number; // Monthly payment
  monthlyAllocation?: number; // Monthly allocation amount (optional, for planning page)
}

export interface AllocationItem {
  id: string;
  name: string;
  monthlyAmount: number;
}

export interface BalanceItem {
  id: string;
  name: string;
  amount: number;
  apy: number; // Annual Percentage Yield (0-1, e.g., 0.05 = 5%)
  monthlyAllocation?: number; // Monthly allocation amount (optional, for planning page)
}

export interface FinanceModel {
  salaryConfig: SalaryConfig;
  incomeItems: IncomeItem[];
  expenseItems: ExpenseItem[];
  debtItems: DebtItem[];
  allocationItems: AllocationItem[];
  balanceItems: BalanceItem[];
  meta: {
    lastSavedAt: string;
  };
}

