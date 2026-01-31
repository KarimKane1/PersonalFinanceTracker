import { BalanceItem } from '../types';
import { formatCurrency } from '../utils/format';
import { SectionCard } from '../components/SectionCard';

interface PlanningPageProps {
  accounts: BalanceItem[];
  onUpdateAllocation: (accountId: string, amount: number) => void;
  availablePostExpenses: number;
  totalAllocations: number;
  allocationSurplusDeficit: number;
}

export function PlanningPage({
  accounts,
  onUpdateAllocation,
  availablePostExpenses,
  totalAllocations,
  allocationSurplusDeficit,
}: PlanningPageProps) {
  const handleAmountChange = (accountId: string, value: string) => {
    const amount = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    onUpdateAllocation(accountId, amount);
  };

  return (
    <div className="space-y-6">
      {/* Available Funds Summary */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-sm font-medium text-blue-100">Available After Expenses</span>
            <p className="text-xs text-blue-200 mt-1">Amount you can allocate to different accounts</p>
          </div>
          <span className="text-3xl font-bold">{formatCurrency(availablePostExpenses)}</span>
        </div>
      </div>

      {/* Allocations Section */}
      <SectionCard 
        title="Monthly Allocations" 
        color="yellow"
        icon={<span className="text-xl">💵</span>}
      >
        {accounts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-sm mb-2">No accounts found.</p>
            <p className="text-xs">Create accounts in the Accounts page first.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {accounts.map((account) => {
                const allocationAmount = (account as any).monthlyAllocation || 0;
                return (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-yellow-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 mb-1">{account.name}</div>
                      <div className="text-xs text-gray-500">
                        Current Balance: {formatCurrency(account.amount)} • APY: {(account.apy * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="w-36 flex-shrink-0">
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

            {/* Total Allocations */}
            <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-yellow-50 to-white border-2 border-yellow-200 rounded-xl mb-4">
              <span className="text-base font-semibold text-gray-700">Total Allocations</span>
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(totalAllocations)}</span>
            </div>

            {/* Remaining/Over-allocated */}
            <div className={`pt-4 border-t-2 border-gray-200 rounded-xl p-4 ${
              allocationSurplusDeficit >= 0 ? 'bg-green-50/50' : 'bg-red-50/50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  {allocationSurplusDeficit >= 0 ? 'Remaining' : 'Over-allocated'}
                </span>
                <span className={`text-2xl font-bold ${
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
                  You have {formatCurrency(allocationSurplusDeficit)} remaining to allocate.
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

