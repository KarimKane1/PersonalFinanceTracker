import React, { useMemo, useState } from 'react';
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
    let currentBalance = startingNetWorth;
    const monthlySavings = availablePostExpenses;
    
    for (let month = 0; month < projectionMonths; month++) {
      // Add monthly savings
      currentBalance += monthlySavings;
      
      // Add interest from accounts
      const monthlyInterest = model.balanceItems.reduce((sum, account) => {
        const accountBalance = account.amount + (account.monthlyAllocation || 0) * (month + 1);
        return sum + (accountBalance * account.apy / 12);
      }, 0);
      
      currentBalance += monthlyInterest;
      
      projections.push({
        month: month + 1,
        netWorth: Math.round(currentBalance),
        savings: Math.round(monthlySavings * (month + 1)),
        interest: Math.round(monthlyInterest),
      });
    }
    
    return projections;
  }, [startingNetWorth, availablePostExpenses, model.balanceItems, projectionMonths]);

  // Calculate monthly projections with account breakdown (for detailed view)
  const { monthlyProjections, accountProjections } = useMemo(() => {
    if (!showAccountDetails) {
      return { monthlyProjections: simpleProjections, accountProjections: {} };
    }

    const projections: any[] = [];
    const accountProjs: { [key: string]: any[] } = {};
    
    // Initialize account tracking
    model.balanceItems.forEach(account => {
      accountProjs[account.id] = [];
    });

    // Calculate starting balances per account
    const accountBalances: { [key: string]: number } = {};
    model.balanceItems.forEach(account => {
      accountBalances[account.id] = account.amount;
    });

    let totalNetWorth = startingNetWorth;
    const monthlySavings = availablePostExpenses;
    
    for (let month = 0; month < projectionMonths; month++) {
      const monthData: any = {
        month: month + 1,
        netWorth: 0,
        savings: 0,
        interest: 0,
      };

      // Calculate each account's contribution
      let totalInterest = 0;
      model.balanceItems.forEach(account => {
        const allocation = account.monthlyAllocation || 0;
        
        // Add monthly allocation to account balance
        accountBalances[account.id] += allocation;
        
        // Calculate interest for this account
        const monthlyInterest = accountBalances[account.id] * account.apy / 12;
        accountBalances[account.id] += monthlyInterest;
        totalInterest += monthlyInterest;
        
        // Store account data
        accountProjs[account.id].push({
          month: month + 1,
          balance: Math.round(accountBalances[account.id]),
          interest: Math.round(monthlyInterest),
          allocation: allocation,
        });
        
        // Add to month data
        monthData[`${account.name}_balance`] = Math.round(accountBalances[account.id]);
      });

      // Calculate total net worth
      totalNetWorth = Object.values(accountBalances).reduce((sum, bal) => sum + bal, 0);
      monthData.netWorth = Math.round(totalNetWorth);
      monthData.savings = Math.round(monthlySavings * (month + 1));
      monthData.interest = Math.round(totalInterest);

      projections.push(monthData);
    }
    
    return { monthlyProjections: projections, accountProjections: accountProjs };
  }, [startingNetWorth, availablePostExpenses, model.balanceItems, projectionMonths, showAccountDetails, simpleProjections]);

  // Expense breakdown data
  const expenseData = useMemo(() => {
    return model.expenseItems
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
      ...model.incomeItems.map(item => ({
        name: item.name,
        value: item.monthlyAmount,
      })),
    ].filter(item => item.value > 0);
    return data;
  }, [model, computeNetMonthly]);

  // Account allocation breakdown
  const allocationData = useMemo(() => {
    return model.balanceItems
      .filter(account => (account.monthlyAllocation || 0) > 0)
      .map(account => ({
        name: account.name,
        value: account.monthlyAllocation || 0,
        balance: account.amount,
        apy: account.apy * 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [model.balanceItems]);

  // Account balances breakdown
  const accountBalanceData = useMemo(() => {
    return model.balanceItems
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
                  {model.balanceItems.map((account, index) => (
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
                  formatter={(value: number, name: string) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelFormatter={(label) => `Month ${label}`}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => {
                    // Extract account name from the data key
                    const account = model.balanceItems.find(acc => `${acc.name}_balance` === value);
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
                {incomeData.map((entry, index) => (
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
                formatter={(value, entry: any) => {
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
                  formatter={(value: number, name: string, props: any) => [
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
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No allocations set yet. Go to Planning to allocate your funds.</p>
          </div>
        )}
      </SectionCard>

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
                  formatter={(value: number, name: string, props: any) => [
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

