import { useState } from 'react';
import { DebtItem } from '../types';
import { formatCurrency } from '../utils/format';

interface DebtCardProps {
  debt: DebtItem;
  onUpdate: (id: string, field: 'name' | 'currentBalance' | 'interestRate' | 'minimumPayment', value: string | number) => void;
  onDelete: (id: string) => void;
}

export function DebtCard({ debt, onUpdate, onDelete }: DebtCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(debt.name);
  const [editBalance, setEditBalance] = useState(debt.currentBalance.toString());
  const [editRate, setEditRate] = useState((debt.interestRate * 100).toFixed(2));
  const [editPayment, setEditPayment] = useState(debt.minimumPayment.toString());

  const handleSave = () => {
    onUpdate(debt.id, 'name', editName);
    onUpdate(debt.id, 'currentBalance', parseFloat(editBalance) || 0);
    onUpdate(debt.id, 'interestRate', parseFloat(editRate) / 100 || 0);
    onUpdate(debt.id, 'minimumPayment', parseFloat(editPayment) || 0);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(debt.name);
    setEditBalance(debt.currentBalance.toString());
    setEditRate((debt.interestRate * 100).toFixed(2));
    setEditPayment(debt.minimumPayment.toString());
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-red-300 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Debt Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g., Credit Card, Student Loan"
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Remaining Balance</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  className="w-full pl-5 pr-2 py-2 text-sm text-right border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Interest Rate (APR %)</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={editRate}
                  onChange={(e) => setEditRate(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  className="w-full px-2 py-2 text-sm text-right border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Monthly Payment</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editPayment}
                  onChange={(e) => setEditPayment(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  className="w-full pl-5 pr-2 py-2 text-sm text-right border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-red-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{debt.name}</h3>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(debt.id)}
            className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Remaining Balance</div>
          <div className="text-lg font-bold text-gray-900">{formatCurrency(debt.currentBalance)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Interest Rate (APR)</div>
          <div className="text-lg font-bold text-gray-900">{(debt.interestRate * 100).toFixed(2)}%</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Monthly Payment</div>
          <div className="text-lg font-bold text-orange-600">{formatCurrency(debt.minimumPayment)}</div>
        </div>
      </div>
    </div>
  );
}

