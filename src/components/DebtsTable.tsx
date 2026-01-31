import { formatCurrency } from '../utils/format';
import { DebtItem } from '../types';
import { DebtCard } from './DebtCard';

interface DebtsTableProps {
  debts: DebtItem[];
  onAdd: () => void;
  onUpdate: (id: string, field: 'name' | 'currentBalance' | 'interestRate' | 'minimumPayment', value: string | number) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

/**
 * DebtsTable - Component for managing debts and loans
 * 
 * Tracks debt balances, interest rates, and minimum payments separately from expenses
 */
export function DebtsTable({
  debts,
  onAdd,
  onUpdate,
  onDelete,
  emptyMessage = 'No debts or loans yet. Click "Add Debt / Loan" to get started.',
}: DebtsTableProps) {
  const totalBalance = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

  return (
    <div className="space-y-4">
      {debts.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {debts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Totals */}
      {debts.length > 0 && (
        <div className="space-y-2 pt-4 border-t-2 border-gray-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-red-50 to-white border-2 border-red-200 rounded-xl">
            <span className="text-sm font-semibold text-gray-700">Total Debt Balance</span>
            <span className="text-base sm:text-lg font-bold text-red-600">{formatCurrency(totalBalance)}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-orange-50 to-white border-2 border-orange-200 rounded-xl">
            <span className="text-sm font-semibold text-gray-700">Debt Monthly Payments</span>
            <span className="text-base sm:text-lg font-bold text-orange-600">{formatCurrency(totalMinimumPayments)}</span>
          </div>
        </div>
      )}

      {/* Add Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAdd();
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all text-sm font-semibold mt-4 shadow-sm hover:shadow-md"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Debt / Loan
      </button>
    </div>
  );
}
