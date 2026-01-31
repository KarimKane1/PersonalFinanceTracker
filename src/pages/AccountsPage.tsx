import { BalanceItem } from '../types';
import { formatCurrency } from '../utils/format';
import { SectionCard } from '../components/SectionCard';
import { AccountCard } from '../components/AccountCard';

interface AccountsPageProps {
  balanceItems: BalanceItem[];
  onAdd: () => void;
  onUpdate: (id: string, field: 'name' | 'amount' | 'apy', value: string | number) => void;
  onDelete: (id: string) => void;
  startingNetWorth: number;
}

export function AccountsPage({
  balanceItems,
  onAdd,
  onUpdate,
  onDelete,
  startingNetWorth,
}: AccountsPageProps) {
  return (
    <div className="space-y-6">
      <SectionCard 
        title="Account Balances" 
        color="purple"
        icon={<span className="text-xl">🏦</span>}
      >
        {balanceItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-sm">No accounts yet. Click "Add Account" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {balanceItems.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}

        {/* Total Net Worth */}
        <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-purple-50 to-white border-2 border-purple-200 rounded-xl">
          <span className="text-base font-semibold text-gray-700">Starting Net Worth</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(startingNetWorth)}</span>
        </div>

        {/* Add Button */}
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all text-sm font-semibold mt-4 shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Account
        </button>
      </SectionCard>
    </div>
  );
}

