import { useMemo, useState } from 'react';
import { FinanceModel } from '../types';
import { formatCurrency } from '../utils/format';
import { SectionCard } from '../components/SectionCard';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardPageProps {
  model: FinanceModel;
  totalMonthlyIncome: number;
  totalExpenses: number;
  availablePostExpenses: number;
  totalAllocations: number;
  startingNetWorth: number;
  computeNetMonthly: (config: any) => number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function DashboardPage({
  model,
  totalMonthlyIncome,
  totalExpenses,
  availablePostExpenses,
  totalAllocations,
  startingNetWorth,
  computeNetMonthly,
}: DashboardPageProps) {
  const [projectionMonths, setProjectionMonths] = useState(12);
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  // Calculate simple monthly projections (without account breakdown)
  const simpleProjections = useMemo(() => {
    const projections = [];
    
    // Initialize account and debt balances (with null checks)
    const accountBalances: { [key: string]: number } = {};
    (model.balanceItems || []).forEach(account => {
      accountBalances[account.id] = account.amount;
    });
    
    const debtBalances: { [key: string]: number } = {};
    (model.debtItems || []).forEach(debt => {
      debtBalances[debt.id] = debt.currentBalance;
    });
    
    const monthlyCashFlow = availablePostExpenses; // Can be negative if expenses > income
    
    for (let month = 0; month < projectionMonths; month++) {
      // Process accounts: handle cash flow first
      let totalAccountInterest = 0;
      
      // Handle monthly cash flow (income - expenses)
      if (monthlyCashFlow >= 0) {
        // Positive cash flow: add to Checking account
        const checkingAccount = (model.balanceItems || []).find(acc => 
          acc.name.toLowerCase() === 'checking' || acc.id === 'default-checking'
        );
        if (checkingAccount) {
          accountBalances[checkingAccount.id] = (accountBalances[checkingAccount.id] || 0) + monthlyCashFlow;
        }
      } else {
        // Negative cash flow: cover from accounts (starting with Checking)
        let remainingShortfall = Math.abs(monthlyCashFlow);
        const checkingAccount = (model.balanceItems || []).find(acc => 
          acc.name.toLowerCase() === 'checking' || acc.id === 'default-checking'
        );
        
        if (checkingAccount && accountBalances[checkingAccount.id] > 0) {
          const amountToCover = Math.min(remainingShortfall, accountBalances[checkingAccount.id]);
          accountBalances[checkingAccount.id] -= amountToCover;
          remainingShortfall -= amountToCover;
        }
        
        // If still short, cover from other accounts
        if (remainingShortfall > 0) {
          for (const account of (model.balanceItems || [])) {
            if (remainingShortfall <= 0) break;
            if (account.id === checkingAccount?.id) continue;
            
            if (accountBalances[account.id] > 0) {
              const amountToCover = Math.min(remainingShortfall, accountBalances[account.id]);
              accountBalances[account.id] -= amountToCover;
              remainingShortfall -= amountToCover;
            }
          }
        }
        
        // If still short after using all savings, it increases debt
        if (remainingShortfall > 0 && (model.debtItems || []).length > 0) {
          const firstDebt = (model.debtItems || [])[0];
          debtBalances[firstDebt.id] += remainingShortfall;
        }
      }
      
      // Calculate available money after handling cash flow
      let availableMoney = Object.values(accountBalances).reduce((sum, bal) => sum + bal, 0);
      
      // Process debts: add interest first (debts always grow), then process payments individually
      let totalDebtInterest = 0;
      const checkingAccount = model.balanceItems.find(acc => 
        acc.name.toLowerCase() === 'checking' || acc.id === 'default-checking'
      );
      
      (model.debtItems || []).forEach(debt => {
        // Skip if debt is already paid off
        if (debtBalances[debt.id] <= 0) {
          return;
        }
        
        // First, add interest (debt grows)
        const monthlyInterest = debtBalances[debt.id] * debt.interestRate / 12;
        debtBalances[debt.id] += monthlyInterest;
        totalDebtInterest += monthlyInterest;
        
        // Then, check if user wants to pay this debt and if there's enough money
        const paymentAmount = debt.monthlyAllocation || 0;
        if (paymentAmount > 0 && availableMoney >= paymentAmount) {
          // User entered a payment AND there's enough money for it
          const newBalance = debtBalances[debt.id] - paymentAmount;
          debtBalances[debt.id] = Math.max(0, newBalance);
          availableMoney -= paymentAmount; // Deduct from available money
          
          // Actually deduct the payment from account balances (starting with Checking)
          let remainingPayment = paymentAmount;
          
          if (checkingAccount && accountBalances[checkingAccount.id] > 0) {
            const amountToDeduct = Math.min(remainingPayment, accountBalances[checkingAccount.id]);
            accountBalances[checkingAccount.id] -= amountToDeduct;
            remainingPayment -= amountToDeduct;
          }
          
          // If still need to deduct, take from other accounts
          if (remainingPayment > 0) {
            for (const account of (model.balanceItems || [])) {
              if (remainingPayment <= 0) break;
              if (account.id === checkingAccount?.id) continue;
              
              if (accountBalances[account.id] > 0) {
                const amountToDeduct = Math.min(remainingPayment, accountBalances[account.id]);
                accountBalances[account.id] -= amountToDeduct;
                remainingPayment -= amountToDeduct;
              }
            }
          }
          
          // If debt is now paid off (balance = 0) and there was leftover payment, add to Checking
          if (debtBalances[debt.id] === 0 && newBalance < 0 && checkingAccount) {
            const excessPayment = Math.abs(newBalance);
            accountBalances[checkingAccount.id] = (accountBalances[checkingAccount.id] || 0) + excessPayment;
            availableMoney += excessPayment; // Add back to available since it goes to Checking
          }
        }
        // If no payment entered OR not enough money, debt just grows (already done above)
      });
      
      // Handle payments allocated to debts that are already paid off - redirect to Checking
      (model.debtItems || []).forEach(debt => {
        if (debtBalances[debt.id] <= 0) {
          const paymentAmount = debt.monthlyAllocation || 0;
          if (paymentAmount > 0 && availableMoney >= paymentAmount) {
            // Debt is paid off, redirect payment to Checking
            if (checkingAccount) {
              accountBalances[checkingAccount.id] = (accountBalances[checkingAccount.id] || 0) + paymentAmount;
              availableMoney -= paymentAmount;
            }
          }
        }
      });
      
      // Process account allocations with remaining available money
      (model.balanceItems || []).forEach(account => {
        const requestedAllocation = account.monthlyAllocation || 0;
        // Only allocate if there's enough money for this specific allocation
        const actualAllocation = availableMoney >= requestedAllocation ? requestedAllocation : 0;
        accountBalances[account.id] += actualAllocation;
        availableMoney -= actualAllocation; // Deduct from available money
        
        // Calculate interest on current balance
        const monthlyInterest = accountBalances[account.id] * account.apy / 12;
        accountBalances[account.id] += monthlyInterest;
        totalAccountInterest += monthlyInterest;
      });
      
      // Calculate net worth: total assets minus total debts
      const totalAssets = Object.values(accountBalances).reduce((sum, bal) => sum + bal, 0);
      const totalDebts = Object.values(debtBalances).reduce((sum, bal) => sum + bal, 0);
      const netWorth = totalAssets - totalDebts;
      
      projections.push({
        month: month + 1,
        netWorth: Math.round(netWorth),
        savings: Math.round(monthlyCashFlow * (month + 1)), // Cumulative cash flow
        interest: Math.round(totalAccountInterest - totalDebtInterest), // Net interest (account interest minus debt interest)
      });
    }
    
    return projections;
  }, [startingNetWorth, availablePostExpenses, model.balanceItems, model.debtItems, projectionMonths]);

  // Calculate monthly projections with account breakdown (for detailed view)
  const { monthlyProjections, accountProjections } = useMemo(() => {
    if (!showAccountDetails) {
      return { monthlyProjections: simpleProjections, accountProjections: {} };
    }

    const projections: any[] = [];
    const accountProjs: { [key: string]: any[] } = {};
    const debtProjs: { [key: string]: any[] } = {};
    
    // Initialize account and debt tracking
    model.balanceItems.forEach(account => {
      accountProjs[account.id] = [];
    });
    model.debtItems.forEach(debt => {
      debtProjs[debt.id] = [];
    });

    // Calculate starting balances per account and debt
    const accountBalances: { [key: string]: number } = {};
    (model.balanceItems || []).forEach(account => {
      accountBalances[account.id] = account.amount;
    });
    
    const debtBalances: { [key: string]: number } = {};
    (model.debtItems || []).forEach(debt => {
      debtBalances[debt.id] = debt.currentBalance;
    });

    const monthlyCashFlow = availablePostExpenses; // Can be negative if expenses > income
    
    for (let month = 0; month < projectionMonths; month++) {
      const monthData: any = {
        month: month + 1,
        netWorth: 0,
        savings: 0,
        interest: 0,
      };

      // Handle monthly cash flow (income - expenses)
      if (monthlyCashFlow >= 0) {
        // Positive cash flow: add to Checking account
        const checkingAccount = (model.balanceItems || []).find(acc => 
          acc.name.toLowerCase() === 'checking' || acc.id === 'default-checking'
        );
        if (checkingAccount) {
          accountBalances[checkingAccount.id] = (accountBalances[checkingAccount.id] || 0) + monthlyCashFlow;
        }
      } else {
        // Negative cash flow: cover from accounts (starting with Checking)
        let remainingShortfall = Math.abs(monthlyCashFlow);
        const checkingAccount = (model.balanceItems || []).find(acc => 
          acc.name.toLowerCase() === 'checking' || acc.id === 'default-checking'
        );
        
        if (checkingAccount && accountBalances[checkingAccount.id] > 0) {
          const amountToCover = Math.min(remainingShortfall, accountBalances[checkingAccount.id]);
          accountBalances[checkingAccount.id] -= amountToCover;
          remainingShortfall -= amountToCover;
        }
        
        // If still short, cover from other accounts
        if (remainingShortfall > 0) {
          for (const account of (model.balanceItems || [])) {
            if (remainingShortfall <= 0) break;
            if (account.id === checkingAccount?.id) continue;
            
            if (accountBalances[account.id] > 0) {
              const amountToCover = Math.min(remainingShortfall, accountBalances[account.id]);
              accountBalances[account.id] -= amountToCover;
              remainingShortfall -= amountToCover;
            }
          }
        }
        
        // If still short after using all savings, it increases debt
        if (remainingShortfall > 0 && (model.debtItems || []).length > 0) {
          const firstDebt = (model.debtItems || [])[0];
          debtBalances[firstDebt.id] += remainingShortfall;
        }
      }

      // Calculate available money after handling cash flow
      let availableMoney = Object.values(accountBalances).reduce((sum, bal) => sum + bal, 0);

      // Process debts: add interest first (debts always grow), then process payments individually
      let totalDebtInterest = 0;
      const checkingAccount = model.balanceItems.find(acc => 
        acc.name.toLowerCase() === 'checking' || acc.id === 'default-checking'
      );
      
      (model.debtItems || []).forEach(debt => {
        // Skip if debt is already paid off
        if (debtBalances[debt.id] <= 0) {
          // Store debt data (balance is 0)
          debtProjs[debt.id].push({
            month: month + 1,
            balance: 0,
            interest: 0,
            allocation: 0,
          });
          monthData[`${debt.name}_debt`] = 0;
          return;
        }
        
        // First, add interest (debt grows)
        const monthlyInterest = debtBalances[debt.id] * debt.interestRate / 12;
        debtBalances[debt.id] += monthlyInterest;
        totalDebtInterest += monthlyInterest;
        
        // Then, check if user wants to pay this debt and if there's enough money
        const paymentAmount = debt.monthlyAllocation || 0;
        let actualPayment = 0;
        if (paymentAmount > 0 && availableMoney >= paymentAmount) {
          // User entered a payment AND there's enough money for it
          const newBalance = debtBalances[debt.id] - paymentAmount;
          debtBalances[debt.id] = Math.max(0, newBalance);
          actualPayment = paymentAmount;
          availableMoney -= paymentAmount; // Deduct from available money
          
          // Actually deduct the payment from account balances (starting with Checking)
          let remainingPayment = paymentAmount;
          
          if (checkingAccount && accountBalances[checkingAccount.id] > 0) {
            const amountToDeduct = Math.min(remainingPayment, accountBalances[checkingAccount.id]);
            accountBalances[checkingAccount.id] -= amountToDeduct;
            remainingPayment -= amountToDeduct;
          }
          
          // If still need to deduct, take from other accounts
          if (remainingPayment > 0) {
            for (const account of (model.balanceItems || [])) {
              if (remainingPayment <= 0) break;
              if (account.id === checkingAccount?.id) continue;
              
              if (accountBalances[account.id] > 0) {
                const amountToDeduct = Math.min(remainingPayment, accountBalances[account.id]);
                accountBalances[account.id] -= amountToDeduct;
                remainingPayment -= amountToDeduct;
              }
            }
          }
          
          // If debt is now paid off (balance = 0) and there was leftover payment, add to Checking
          if (debtBalances[debt.id] === 0 && newBalance < 0 && checkingAccount) {
            const excessPayment = Math.abs(newBalance);
            accountBalances[checkingAccount.id] = (accountBalances[checkingAccount.id] || 0) + excessPayment;
            availableMoney += excessPayment; // Add back to available since it goes to Checking
          }
        }
        // If no payment entered OR not enough money, debt just grows (already done above)
        
        // Store debt data
        debtProjs[debt.id].push({
          month: month + 1,
          balance: Math.round(debtBalances[debt.id]),
          interest: Math.round(monthlyInterest),
          allocation: actualPayment,
        });
        
        // Add to month data
        monthData[`${debt.name}_debt`] = Math.round(debtBalances[debt.id]);
      });
      
      // Handle payments allocated to debts that are already paid off - redirect to Checking
      (model.debtItems || []).forEach(debt => {
        if (debtBalances[debt.id] <= 0) {
          const paymentAmount = debt.monthlyAllocation || 0;
          if (paymentAmount > 0 && availableMoney >= paymentAmount) {
            // Debt is paid off, redirect payment to Checking
            if (checkingAccount) {
              accountBalances[checkingAccount.id] = (accountBalances[checkingAccount.id] || 0) + paymentAmount;
              availableMoney -= paymentAmount;
            }
          }
        }
      });

      // Calculate each account's contribution
      let totalAccountInterest = 0;
      (model.balanceItems || []).forEach(account => {
        const requestedAllocation = account.monthlyAllocation || 0;
        // Only allocate if there's enough money for this specific allocation
        const actualAllocation = availableMoney >= requestedAllocation ? requestedAllocation : 0;
        accountBalances[account.id] += actualAllocation;
        availableMoney -= actualAllocation; // Deduct from available money
        
        // Calculate interest for this account
        const monthlyInterest = accountBalances[account.id] * account.apy / 12;
        accountBalances[account.id] += monthlyInterest;
        totalAccountInterest += monthlyInterest;
        
        // Store account data
        accountProjs[account.id].push({
          month: month + 1,
          balance: Math.round(accountBalances[account.id]),
          interest: Math.round(monthlyInterest),
          allocation: actualAllocation,
        });
        
        // Add to month data
        monthData[`${account.name}_balance`] = Math.round(accountBalances[account.id]);
      });

      // Calculate total net worth: assets minus debts
      const totalAssets = Object.values(accountBalances).reduce((sum, bal) => sum + bal, 0);
      const totalDebts = Object.values(debtBalances).reduce((sum, bal) => sum + bal, 0);
      const netWorth = totalAssets - totalDebts;
      
      monthData.netWorth = Math.round(netWorth);
      monthData.savings = Math.round(monthlyCashFlow * (month + 1)); // Cumulative cash flow
      monthData.interest = Math.round(totalAccountInterest - totalDebtInterest); // Net interest

      projections.push(monthData);
    }
    
    return { monthlyProjections: projections, accountProjections: accountProjs };
  }, [startingNetWorth, availablePostExpenses, model.balanceItems, model.debtItems, projectionMonths, showAccountDetails, simpleProjections]);

  // Expense breakdown data
  const expenseData = useMemo(() => {
    return (model.expenseItems || [])
      .filter(item => item.monthlyAmount > 0)
      .map(item => ({
        name: item.name,
        value: item.monthlyAmount,
      }))
      .sort((a, b) => b.value - a.value);
  }, [model.expenseItems]);

  // Income breakdown data
  const incomeData = useMemo(() => {
    const salaryNet = computeNetMonthly(model.salaryConfig);
    const data = [
      { name: 'Salary', value: salaryNet },
      ...(model.incomeItems || []).map(item => ({
        name: item.name,
        value: item.monthlyAmount,
      })),
    ].filter(item => item.value > 0);
    return data;
  }, [model, computeNetMonthly]);

  // Calculate allocation surplus/deficit
  const allocationSurplusDeficit = availablePostExpenses - totalAllocations;

  // Account allocation breakdown (include Checking if there's unallocated surplus)
  const allocationData = useMemo(() => {
    const checkingAccount = (model.balanceItems || []).find(acc => 
      acc.name.toLowerCase() === 'checking' || acc.id === 'default-checking'
    );
    
    const allocations = (model.balanceItems || [])
      .filter(account => {
        // Include if they have an explicit allocation OR if it's Checking with surplus
        const hasAllocation = (account.monthlyAllocation || 0) > 0;
        const isCheckingWithSurplus = account.id === checkingAccount?.id && allocationSurplusDeficit > 0;
        return hasAllocation || isCheckingWithSurplus;
      })
      .map(account => {
        const explicitAllocation = account.monthlyAllocation || 0;
        const isChecking = account.id === checkingAccount?.id;
        const surplusAllocation = isChecking && allocationSurplusDeficit > 0 ? allocationSurplusDeficit : 0;
        const totalAllocation = explicitAllocation + surplusAllocation;
        
        return {
          name: account.name,
          value: totalAllocation,
          balance: account.amount,
          apy: account.apy * 100,
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
    
    return allocations;
  }, [model.balanceItems, allocationSurplusDeficit]);

  // Debt information with payoff calculations
  const debtInfo = useMemo(() => {
    return (model.debtItems || []).map(debt => {
      const monthlyPayment = debt.monthlyAllocation || 0;
      const monthlyInterest = debt.currentBalance * debt.interestRate / 12;
      const principalPayment = Math.max(0, monthlyPayment - monthlyInterest);
      
      // Calculate estimated months to payoff
      // Using simplified calculation: if payment > interest, calculate months
      let estimatedMonths: number | null = null;
      if (monthlyPayment > monthlyInterest && debt.interestRate > 0) {
        // Using amortization formula approximation
        // M = P * [r(1+r)^n] / [(1+r)^n - 1]
        // Solving for n (months) when we know M (payment), P (principal), r (monthly rate)
        const monthlyRate = debt.interestRate / 12;
        if (monthlyRate > 0 && monthlyPayment > monthlyInterest) {
          // Approximate: n ≈ -log(1 - (P*r)/M) / log(1+r)
          const balance = debt.currentBalance;
          const payment = monthlyPayment;
          const rate = monthlyRate;
          
          if (payment > balance * rate) {
            // Use iterative approach for more accuracy
            let remainingBalance = balance;
            let months = 0;
            while (remainingBalance > 0.01 && months < 1000) {
              remainingBalance = remainingBalance * (1 + rate) - payment;
              months++;
              if (remainingBalance >= balance) {
                // Payment is too small, will never pay off
                months = Infinity;
                break;
              }
            }
            estimatedMonths = months < 1000 ? months : null;
          }
        }
      } else if (monthlyPayment > 0 && debt.interestRate === 0) {
        // No interest, simple division
        estimatedMonths = Math.ceil(debt.currentBalance / monthlyPayment);
      }
      
      // Format estimated payoff
      let payoffEstimate: string = 'Never';
      if (estimatedMonths !== null && estimatedMonths !== Infinity) {
        if (estimatedMonths < 12) {
          payoffEstimate = `${estimatedMonths} month${estimatedMonths !== 1 ? 's' : ''}`;
        } else {
          const years = Math.floor(estimatedMonths / 12);
          const months = estimatedMonths % 12;
          if (months === 0) {
            payoffEstimate = `${years} year${years !== 1 ? 's' : ''}`;
          } else {
            payoffEstimate = `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
          }
        }
      }
      
      return {
        name: debt.name,
        currentBalance: debt.currentBalance,
        monthlyPayment: monthlyPayment,
        monthlyInterest: monthlyInterest,
        principalPayment: principalPayment,
        interestRate: debt.interestRate * 100,
        estimatedMonths: estimatedMonths,
        payoffEstimate: payoffEstimate,
      };
    }).filter(debt => debt.currentBalance > 0);
  }, [model.debtItems]);

  // Account balances breakdown
  const accountBalanceData = useMemo(() => {
    return (model.balanceItems || [])
      .filter(account => account.amount > 0)
      .map(account => ({
        name: account.name,
        value: account.amount,
        apy: account.apy * 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [model.balanceItems]);

  // Key metrics
  const savingsRate = totalMonthlyIncome > 0 
    ? ((availablePostExpenses / totalMonthlyIncome) * 100).toFixed(1)
    : '0.0';

  const allocationRate = availablePostExpenses > 0
    ? ((totalAllocations / availablePostExpenses) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border-2 border-blue-200 p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-600 mb-1">Savings Rate</div>
          <div className="text-2xl font-bold text-blue-600">{savingsRate}%</div>
          <div className="text-xs text-gray-500 mt-1">of income saved</div>
        </div>
        <div className="bg-white rounded-xl border-2 border-green-200 p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-600 mb-1">Monthly Savings</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(availablePostExpenses)}</div>
          <div className="text-xs text-gray-500 mt-1">after expenses</div>
        </div>
        <div className="bg-white rounded-xl border-2 border-purple-200 p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-600 mb-1">Allocation Rate</div>
          <div className="text-2xl font-bold text-purple-600">{allocationRate}%</div>
          <div className="text-xs text-gray-500 mt-1">of savings allocated</div>
        </div>
        <div className="bg-white rounded-xl border-2 border-yellow-200 p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-600 mb-1">Current Net Worth</div>
          <div className="text-2xl font-bold text-yellow-600">{formatCurrency(startingNetWorth)}</div>
          <div className="text-xs text-gray-500 mt-1">starting balance</div>
        </div>
      </div>

      {/* Net Worth Projection */}
      <SectionCard 
        title="Net Worth Projection" 
        color="blue"
        icon={<span className="text-xl">📈</span>}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Projection Period (Months)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={projectionMonths}
              onChange={(e) => {
                const months = parseInt(e.target.value) || 12;
                setProjectionMonths(Math.max(1, Math.min(60, months)));
              }}
              className="ml-3 w-20 px-3 py-1.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">View Account Details</label>
            <button
              onClick={() => setShowAccountDetails(!showAccountDetails)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showAccountDetails ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showAccountDetails ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
        {!showAccountDetails ? (
          <>
            {/* Simple View */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={simpleProjections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  label={{ value: 'Net Worth ($)', angle: -90, position: 'insideLeft' }}
                  stroke="#6b7280"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="netWorth" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Projected Net Worth"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-700">
                <strong>Projected Net Worth in {projectionMonths} months:</strong>{' '}
                <span className="text-blue-700 font-bold">
                  {formatCurrency(simpleProjections[simpleProjections.length - 1]?.netWorth || 0)}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Based on current income, expenses, allocations, and APY rates
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Detailed View with Account Breakdown */}
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={monthlyProjections}>
                <defs>
                  {(model.balanceItems || []).map((account, index) => (
                    <linearGradient key={account.id} id={`color${account.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.1}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft' }}
                  stroke="#6b7280"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelFormatter={(label) => `Month ${label}`}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => {
                    // Extract account name from the data key
                    const account = (model.balanceItems || []).find(acc => `${acc.name}_balance` === value);
                    return account ? account.name : value.replace('_balance', '');
                  }}
                />
                {model.balanceItems.map((account, index) => (
                  <Area
                    key={account.id}
                    type="monotone"
                    dataKey={`${account.name}_balance`}
                    stackId="1"
                    stroke={COLORS[index % COLORS.length]}
                    fill={`url(#color${account.id})`}
                    name={`${account.name}_balance`}
                  />
                ))}
                <Line 
                  type="monotone" 
                  dataKey="netWorth" 
                  stroke="#1f2937" 
                  strokeWidth={3}
                  name="Total Net Worth"
                  dot={{ fill: '#1f2937', r: 5 }}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-700 mb-2">
                <strong>Projected Net Worth in {projectionMonths} months:</strong>{' '}
                <span className="text-blue-700 font-bold">
                  {formatCurrency(monthlyProjections[monthlyProjections.length - 1]?.netWorth || 0)}
                </span>
              </div>
              <div className="text-xs text-gray-600 mb-3">
                Based on current income, expenses, allocations, and APY rates
              </div>
              
              {/* Account Breakdown Summary */}
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="text-xs font-semibold text-gray-700 mb-2">Account Breakdown (Final Month):</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {model.balanceItems.map((account) => {
                    const finalMonth = accountProjections[account.id]?.[accountProjections[account.id].length - 1];
                    if (!finalMonth) return null;
                    return (
                      <div key={account.id} className="text-xs">
                        <div className="font-medium text-gray-700">{account.name}:</div>
                        <div className="text-gray-600">
                          {formatCurrency(finalMonth.balance)} 
                          {finalMonth.allocation > 0 && (
                            <span className="text-green-600"> (+{formatCurrency(finalMonth.allocation * projectionMonths)})</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </SectionCard>

      {/* Income vs Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard 
          title="Income Breakdown" 
          color="green"
          icon={<span className="text-xl">💰</span>}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incomeData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => {
                  const percentage = (percent * 100).toFixed(0);
                  // Use shorter labels for better fit
                  const shortName = name.length > 15 ? name.substring(0, 12) + '...' : name;
                  return `${shortName}\n${percentage}%`;
                }}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {incomeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => {
                  const item = incomeData.find(d => d.name === value);
                  const percentage = item ? ((item.value / totalMonthlyIncome) * 100).toFixed(1) : '0';
                  return `${value}: ${percentage}%`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalMonthlyIncome)}</div>
            <div className="text-xs text-gray-500">Total Monthly Income</div>
          </div>
        </SectionCard>

        <SectionCard 
          title="Expense Breakdown" 
          color="pink"
          icon={<span className="text-xl">📊</span>}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
              <YAxis 
                stroke="#6b7280"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</div>
            <div className="text-xs text-gray-500">Total Monthly Expenses</div>
          </div>
        </SectionCard>
      </div>

      {/* Account Allocations */}
      <SectionCard 
        title="Monthly Allocation Distribution" 
        color="yellow"
        icon={<span className="text-xl">💵</span>}
      >
        {allocationData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={allocationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" width={120} />
                <Tooltip 
                  formatter={(value: number, _name: string, props: any) => [
                    formatCurrency(value),
                    `APY: ${props.payload.apy.toFixed(2)}%`
                  ]}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-sm text-gray-700">
                <strong>Total Allocated:</strong>{' '}
                <span className="text-yellow-700 font-bold">{formatCurrency(totalAllocations)}</span>
                {' / '}
                <span className="text-gray-600">{formatCurrency(availablePostExpenses)}</span>
              </div>
              {allocationSurplusDeficit > 0 && (
                <div className="text-xs text-gray-600 mt-2">
                  <span className="text-green-600 font-medium">
                    +{formatCurrency(allocationSurplusDeficit)}
                  </span>
                  {' will automatically go to Checking'}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No allocations set yet. Go to Planning to allocate your funds.</p>
          </div>
        )}
      </SectionCard>

      {/* Debt Information */}
      {debtInfo.length > 0 && (
        <SectionCard 
          title="Debts & Payoff Information" 
          color="red"
          icon={<span className="text-xl">💳</span>}
        >
          <div className="space-y-4">
            {debtInfo.map((debt) => (
              <div
                key={debt.name}
                className="bg-white border-2 border-red-200 rounded-xl p-4 hover:border-red-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{debt.name}</h3>
                    <div className="text-sm text-gray-600">
                      Current Balance: <span className="font-semibold text-gray-900">{formatCurrency(debt.currentBalance)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Interest Rate: <span className="font-semibold text-gray-900">{debt.interestRate.toFixed(2)}% APR</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Monthly Payment</div>
                    <div className="text-base font-bold text-red-600">
                      {debt.monthlyPayment > 0 ? formatCurrency(debt.monthlyPayment) : 'No payment'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Principal Payment</div>
                    <div className="text-base font-bold text-green-600">
                      {debt.principalPayment > 0 ? formatCurrency(debt.principalPayment) : '$0'}
                    </div>
                    {debt.monthlyPayment > 0 && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        ({((debt.principalPayment / debt.monthlyPayment) * 100).toFixed(0)}% of payment)
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Interest Payment</div>
                    <div className="text-base font-bold text-orange-600">
                      {formatCurrency(debt.monthlyInterest)}
                    </div>
                    {debt.monthlyPayment > 0 && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        ({((debt.monthlyInterest / debt.monthlyPayment) * 100).toFixed(0)}% of payment)
                      </div>
                    )}
                  </div>
                </div>
                
                {debt.monthlyPayment > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Estimated Payoff Time</span>
                      <span className="text-sm font-bold text-blue-600">{debt.payoffEstimate}</span>
                    </div>
                    {debt.monthlyPayment <= debt.monthlyInterest && (
                      <div className="text-xs text-red-600 mt-1">
                        ⚠️ Payment is less than or equal to interest. Debt will not decrease.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-3 border-t-2 border-gray-200">
              <div className="flex items-center justify-between px-2">
                <span className="text-sm font-semibold text-gray-700">Total Monthly Debt Payments</span>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(debtInfo.reduce((sum, debt) => sum + debt.monthlyPayment, 0))}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Account Balances */}
      <SectionCard 
        title="Current Account Balances" 
        color="purple"
        icon={<span className="text-xl">🏦</span>}
      >
        {accountBalanceData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accountBalanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                <YAxis 
                  stroke="#6b7280"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number, _name: string, props: any) => [
                    formatCurrency(value),
                    `APY: ${props.payload.apy.toFixed(2)}%`
                  ]}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm text-gray-700">
                <strong>Total Net Worth:</strong>{' '}
                <span className="text-purple-700 font-bold">{formatCurrency(startingNetWorth)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No account balances yet. Go to Accounts to add your accounts.</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

