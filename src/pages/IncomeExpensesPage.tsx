import { FinanceModel, SalaryConfig } from '../types';
import { formatCurrency } from '../utils/format';
import { SectionCard } from '../components/SectionCard';
import { EditableRowTable } from '../components/EditableRowTable';
import { SalaryCardHeader } from '../components/SalaryCardHeader';

interface IncomeExpensesPageProps {
  model: FinanceModel;
  onUpdateSalaryConfig: (updates: Partial<SalaryConfig>) => void;
  onAddIncomeItem: () => void;
  onUpdateIncomeItem: (id: string, field: 'name' | 'monthlyAmount', value: string | number) => void;
  onDeleteIncomeItem: (id: string) => void;
  onAddExpenseItem: () => void;
  onUpdateExpenseItem: (id: string, field: 'name' | 'monthlyAmount', value: string | number) => void;
  onDeleteExpenseItem: (id: string) => void;
  computeNetMonthly: (config: SalaryConfig) => number;
  totalMonthlyIncome: number;
  totalExpenses: number;
  availablePostExpenses: number;
}

export function IncomeExpensesPage({
  model,
  onUpdateSalaryConfig,
  onAddIncomeItem,
  onUpdateIncomeItem,
  onDeleteIncomeItem,
  onAddExpenseItem,
  onUpdateExpenseItem,
  onDeleteExpenseItem,
  computeNetMonthly,
  totalMonthlyIncome,
  totalExpenses,
  availablePostExpenses,
}: IncomeExpensesPageProps) {
  return (
    <div className="space-y-6">
      {/* Income Section */}
      <SectionCard 
        title="Income" 
        color="green"
        icon={<span className="text-xl">💰</span>}
      >
        <SalaryCardHeader
          salaryConfig={model.salaryConfig}
          onUpdate={onUpdateSalaryConfig}
          computedNetMonthly={computeNetMonthly(model.salaryConfig)}
        />
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Additional Income Streams</h3>
          <EditableRowTable
            rows={model.incomeItems.map(item => ({ id: item.id, name: item.name, amount: item.monthlyAmount }))}
            onAdd={onAddIncomeItem}
            onUpdate={(id, field, value) => {
              if (field === 'amount') {
                onUpdateIncomeItem(id, 'monthlyAmount', value);
              } else {
                onUpdateIncomeItem(id, field, value);
              }
            }}
            onDelete={onDeleteIncomeItem}
            totalLabel="Total Monthly Income"
            totalAmount={totalMonthlyIncome}
            allowNegative={false}
            emptyMessage="No additional income streams."
          />
        </div>
      </SectionCard>

      {/* Expenses Section */}
      <SectionCard 
        title="Expenses" 
        color="pink"
        icon={<span className="text-xl">📊</span>}
      >
        <EditableRowTable
          rows={model.expenseItems.map(item => ({ id: item.id, name: item.name, amount: item.monthlyAmount }))}
          onAdd={onAddExpenseItem}
          onUpdate={(id, field, value) => {
            if (field === 'amount') {
              onUpdateExpenseItem(id, 'monthlyAmount', value);
            } else {
              onUpdateExpenseItem(id, field, value);
            }
          }}
          onDelete={onDeleteExpenseItem}
          totalLabel="Total Expenses"
          totalAmount={totalExpenses}
          allowNegative={false}
          emptyMessage="No expenses yet."
        />
        <div className="mt-6 pt-4 border-t-2 border-gray-200 bg-white/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Available After Expenses</span>
            <span className="text-2xl font-bold text-blue-600">{formatCurrency(availablePostExpenses)}</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

