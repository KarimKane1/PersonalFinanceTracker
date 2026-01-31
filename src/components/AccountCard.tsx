import { useState } from 'react';
import { BalanceItem } from '../types';
import { formatCurrency } from '../utils/format';

interface AccountCardProps {
  account: BalanceItem;
  onUpdate: (id: string, field: 'name' | 'amount' | 'apy', value: string | number) => void;
  onDelete: (id: string) => void;
}

export function AccountCard({ account, onUpdate, onDelete }: AccountCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(account.name);
  const [editAmount, setEditAmount] = useState(account.amount.toString());
  const [editApy, setEditApy] = useState((account.apy * 100).toFixed(2));

  const handleSave = () => {
    const amount = parseFloat(editAmount) || 0;
    const apy = parseFloat(editApy) / 100 || 0;
    onUpdate(account.id, 'name', editName);
    onUpdate(account.id, 'amount', amount);
    onUpdate(account.id, 'apy', apy);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(account.name);
    setEditAmount(account.amount.toString());
    setEditApy((account.apy * 100).toFixed(2));
    setIsEditing(false);
  };

  const monthlyInterest = account.amount * (account.apy / 12);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all">
      {!isEditing ? (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{account.name}</h3>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(account.amount)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(account.id)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">APY</span>
              <span className="text-sm font-semibold text-gray-900">{(account.apy * 100).toFixed(2)}%</span>
            </div>
            {account.apy > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Interest</span>
                <span className="text-sm font-semibold text-green-600">{formatCurrency(monthlyInterest)}</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Account Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="w-full pl-7 pr-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">APY (%)</label>
              <input
                type="text"
                inputMode="numeric"
                value={editApy}
                onChange={(e) => setEditApy(e.target.value.replace(/[^0-9.]/g, ''))}
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm font-semibold"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

