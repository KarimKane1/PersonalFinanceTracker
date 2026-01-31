import { SalaryConfig } from '../types';
import { formatCurrency, parseCurrencyInput } from '../utils/format';

interface SalaryCardHeaderProps {
  salaryConfig: SalaryConfig;
  onUpdate: (updates: Partial<SalaryConfig>) => void;
  computedNetMonthly: number;
}

/**
 * SalaryCardHeader - Component for managing salary configuration
 * 
 * Handles the salary mode toggle (gross_to_net vs net_only) and the
 * corresponding input fields. Computes netMonthly when in gross_to_net mode.
 */
export function SalaryCardHeader({
  salaryConfig,
  onUpdate,
  computedNetMonthly,
}: SalaryCardHeaderProps) {
  const handleModeChange = (mode: 'gross_to_net' | 'net_only') => {
    onUpdate({ mode });
  };

  const handleAnnualGrossChange = (value: string) => {
    const parsed = parseCurrencyInput(value);
    if (parsed >= 0) {
      onUpdate({ annualGross: parsed });
    }
  };

  const handleNetPercentChange = (value: string) => {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
      onUpdate({ netPercent: parsed });
    }
  };

  const handleNetMonthlyChange = (value: string) => {
    const parsed = parseCurrencyInput(value);
    if (parsed >= 0) {
      onUpdate({ netMonthly: parsed });
    }
  };

  return (
    <div className="mb-4 pb-4 border-b border-gray-200">
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Salary Mode
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleModeChange('gross_to_net')}
            className={`flex-1 px-4 py-2.5 rounded-xl border-2 text-sm transition-all font-medium ${
              salaryConfig.mode === 'gross_to_net'
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            Gross to Net
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('net_only')}
            className={`flex-1 px-4 py-2.5 rounded-xl border-2 text-sm transition-all font-medium ${
              salaryConfig.mode === 'net_only'
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            Net Only
          </button>
        </div>
      </div>

      {salaryConfig.mode === 'gross_to_net' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Annual Gross
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={salaryConfig.annualGross === 0 ? '' : salaryConfig.annualGross.toString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    handleAnnualGrossChange(value);
                  }}
                  placeholder="72000"
                  className="w-full pl-6 pr-2.5 py-2.5 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Net % <span className="text-gray-500">(0-1)</span>
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={salaryConfig.netPercent}
                onChange={(e) => handleNetPercentChange(e.target.value)}
                placeholder="0.70"
                className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              />
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-700">Net Monthly (Computed)</span>
              <span className="text-xl font-bold text-blue-900">{formatCurrency(computedNetMonthly)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Net Monthly Salary
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={salaryConfig.netMonthly === 0 ? '' : salaryConfig.netMonthly.toString()}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '');
                handleNetMonthlyChange(value);
              }}
              placeholder="4200"
              className="w-full pl-6 pr-2.5 py-2.5 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}

