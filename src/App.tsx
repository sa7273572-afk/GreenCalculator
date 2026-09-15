/**
 * Green Calculator - Native Android Calculator
 * Pixel-perfect Android runtime layout with dark green display, modern keypad, and robust offline logic.
 */

import React, { useReducer, useEffect, useState, useCallback } from 'react';
import { Smartphone, Code, ShieldCheck } from 'lucide-react';
import { INITIAL_STATE, evaluateExpression } from './utils/calculatorEngine';
import { calculatorReducer } from './utils/calculatorReducer';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { CalculatorKeypad } from './components/CalculatorKeypad';
import { AndroidNavBar } from './components/AndroidNavBar';
import { VerificationPanel } from './components/VerificationPanel';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { getIsAudioMuted, toggleAudioMute } from './utils/audioFeedback';

export default function App() {
  const [state, dispatch] = useReducer(calculatorReducer, INITIAL_STATE);
  const [isMuted, setIsMuted] = useState(getIsAudioMuted());
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  const handleToggleMute = useCallback(() => {
    const muted = toggleAudioMute();
    setIsMuted(muted);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if focus is in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key;

      if (key >= '0' && key <= '9') {
        e.preventDefault();
        dispatch({ type: 'INPUT_DIGIT', digit: key });
      } else if (key === '.') {
        e.preventDefault();
        dispatch({ type: 'INPUT_DECIMAL' });
      } else if (key === '+') {
        e.preventDefault();
        dispatch({ type: 'INPUT_OPERATOR', operator: '+' });
      } else if (key === '-') {
        e.preventDefault();
        dispatch({ type: 'INPUT_OPERATOR', operator: '−' });
      } else if (key === '*') {
        e.preventDefault();
        dispatch({ type: 'INPUT_OPERATOR', operator: '×' });
      } else if (key === '/') {
        e.preventDefault();
        dispatch({ type: 'INPUT_OPERATOR', operator: '÷' });
      } else if (key === '%') {
        e.preventDefault();
        dispatch({ type: 'INPUT_PERCENT' });
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        dispatch({ type: 'EQUALS' });
      } else if (key === 'Backspace') {
        e.preventDefault();
        dispatch({ type: 'DELETE' });
      } else if (key === 'Escape') {
        e.preventDefault();
        dispatch({ type: 'CLEAR' });
      } else if (key.toLowerCase() === 'c') {
        e.preventDefault();
        dispatch({ type: 'CHECK' });
      } else if (key.toLowerCase() === 's') {
        e.preventDefault();
        dispatch({ type: 'INPUT_SQRT' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper for test case loader from verification panel
  const handleLoadTest = (expr: string) => {
    dispatch({ type: 'CLEAR' });
    const evalRes = evaluateExpression(expr);
    // Directly set expression and evaluation
    // We can simulate input
    for (const ch of expr) {
      if (ch >= '0' && ch <= '9') {
        dispatch({ type: 'INPUT_DIGIT', digit: ch });
      } else if (ch === '.') {
        dispatch({ type: 'INPUT_DECIMAL' });
      } else if (ch === '+') {
        dispatch({ type: 'INPUT_OPERATOR', operator: '+' });
      } else if (ch === '−' || ch === '-') {
        dispatch({ type: 'INPUT_OPERATOR', operator: '−' });
      } else if (ch === '×' || ch === '*') {
        dispatch({ type: 'INPUT_OPERATOR', operator: '×' });
      } else if (ch === '÷' || ch === '/') {
        dispatch({ type: 'INPUT_OPERATOR', operator: '÷' });
      } else if (ch === '%') {
        dispatch({ type: 'INPUT_PERCENT' });
      } else if (ch === '√') {
        dispatch({ type: 'INPUT_SQRT' });
      }
    }
  };

  return (
    <div
      id="app-root"
      className="min-h-screen w-full bg-[#060c09] text-gray-100 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 select-none font-sans"
    >
      {/* Top Controls Toolbar */}
      <header className="w-full max-w-md flex items-center justify-between px-2 mb-3">
        <div className="flex items-center space-x-2.5">
          <img
            src="/src/assets/images/green_calculator_icon_1789446057966.jpg"
            alt="Green Calculator Icon"
            className="w-8 h-8 rounded-xl object-cover border border-emerald-500/40 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-sm font-bold tracking-wide text-emerald-100">Green Calculator</h1>
            <p className="text-[11px] text-emerald-400 font-medium">Native Jetpack Compose Layout</p>
          </div>
        </div>

        <button
          id="btn-view-kotlin-code"
          type="button"
          onClick={() => setIsCodeModalOpen(true)}
          className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-[#0e271d] hover:bg-[#143628] border border-emerald-700/60 text-emerald-200 text-xs font-medium shadow-sm transition-all cursor-pointer active:scale-95"
          title="View Native Kotlin & Jetpack Compose project files"
        >
          <Code className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
          <span>Android Kotlin Code</span>
        </button>
      </header>

      {/* Main Native Android Phone Frame Container */}
      <main
        id="android-phone-frame"
        className="w-full max-w-sm sm:max-w-[390px] bg-[#0c1410] border-[6px] border-[#182620] rounded-[36px] sm:rounded-[42px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(5,150,105,0.15)] flex flex-col overflow-hidden relative"
        style={{
          boxShadow:
            '0 0 0 2px rgba(16, 185, 129, 0.2), 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(6, 33, 20, 0.3)',
        }}
      >
        {/* Android Status Bar */}
        <AndroidStatusBar isMuted={isMuted} onToggleMute={handleToggleMute} />

        {/* Inner Phone Content (Calculator Screen) */}
        <div className="flex-1 flex flex-col justify-between px-4 pb-2 pt-1 space-y-3">
          {/* 1. DISPLAY AREA - Dark green calculator display */}
          <CalculatorDisplay state={state} />

          {/* 2. CALCULATOR BUTTON LAYOUT */}
          <CalculatorKeypad dispatch={dispatch} />

          {/* 3. ANDROID GESTURE NAVIGATION BAR */}
          <AndroidNavBar />
        </div>
      </main>

      {/* Bottom Testing & Verification Toolbar */}
      <footer className="w-full max-w-sm sm:max-w-[390px] mt-4 flex flex-col items-center">
        <VerificationPanel
          onLoadTest={handleLoadTest}
          onClear={() => dispatch({ type: 'CLEAR' })}
        />
        <div className="mt-3 flex items-center text-[11px] text-emerald-600/80 space-x-3">
          <span>Complete Offline Execution</span>
          <span>&bull;</span>
          <span>Zero Network Overhead</span>
          <span>&bull;</span>
          <span>Kotlin Jetpack Compose</span>
        </div>
      </footer>

      {/* Native Kotlin Code Modal */}
      <AndroidCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}
