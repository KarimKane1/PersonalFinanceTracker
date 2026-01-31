import { FinanceModel } from '../types';
import { SectionCard } from '../components/SectionCard';
import { DebtsTable } from '../components/DebtsTable';

interface DebtsPageProps {
  debtItems: FinanceModel['debtItems'];
  onAdd: () => void;
  onUpdate: (id: string, field: 'name' | 'currentBalance' | 'interestRate' | 'minimumPayment', value: string | number) => void;
  onDelete: (id: string) => void;
  totalMinimumDebtPayments: number; // Not used in component but kept for consistency with App.tsx
}

export function DebtsPage({
  debtItems,
  onAdd,
  onUpdate,
  onDelete,
}: DebtsPageProps) {
  return (
    <div className="space-y-6">
      <SectionCard 
        title="Debts & Loans" 
        color="red"
        icon={<span className="text-xl">💳</span>}
      >
        <p className="text-xs text-gray-600 mb-4">
          Track your debts and loans separately from expenses. Minimum payments are automatically deducted from your available funds in the Income & Expenses page.
        </p>
        <DebtsTable
          debts={debtItems}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onDelete={onDelete}
          emptyMessage="No debts or loans yet. Click 'Add Debt / Loan' to get started."
        />
      </SectionCard>
    </div>
  );
}

