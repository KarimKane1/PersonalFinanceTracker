/**
 * Personal Finance App - Inputs Page (V1)
 * 
 * ARCHITECTURE OVERVIEW:
 * 
 * This page implements the Inputs Page (Page 1) of the personal finance app.
 * The architecture is designed to support future projection calculations and
 * dashboard visualizations:
 * 
 * 1. DATA MODEL: All inputs are stored in a structured FinanceModel type
 *    (src/types.ts). This model is flexible - items are arrays that can be
 *    dynamically added/removed, not hardcoded rows.
 * 
 * 2. COMPUTATIONS: Calculations are derived from the model state using pure
 *    functions. This separation allows us to:
 *    - Reuse the same calculations in projections (future)
 *    - Test calculations independently
 *    - Update calculations without touching UI code
 * 
 * 3. COMPONENT STRUCTURE:
 *    - SectionCard: Reusable container for each section
 *    - SalaryCardHeader: Handles salary mode toggle and inputs
 *    - EditableRowTable: Generic CRUD component for managing item lists
 *    - App: Orchestrates state, computations, and persistence
 * 
 * 4. PERSISTENCE: LocalStorage saves the entire model state. This local-first
 *    approach means:
 *    - No backend needed for v1
 *    - Data persists across sessions
 *    - Easy to extend with export/import later
 * 
 * 5. FUTURE EXTENSIBILITY:
 *    - Projections will read from the same FinanceModel
 *    - Calculations can be extracted to a separate module
 *    - Charts will consume computed projection data
 *    - Routing can be added without changing component structure
 */

import { useState, useEffect, useCallback } from 'react';
import { FinanceModel, SalaryConfig } from './types';
import { Sidebar, Page } from './components/Sidebar';
import { ProfileSelection } from './components/ProfileSelection';
import { IncomeExpensesPage } from './pages/IncomeExpensesPage';
import { AccountsPage } from './pages/AccountsPage';
import { PlanningPage } from './pages/PlanningPage';
import { DashboardPage } from './pages/DashboardPage';
import { 
  getCurrentProfileId, 
  setCurrentProfileId, 
  getProfiles,
  loadModelForProfile,
  saveModelForProfile,
  getEmptyModel,
} from './utils/profileStorage';

function App() {
  const [currentProfileId, setCurrentProfileIdState] = useState<string | null>(() => getCurrentProfileId());
  const [currentPage, setCurrentPage] = useState<Page>('income-expenses');
  const [model, setModel] = useState<FinanceModel>(() => {
    const profileId = getCurrentProfileId();
    if (!profileId) return getEmptyModel();
    const loaded = loadModelForProfile(profileId);
    return loaded || getEmptyModel();
  });

  // Update model when profile changes
  useEffect(() => {
    if (currentProfileId) {
      const loaded = loadModelForProfile(currentProfileId);
      setModel(loaded || getEmptyModel());
    }
  }, [currentProfileId]);

  // Auto-save to localStorage whenever model changes
  useEffect(() => {
    if (currentProfileId) {
      saveModelForProfile(currentProfileId, model);
    }
  }, [model, currentProfileId]);

  const handleProfileSelect = (profileId: string) => {
    setCurrentProfileId(profileId);
    setCurrentProfileIdState(profileId);
  };

  const handleLogout = () => {
    setCurrentProfileIdState(null);
    localStorage.removeItem('pf_current_profile_v1');
  };

  const currentProfile = currentProfileId 
    ? getProfiles().find(p => p.id === currentProfileId)
    : null;

  // Computations
  const computeNetMonthly = useCallback((config: SalaryConfig): number => {
    if (config.mode === 'gross_to_net') {
      return (config.annualGross * config.netPercent) / 12;
    }
    return config.netMonthly;
  }, []);

  const totalMonthlyIncome = computeNetMonthly(model.salaryConfig) +
    model.incomeItems.reduce((sum, item) => sum + item.monthlyAmount, 0);

  const totalExpenses = model.expenseItems.reduce((sum, item) => sum + item.monthlyAmount, 0);

  const availablePostExpenses = totalMonthlyIncome - totalExpenses;

  // Calculate total allocations from accounts
  const totalAllocations = model.balanceItems.reduce((sum, item) => sum + (item.monthlyAllocation || 0), 0);

  const allocationSurplusDeficit = availablePostExpenses - totalAllocations;

  const startingNetWorth = model.balanceItems.reduce((sum, item) => sum + item.amount, 0);

  // Update handlers
  const updateSalaryConfig = (updates: Partial<SalaryConfig>) => {
    setModel(prev => ({
      ...prev,
      salaryConfig: { ...prev.salaryConfig, ...updates },
    }));
  };

  const addIncomeItem = () => {
    const newId = Date.now().toString();
    setModel(prev => ({
      ...prev,
      incomeItems: [...prev.incomeItems, { id: newId, name: '', monthlyAmount: 0 }],
    }));
  };

  const updateIncomeItem = (id: string, field: 'name' | 'monthlyAmount', value: string | number) => {
    setModel(prev => ({
      ...prev,
      incomeItems: prev.incomeItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const deleteIncomeItem = (id: string) => {
    setModel(prev => ({
      ...prev,
      incomeItems: prev.incomeItems.filter(item => item.id !== id),
    }));
  };

  const addExpenseItem = () => {
    const newId = Date.now().toString();
    setModel(prev => ({
      ...prev,
      expenseItems: [...prev.expenseItems, { id: newId, name: '', monthlyAmount: 0 }],
    }));
  };

  const updateExpenseItem = (id: string, field: 'name' | 'monthlyAmount', value: string | number) => {
    setModel(prev => ({
      ...prev,
      expenseItems: prev.expenseItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const deleteExpenseItem = (id: string) => {
    setModel(prev => ({
      ...prev,
      expenseItems: prev.expenseItems.filter(item => item.id !== id),
    }));
  };


  const addBalanceItem = () => {
    const newId = Date.now().toString();
    setModel(prev => ({
      ...prev,
      balanceItems: [...prev.balanceItems, { id: newId, name: '', amount: 0, apy: 0, monthlyAllocation: 0 }],
    }));
  };

  const updateBalanceItem = (id: string, field: 'name' | 'amount' | 'apy', value: string | number) => {
    setModel(prev => ({
      ...prev,
      balanceItems: prev.balanceItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const deleteBalanceItem = (id: string) => {
    setModel(prev => ({
      ...prev,
      balanceItems: prev.balanceItems.filter(item => item.id !== id),
    }));
  };


  const formatLastSaved = () => {
    if (!model.meta.lastSavedAt) return 'Never';
    const date = new Date(model.meta.lastSavedAt);
    return date.toLocaleString();
  };

  // Show profile selection if no profile is selected
  if (!currentProfileId || !currentProfile) {
    return <ProfileSelection onProfileSelect={handleProfileSelect} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30 flex">
      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        currentProfileName={currentProfile.name}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Personal Finance Planner</h1>
                <p className="text-sm text-gray-500">Manage your finances with ease</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm">💾 {formatLastSaved()}</span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          {currentPage === 'income-expenses' && (
            <IncomeExpensesPage
              model={model}
              onUpdateSalaryConfig={updateSalaryConfig}
              onAddIncomeItem={addIncomeItem}
              onUpdateIncomeItem={updateIncomeItem}
              onDeleteIncomeItem={deleteIncomeItem}
              onAddExpenseItem={addExpenseItem}
              onUpdateExpenseItem={updateExpenseItem}
              onDeleteExpenseItem={deleteExpenseItem}
              computeNetMonthly={computeNetMonthly}
              totalMonthlyIncome={totalMonthlyIncome}
              totalExpenses={totalExpenses}
              availablePostExpenses={availablePostExpenses}
            />
          )}

          {currentPage === 'accounts' && (
            <AccountsPage
              balanceItems={model.balanceItems}
              onAdd={addBalanceItem}
              onUpdate={updateBalanceItem}
              onDelete={deleteBalanceItem}
              startingNetWorth={startingNetWorth}
            />
          )}

          {currentPage === 'planning' && (
            <PlanningPage
              accounts={model.balanceItems}
              onUpdateAllocation={(accountId, amount) => {
                setModel(prev => ({
                  ...prev,
                  balanceItems: prev.balanceItems.map(item =>
                    item.id === accountId ? { ...item, monthlyAllocation: amount } : item
                  ),
                }));
              }}
              totalAllocations={totalAllocations}
              availablePostExpenses={availablePostExpenses}
              allocationSurplusDeficit={allocationSurplusDeficit}
            />
          )}

          {currentPage === 'dashboard' && (
            <DashboardPage
              model={model}
              totalMonthlyIncome={totalMonthlyIncome}
              totalExpenses={totalExpenses}
              availablePostExpenses={availablePostExpenses}
              totalAllocations={totalAllocations}
              startingNetWorth={startingNetWorth}
              computeNetMonthly={computeNetMonthly}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

