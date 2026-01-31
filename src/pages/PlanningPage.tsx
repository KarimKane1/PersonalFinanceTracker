import { BalanceItem, DebtItem } from '../types';
import { formatCurrency } from '../utils/format';
import { SectionCard } from '../components/SectionCard';

interface PlanningPageProps {
  accounts: BalanceItem[];
  debtItems: DebtItem[];
  onUpdateAllocation: (accountId: string, amount: number) => void;
  onUpdateDebtAllocation: (debtId: string, amount: number) => void;
  availablePostExpenses: number;
  totalAllocations: number;
  allocationSurplusDeficit: number;
}

export function PlanningPage({
  accounts,
  debtItems,
  onUpdateAllocation,
  onUpdateDebtAllocation,
  availablePostExpenses,
  totalAllocations,
  allocationSurplusDeficit,
}: PlanningPageProps) {
  const handleAmountChange = (accountId: string, value: string) => {
    const amount = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    onUpdateAllocation(accountId, amount);
  };

  const handleDebtAmountChange = (debtId: string, value: string) => {
    const amount = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    onUpdateDebtAllocation(debtId, amount);
  };

  return (
    <div className="space-y-6">
      {/* Available Funds Summary */}
      <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg ${
        availablePostExpenses >= 0 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
          : 'bg-gradient-to-br from-red-500 to-red-600 text-white'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-2">
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium block opacity-90">
              {availablePostExpenses >= 0 ? 'Available After Expenses' : 'Monthly Shortfall'}
            </span>
            <p className="text-xs mt-1 opacity-75">
              {availablePostExpenses >= 0 
                ? 'Amount you can allocate to different accounts' 
                : 'Expenses exceed income. This will be covered by existing savings or increase debt.'}
            </p>
          </div>
          <span className="text-2xl sm:text-3xl font-bold whitespace-nowrap">{formatCurrency(availablePostExpenses)}</span>
        </div>
      </div>

      {/* Warning for negative cash flow */}
      {availablePostExpenses < 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-lg sm:text-xl flex-shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-red-800">
                <strong>Warning:</strong> Your expenses exceed your income by {formatCurrency(Math.abs(availablePostExpenses))} per month. 
                This shortfall will need to be covered by existing savings (accounts) or will increase your debt. 
                Consider reducing expenses or increasing income.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <span className="text-lg sm:text-xl flex-shrink-0">ℹ️</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-700">
              <strong>Note:</strong> Any money that isn't allocated to specific accounts will automatically go to your <strong>Checking</strong> account. Make sure you have a Checking account set up in the Accounts page.
            </p>
          </div>
        </div>
      </div>

      {/* Allocations Section */}
      <SectionCard 
        title="Monthly Allocations" 
        color="yellow"
        icon={<span className="text-xl">💵</span>}
      >
        {accounts.length === 0 && debtItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-sm mb-2">No accounts or debts found.</p>
            <p className="text-xs">Create accounts in the Accounts page and debts in the Debts & Loans page first.</p>
          </div>
        ) : (
          <>
            {/* Accounts Section */}
            {accounts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Accounts</h3>
                <div className="space-y-3">
                  {accounts.map((account) => {
                const allocationAmount = (account as any).monthlyAllocation || 0;
                const isChecking = account.name.toLowerCase() === 'checking' || account.id === 'default-checking';
                return (
                  <div
                    key={account.id}
                    className={`flex items-center gap-3 p-4 bg-white border-2 rounded-xl hover:shadow-sm transition-all ${
                      isChecking 
                        ? 'border-blue-300 bg-blue-50/30' 
                        : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-900">{account.name}</div>
                        {isChecking && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Current Balance: {formatCurrency(account.amount)} • APY: {(account.apy * 100).toFixed(2)}%
                      </div>
                      {isChecking && allocationSurplusDeficit > 0 && (
                        <div className="text-xs text-blue-600 mt-1 font-medium">
                          + {formatCurrency(allocationSurplusDeficit)} excess will be added here
                        </div>
                      )}
                    </div>
                    <div className="w-full sm:w-36 flex-shrink-0">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={allocationAmount === 0 ? '' : allocationAmount.toString()}
                          onChange={(e) => handleAmountChange(account.id, e.target.value)}
                          placeholder="0"
                          className="w-full pl-7 pr-3 py-2 text-sm text-right border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>
              </div>
            )}

            {/* Debts Section */}
            {debtItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Debts & Loans</h3>
                <div className="space-y-3">
                  {debtItems.map((debt) => {
                    const allocationAmount = debt.monthlyAllocation || 0;
                    return (
                      <div
                        key={debt.id}
                        className="flex items-center gap-3 p-4 bg-white border-2 border-red-200 rounded-xl hover:border-red-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-sm font-semibold text-gray-900">{debt.name}</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Balance: {formatCurrency(debt.currentBalance)} • APR: {(debt.interestRate * 100).toFixed(2)}%
                          </div>
                          <div className="text-xs text-red-600 mt-1 font-medium">
                            Min. Payment: {formatCurrency(debt.minimumPayment)}
                          </div>
                        </div>
                        <div className="w-full sm:w-36 flex-shrink-0">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={allocationAmount === 0 ? '' : allocationAmount.toString()}
                              onChange={(e) => handleDebtAmountChange(debt.id, e.target.value)}
                              placeholder="0"
                              className="w-full pl-7 pr-3 py-2 text-sm text-right border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Total Allocations */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-4 py-3 sm:py-4 bg-gradient-to-r from-yellow-50 to-white border-2 border-yellow-200 rounded-xl mb-4">
              <span className="text-sm sm:text-base font-semibold text-gray-700">Total Allocations</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(totalAllocations)}</span>
            </div>

            {/* Remaining/Over-allocated */}
            <div className={`pt-4 border-t-2 border-gray-200 rounded-xl p-3 sm:p-4 ${
              allocationSurplusDeficit >= 0 ? 'bg-green-50/50' : 'bg-red-50/50'
            }`}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-2">
                <span className="text-xs sm:text-sm font-semibold text-gray-700">
                  {allocationSurplusDeficit >= 0 ? 'Remaining (goes to Checking)' : 'Over-allocated'}
                </span>
                <span className={`text-xl sm:text-2xl font-bold ${
                  allocationSurplusDeficit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(allocationSurplusDeficit)}
                </span>
              </div>
              {allocationSurplusDeficit < 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  Your allocations exceed available funds. Adjust your allocations or expenses.
                </p>
              )}
              {allocationSurplusDeficit > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  {formatCurrency(allocationSurplusDeficit)} will automatically go to your <strong>Checking</strong> account.
                </p>
              )}
              {allocationSurplusDeficit === 0 && (
                <p className="text-xs text-green-600 mt-1 font-medium">
                  ✓ All available funds have been allocated!
                </p>
              )}
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}

