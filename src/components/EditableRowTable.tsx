import { useState } from 'react';
import { formatCurrency } from '../utils/format';

export interface EditableRow {
  id: string;
  name: string;
  amount: number;
}

interface EditableRowTableProps {
  rows: EditableRow[];
  onAdd: () => void;
  onUpdate: (id: string, field: 'name' | 'amount', value: string | number) => void;
  onDelete: (id: string) => void;
  totalLabel: string;
  totalAmount: number;
  allowNegative?: boolean;
  amountLabel?: string;
  emptyMessage?: string;
}

/**
 * EditableRowTable - Generic CRUD component for managing rows of data
 * 
 * This component provides a reusable table interface for adding, editing,
 * and deleting rows. Uses always-visible inputs for better UX.
 */
export function EditableRowTable({
  rows,
  onAdd,
  onUpdate,
  onDelete,
  totalLabel,
  totalAmount,
  allowNegative = false,
  emptyMessage = 'No items yet. Click "Add Item" to get started.',
}: EditableRowTableProps) {
  // Track local input values for amounts to allow free typing
  const [amountInputs, setAmountInputs] = useState<{ [key: string]: string }>({});

  const handleNameChange = (id: string, value: string) => {
    onUpdate(id, 'name', value);
  };

  const getAmountInputValue = (id: string, currentAmount: number): string => {
    if (amountInputs[id] !== undefined) {
      return amountInputs[id];
    }
    return currentAmount === 0 ? '' : currentAmount.toString();
  };

  const handleAmountInputChange = (id: string, value: string) => {
    // Allow typing freely - only keep numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    setAmountInputs(prev => ({ ...prev, [id]: cleaned }));
  };

  const handleAmountBlur = (id: string, value: string) => {
    const parsed = parseFloat(value) || 0;
    if (allowNegative || parsed >= 0) {
      onUpdate(id, 'amount', parsed);
    }
    // Clear local input state
    setAmountInputs(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-2">
      {rows.length === 0 ? (
        <div className="text-center py-4 text-gray-400 bg-gray-50 rounded-md border border-dashed border-gray-200">
          <p className="text-xs">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => handleNameChange(row.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Item name"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
              </div>
              <div className="w-28 flex-shrink-0">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={getAmountInputValue(row.id, row.amount)}
                    onChange={(e) => handleAmountInputChange(row.id, e.target.value)}
                    onBlur={(e) => handleAmountBlur(row.id, e.target.value)}
                    onKeyDown={handleAmountKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="0"
                    className="w-full pl-5 pr-2 py-1.5 text-sm text-right border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(row.id);
                }}
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Total Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl mt-3">
        <span className="text-sm font-semibold text-gray-700">{totalLabel}</span>
        <span className="text-base sm:text-lg font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAdd();
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm font-semibold mt-3 shadow-sm hover:shadow-md"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </button>
    </div>
  );
}

