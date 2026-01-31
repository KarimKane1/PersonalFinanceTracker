/**
 * Personal Finance App - Main Application Component
 * 
 * Uses storage adapter to switch between localStorage (dev) and Supabase (prod)
 */

import { useState, useEffect, useCallback } from 'react';
import { FinanceModel, SalaryConfig } from './types';
import { Sidebar, Page } from './components/Sidebar';
import { Auth } from './components/Auth';
import { IncomeExpensesPage } from './pages/IncomeExpensesPage';
import { AccountsPage } from './pages/AccountsPage';
import { PlanningPage } from './pages/PlanningPage';
import { DashboardPage } from './pages/DashboardPage';
import { auth, storage } from './utils/storageAdapter';
import type { AuthUser } from './utils/storageAdapter';
import { supabase } from './utils/supabase';

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [model, setModel] = useState<FinanceModel>(storage.getEmptyModel());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check for existing session on mount and handle email confirmation
  useEffect(() => {
    let isMounted = true;
    let hasLoadedInitialData = false;

    // Handle email confirmation redirect from Supabase
    // Supabase adds tokens to the URL hash after email confirmation
    const handleEmailConfirmation = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if ((type === 'signup' || type === 'recovery') && accessToken) {
        // User confirmed their email, exchange the token for a session
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error getting session after email confirmation:', error);
            return false;
          }
          
          if (data.session && isMounted) {
            // Session created, get the user
            const currentUser = await auth.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
              setLoading(false);
              hasLoadedInitialData = true;
              loadUserData(currentUser.id);
              // Clean up the URL
              window.history.replaceState({}, document.title, window.location.pathname);
              return true; // Indicate we handled email confirmation
            }
          }
        } catch (err) {
          console.error('Error handling email confirmation:', err);
        }
      }
      return false;
    };

    // Check for email confirmation first, then check for existing session
    handleEmailConfirmation().then((emailConfirmed) => {
      if (!emailConfirmed && isMounted) {
        // No email confirmation, check for existing session
        auth.getCurrentUser().then((currentUser) => {
          if (!isMounted) return;
          setUser(currentUser);
          setLoading(false);
          if (currentUser) {
            hasLoadedInitialData = true;
            loadUserData(currentUser.id);
          }
        });
      }
    });

    // Track previous user ID to detect changes
    let previousUserId: string | null = null;
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChange((currentUser) => {
      if (!isMounted) return;
      
      // Check if user actually changed
      const newUserId = currentUser?.id || null;
      const userChanged = previousUserId !== newUserId;
      previousUserId = newUserId;
      
      setUser(currentUser);
      
      if (currentUser) {
        // If user changed (login) or we haven't loaded data yet, load it
        if (userChanged || !hasLoadedInitialData) {
          hasLoadedInitialData = true;
          loadUserData(currentUser.id);
        }
      } else {
        // User logged out
        setModel(storage.getEmptyModel());
        hasLoadedInitialData = false;
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Load user data
  const loadUserData = async (userId: string) => {
    const loaded = await storage.loadModel(userId);
    if (loaded) {
      // Ensure Checking account exists (migration for existing users)
      const hasChecking = loaded.balanceItems.some(item => 
        item.name.toLowerCase() === 'checking' || item.id === 'default-checking'
      );
      
      if (!hasChecking) {
        loaded.balanceItems.unshift({
          id: 'default-checking',
          name: 'Checking',
          amount: 0,
          apy: 0,
          monthlyAllocation: 0,
        });
        await storage.saveModel(userId, loaded);
      }
      
      setModel(loaded);
    } else {
      // Initialize with empty model if no data exists
      const emptyModel = storage.getEmptyModel();
      setModel(emptyModel);
      await storage.saveModel(userId, emptyModel);
    }
  };

  // Auto-save whenever model changes (but don't reload after saving)
  useEffect(() => {
    if (user) {
      // Debounce saves to avoid too many API calls
      const timeoutId = setTimeout(() => {
        storage.saveModel(user.id, model).catch(err => {
          console.error('Error saving model:', err);
        });
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [model, user]);

  const handleLogout = async () => {
    await auth.signOut();
    setModel(storage.getEmptyModel());
  };

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

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30 flex">
      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        currentProfileName={user.email || user.name || 'User'}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto w-full lg:w-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <header className="mb-6 lg:mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors"
                    aria-label="Toggle menu"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Personal Finance Planner</h1>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 ml-11 lg:ml-0">Manage your finances with ease</p>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 flex-shrink-0">
                <span className="text-xs text-gray-500 bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm whitespace-nowrap">💾 {formatLastSaved()}</span>
                {(import.meta as any).env?.DEV && (
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm whitespace-nowrap">🔧 Dev Mode</span>
                )}
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
