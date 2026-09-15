import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { CalculationState } from '../utils/calculatorEngine';

interface CalculatorDisplayProps {
  state: CalculationState;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({ state }) => {
  const { expression, result, isEvaluated, error, checkStatus, storedAmounts, checkIndex } = state;

  const isChecking = checkIndex !== null && storedAmounts.length > 0;
  const amountCount = storedAmounts.length;
  const currentCheckAmount = isChecking ? storedAmounts[checkIndex] : null;

  // Auto-scale expression font size based on length
  const getExpressionFontSize = (text: string) => {
    const len = text.length;
    if (len > 24) return 'text-base sm:text-lg';
    if (len > 16) return 'text-lg sm:text-xl';
    return 'text-xl sm:text-2xl';
  };

  // Auto-scale result font size based on length
  const getResultFontSize = (text: string) => {
    const len = text.length;
    if (len > 14) return 'text-2xl sm:text-3xl';
    if (len > 9) return 'text-3xl sm:text-4xl';
    return 'text-4xl sm:text-5xl';
  };

  const displayText = isChecking
    ? `Amount ${checkIndex + 1}`
    : (expression || '0');

  const mainReadoutValue = isChecking
    ? (currentCheckAmount ?? result)
    : result;

  const isError = result === 'Error' || !!error;

  return (
    <div
      id="calculator-display-container"
      className="relative w-full rounded-2xl bg-[#061d13] border border-[#0f3d28] p-5 shadow-2xl flex flex-col justify-between overflow-hidden min-h-[170px]"
      style={{
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6), 0 4px 20px rgba(6,33,20,0.4)',
      }}
    >
      {/* Subtle retro LCD grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #34d399 1px, transparent 1px), linear-gradient(to bottom, #34d399 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }}
      />

      {/* Top row: Brand & Amount Counter in corner */}
      <div className="flex items-center justify-between z-10 min-h-[26px]">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold tracking-widest text-emerald-500/80 uppercase">
            Green Calc · Native Engine
          </span>
          {isChecking && (
            <span
              id="check-mode-badge"
              className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-emerald-900/70 text-emerald-300 border border-emerald-600/40"
            >
              Check Mode
            </span>
          )}
        </div>

        {/* Small subtle amount counter in top-right corner */}
        <div className="flex items-center space-x-2">
          {checkStatus && (
            <div
              id="display-check-status"
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                checkStatus.type === 'valid'
                  ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-500/40'
                  : checkStatus.type === 'incomplete'
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
              }`}
            >
              {checkStatus.type === 'valid' && <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />}
              {checkStatus.type === 'incomplete' && <HelpCircle className="w-3.5 h-3.5 mr-1 text-amber-400" />}
              {checkStatus.type === 'error' && <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-400" />}
              <span className="truncate max-w-[150px]">{checkStatus.message}</span>
            </div>
          )}

          <div
            id="amount-counter"
            data-amount-count={amountCount}
            data-check-index={checkIndex}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-medium transition-all select-none ${
              isChecking
                ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-400/60 shadow-[0_0_10px_rgba(52,211,153,0.25)]'
                : amountCount > 0
                ? 'bg-[#0a291b] text-emerald-300/90 border border-emerald-800/60'
                : 'bg-[#0a291b]/40 text-emerald-600/50 border border-emerald-900/30'
            }`}
            title={
              isChecking
                ? `Reviewing amount ${checkIndex + 1} of ${amountCount}`
                : `Total amounts entered: ${amountCount}`
            }
          >
            {isChecking
              ? `${checkIndex + 1}/${amountCount}`
              : (amountCount > 0 ? `Amounts: ${amountCount}` : 'Amounts: 0')}
          </div>
        </div>
      </div>

      {/* Main Readout Area */}
      <div className="flex flex-col items-end justify-end mt-2 z-10 w-full space-y-1">
        {/* Secondary Expression Line */}
        <div
          id="calculator-expression"
          className={`w-full text-right font-mono font-normal tracking-wide transition-all duration-150 overflow-x-auto whitespace-nowrap scrollbar-none ${
            isChecking
              ? 'text-emerald-400/90 text-sm font-semibold tracking-wider uppercase'
              : isEvaluated
              ? 'text-emerald-400/60'
              : 'text-emerald-100'
          } ${!isChecking ? getExpressionFontSize(displayText) : ''}`}
          title={displayText}
        >
          {displayText}
        </div>

        {/* Primary Result Line */}
        <div
          id="calculator-result"
          className={`w-full text-right font-mono font-semibold tracking-tight transition-all duration-150 overflow-x-auto whitespace-nowrap scrollbar-none ${
            isError
              ? 'text-rose-400'
              : 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.35)]'
          } ${getResultFontSize(mainReadoutValue)}`}
          title={mainReadoutValue}
        >
          {mainReadoutValue}
        </div>
      </div>
    </div>
  );
};
