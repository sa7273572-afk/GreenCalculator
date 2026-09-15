import React from 'react';
import { Delete, Check, RotateCcw } from 'lucide-react';
import { CalculatorAction } from '../utils/calculatorReducer';
import {
  OP_ADD,
  OP_SUB,
  OP_MUL,
  OP_DIV,
} from '../utils/calculatorEngine';
import { playKeySound } from '../utils/audioFeedback';

interface CalculatorKeypadProps {
  dispatch: React.Dispatch<CalculatorAction>;
}

export const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({ dispatch }) => {
  const handleDigit = (digit: string) => {
    playKeySound('number');
    dispatch({ type: 'INPUT_DIGIT', digit });
  };

  const handleDoubleZero = () => {
    playKeySound('number');
    dispatch({ type: 'INPUT_DOUBLE_ZERO' });
  };

  const handleDecimal = () => {
    playKeySound('number');
    dispatch({ type: 'INPUT_DECIMAL' });
  };

  const handleOperator = (operator: string) => {
    playKeySound('operator');
    dispatch({ type: 'INPUT_OPERATOR', operator });
  };

  const handlePercent = () => {
    playKeySound('operator');
    dispatch({ type: 'INPUT_PERCENT' });
  };

  const handleSqrt = () => {
    playKeySound('operator');
    dispatch({ type: 'INPUT_SQRT' });
  };

  const handleDelete = () => {
    playKeySound('clear');
    dispatch({ type: 'DELETE' });
  };

  const handleClear = () => {
    playKeySound('clear');
    dispatch({ type: 'CLEAR' });
  };

  const handleEquals = () => {
    playKeySound('action');
    dispatch({ type: 'EQUALS' });
  };

  const handleCheck = () => {
    playKeySound('action');
    dispatch({ type: 'CHECK' });
  };

  return (
    <div id="calculator-keypad" className="w-full flex flex-col space-y-3 pt-2">
      {/* Top Action Row: CLEAR and CHECK */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {/* CLEAR Button */}
        <button
          id="btn-clear"
          type="button"
          onClick={handleClear}
          className="h-13 sm:h-14 rounded-xl bg-[#2a1215] hover:bg-[#38161b] active:bg-[#4d1d24] text-rose-300 font-semibold text-base sm:text-lg tracking-wider border border-rose-900/50 shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>CLEAR</span>
        </button>

        {/* CHECK Button */}
        <button
          id="btn-check"
          type="button"
          onClick={handleCheck}
          className="h-13 sm:h-14 rounded-xl bg-[#063321] hover:bg-[#08422b] active:bg-[#0b5437] text-emerald-200 font-semibold text-base sm:text-lg tracking-wider border border-emerald-600/50 shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>CHECK</span>
        </button>
      </div>

      {/* Main 5x4 Grid: 3 columns main keypad + 1 column right operators */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full">
        {/* ROW 1: % | √ | Delete | ÷ */}
        <button
          id="btn-percent"
          type="button"
          onClick={handlePercent}
          className="h-14 sm:h-16 rounded-xl bg-[#12281e] hover:bg-[#183528] active:bg-[#1e4233] text-emerald-300 font-medium text-xl border border-emerald-800/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          %
        </button>
        <button
          id="btn-sqrt"
          type="button"
          onClick={handleSqrt}
          className="h-14 sm:h-16 rounded-xl bg-[#12281e] hover:bg-[#183528] active:bg-[#1e4233] text-emerald-300 font-medium text-xl border border-emerald-800/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          √
        </button>
        <button
          id="btn-delete"
          type="button"
          onClick={handleDelete}
          className="h-14 sm:h-16 rounded-xl bg-[#12281e] hover:bg-[#183528] active:bg-[#1e4233] text-emerald-300 font-medium text-lg border border-emerald-800/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
          title="Delete last character"
        >
          <Delete className="w-5 h-5 text-emerald-400" />
        </button>
        <button
          id="btn-op-div"
          type="button"
          onClick={() => handleOperator(OP_DIV)}
          className="h-14 sm:h-16 rounded-xl bg-[#059669] hover:bg-[#10b981] active:bg-[#047857] text-white font-semibold text-2xl shadow-md active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          ÷
        </button>

        {/* ROW 2: 7 | 8 | 9 | × */}
        <button
          id="btn-digit-7"
          type="button"
          onClick={() => handleDigit('7')}
          className="h-14 sm:h-16 rounded-xl bg-[#18241f] hover:bg-[#20302a] active:bg-[#2a3f37] text-gray-100 font-medium text-2xl border border-emerald-950/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          7
        </button>
        <button
          id="btn-digit-8"
          type="button"
          onClick={() => handleDigit('8')}
          className="h-14 sm:h-16 rounded-xl bg-[#18241f] hover:bg-[#20302a] active:bg-[#2a3f37] text-gray-100 font-medium text-2xl border border-emerald-950/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          8
        </button>
        <button
          id="btn-digit-9"
          type="button"
          onClick={() => handleDigit('9')}
          className="h-14 sm:h-16 rounded-xl bg-[#18241f] hover:bg-[#20302a] active:bg-[#2a3f37] text-gray-100 font-medium text-2xl border border-emerald-950/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          9
        </button>
        <button
          id="btn-op-mul"
          type="button"
          onClick={() => handleOperator(OP_MUL)}
          className="h-14 sm:h-16 rounded-xl bg-[#059669] hover:bg-[#10b981] active:bg-[#047857] text-white font-semibold text-2xl shadow-md active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          ×
        </button>

        {/* ROW 3: 4 | 5 | 6 | − */}
        <button
          id="btn-digit-4"
          type="button"
          onClick={() => handleDigit('4')}
          className="h-14 sm:h-16 rounded-xl bg-[#18241f] hover:bg-[#20302a] active:bg-[#2a3f37] text-gray-100 font-medium text-2xl border border-emerald-950/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          4
        </button>
        <button
          id="btn-digit-5"
          type="button"
          onClick={() => handleDigit('5')}
          className="h-14 sm:h-16 rounded-xl bg-[#18241f] hover:bg-[#20302a] active:bg-[#2a3f37] text-gray-100 font-medium text-2xl border border-emerald-950/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          5
        </button>
        <button
          id="btn-digit-6"
          type="button"
          onClick={() => handleDigit('6')}
          className="h-14 sm:h-16 rounded-xl bg-[#18241f] hover:bg-[#20302a] active:bg-[#2a3f37] text-gray-100 font-medium text-2xl border border-emerald-950/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          6
        </button>
        <button
          id="btn-op-sub"
          type="button"
          onClick={() => handleOperator(OP_SUB)}
          className="h-14 sm:h-16 rounded-xl bg-[#059669] hover:bg-[#10b981] active:bg-[#047857] text-white font-semibold text-2xl shadow-md active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          −
        </button>

        {/* ROW 4: 1 | 2 | 3 | + */}
        <button
          id="btn-digit-1"
          type="button"
          onClick={() => handleDigit('1')}
          className="h-14 sm:h-16 rounded-xl bg-[#18241f] hover:bg-[#20302a] active:bg-[#2a3f37] text-gray-100 font-medium text-2xl border border-emerald-950/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          1
        </button>
        <button
          id="btn-digit-2"
          type="button"
          onClick={() => handleDigit('2')}
          className="h-14 sm:h-16 rounded-xl bg-[#18241f] hover:bg-[#20302a] active:bg-[#2a3f37] text-gray-100 font-medium text-2xl border border-emerald-950/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          2
        </button>
        <button
          id="btn-digit-3"
          type="button"
          onClick={() => handleDigit('3')}
          className="h-14 sm:h-16 rounded-xl bg-[#18241f] hover:bg-[#20302a] active:bg-[#2a3f37] text-gray-100 font-medium text-2xl border border-emerald-950/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          3
        </button>
        <button
          id="btn-op-add"
          type="button"
          onClick={() => handleOperator(OP_ADD)}
          className="h-14 sm:h-16 rounded-xl bg-[#059669] hover:bg-[#10b981] active:bg-[#047857] text-white font-semibold text-2xl shadow-md active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          +
        </button>

        {/* ROW 5: 00 | 0 | . | = */}
        <button
          id="btn-digit-00"
          type="button"
          onClick={handleDoubleZero}
          className="h-14 sm:h-16 rounded-xl bg-[#18241f] hover:bg-[#20302a] active:bg-[#2a3f37] text-gray-100 font-medium text-xl sm:text-2xl border border-emerald-950/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          00
        </button>
        <button
          id="btn-digit-0"
          type="button"
          onClick={() => handleDigit('0')}
          className="h-14 sm:h-16 rounded-xl bg-[#18241f] hover:bg-[#20302a] active:bg-[#2a3f37] text-gray-100 font-medium text-2xl border border-emerald-950/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          0
        </button>
        <button
          id="btn-decimal"
          type="button"
          onClick={handleDecimal}
          className="h-14 sm:h-16 rounded-xl bg-[#18241f] hover:bg-[#20302a] active:bg-[#2a3f37] text-gray-100 font-bold text-2xl border border-emerald-950/40 shadow-sm active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          .
        </button>
        <button
          id="btn-equals"
          type="button"
          onClick={handleEquals}
          className="h-14 sm:h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:from-emerald-600 active:to-emerald-700 text-white font-bold text-2xl shadow-lg shadow-emerald-900/50 active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer select-none"
        >
          =
        </button>
      </div>
    </div>
  );
};
