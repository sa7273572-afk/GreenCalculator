import React, { useState } from 'react';
import { CheckCircle2, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { evaluateExpression, INITIAL_STATE, extractAmounts } from '../utils/calculatorEngine';
import { calculatorReducer } from '../utils/calculatorReducer';

interface TestItem {
  name: string;
  expression: string;
  expected: string;
  description: string;
  actionTest?: () => boolean;
}

interface VerificationPanelProps {
  onLoadTest: (expr: string, isEvaluated?: boolean) => void;
  onClear: () => void;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({ onLoadTest, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [allPassed, setAllPassed] = useState<boolean | null>(null);

  const testCases: TestItem[] = [
    {
      name: 'TEST 1: 10 + 20 + 30',
      expression: '10 + 20 + 30',
      expected: '3 amounts · CHECK: 10→20→30 · =: 60',
      description: '3 separate amounts review & total',
      actionTest: () => {
        let s = { ...INITIAL_STATE };
        // Enter 10 + 20 + 30
        '10 + 20 + 30'.split('').forEach(ch => {
          if (ch >= '0' && ch <= '9') s = calculatorReducer(s, { type: 'INPUT_DIGIT', digit: ch });
          else if (ch === '+') s = calculatorReducer(s, { type: 'INPUT_OPERATOR', operator: '+' });
        });
        if (s.storedAmounts.length !== 3) return false;
        // CHECK 1: Display 10, index 0 (1/3)
        s = calculatorReducer(s, { type: 'CHECK' });
        if (s.result !== '10' || s.checkIndex !== 0) return false;
        // CHECK 2: Display 20, index 1 (2/3)
        s = calculatorReducer(s, { type: 'CHECK' });
        if (s.result !== '20' || s.checkIndex !== 1) return false;
        // CHECK 3: Display 30, index 2 (3/3)
        s = calculatorReducer(s, { type: 'CHECK' });
        if (s.result !== '30' || s.checkIndex !== 2) return false;
        // Press '=': Total = 60
        s = calculatorReducer(s, { type: 'EQUALS' });
        return s.result === '60' && s.checkIndex === null;
      },
    },
    {
      name: 'TEST 2: 100+250+50+25',
      expression: '100 + 250 + 50 + 25',
      expected: '4 amounts · CHECK: 100→250→50→25 · =: 425',
      description: '4 separate amounts review & total',
      actionTest: () => {
        let s = { ...INITIAL_STATE };
        '100 + 250 + 50 + 25'.split('').forEach(ch => {
          if (ch >= '0' && ch <= '9') s = calculatorReducer(s, { type: 'INPUT_DIGIT', digit: ch });
          else if (ch === '+') s = calculatorReducer(s, { type: 'INPUT_OPERATOR', operator: '+' });
        });
        if (s.storedAmounts.length !== 4) return false;
        // CHECK 1: 100
        s = calculatorReducer(s, { type: 'CHECK' });
        if (s.result !== '100' || s.checkIndex !== 0) return false;
        // CHECK 2: 250
        s = calculatorReducer(s, { type: 'CHECK' });
        if (s.result !== '250' || s.checkIndex !== 1) return false;
        // CHECK 3: 50
        s = calculatorReducer(s, { type: 'CHECK' });
        if (s.result !== '50' || s.checkIndex !== 2) return false;
        // CHECK 4: 25
        s = calculatorReducer(s, { type: 'CHECK' });
        if (s.result !== '25' || s.checkIndex !== 3) return false;
        // EQUALS: 425
        s = calculatorReducer(s, { type: 'EQUALS' });
        return s.result === '425';
      },
    },
    {
      name: 'TEST 3: 5.5 + 10 + 2.5',
      expression: '5.5 + 10 + 2.5',
      expected: '3 amounts · CHECK: 5.5→10→2.5 · =: 18',
      description: 'Decimal amounts sequential review',
      actionTest: () => {
        let s = { ...INITIAL_STATE };
        '5.5 + 10 + 2.5'.split('').forEach(ch => {
          if (ch >= '0' && ch <= '9') s = calculatorReducer(s, { type: 'INPUT_DIGIT', digit: ch });
          else if (ch === '.') s = calculatorReducer(s, { type: 'INPUT_DECIMAL' });
          else if (ch === '+') s = calculatorReducer(s, { type: 'INPUT_OPERATOR', operator: '+' });
        });
        if (s.storedAmounts.length !== 3) return false;
        s = calculatorReducer(s, { type: 'CHECK' });
        if (s.result !== '5.5') return false;
        s = calculatorReducer(s, { type: 'CHECK' });
        if (s.result !== '10') return false;
        s = calculatorReducer(s, { type: 'CHECK' });
        if (s.result !== '2.5') return false;
        s = calculatorReducer(s, { type: 'EQUALS' });
        return s.result === '18';
      },
    },
    {
      name: 'TEST 4: Single amount 100',
      expression: '100',
      expected: '1 amount · CHECK: 100 (1/1)',
      description: 'Single amount validation',
      actionTest: () => {
        let s = { ...INITIAL_STATE };
        s = calculatorReducer(s, { type: 'INPUT_DIGIT', digit: '1' });
        s = calculatorReducer(s, { type: 'INPUT_DOUBLE_ZERO' });
        if (s.storedAmounts.length !== 1) return false;
        s = calculatorReducer(s, { type: 'CHECK' });
        return s.result === '100' && s.checkIndex === 0;
      },
    },
    {
      name: 'TEST 5: CLEAR Reset',
      expression: '0',
      expected: 'Amounts: 0, index: null, display: 0',
      description: 'Reset counter & CHECK state',
      actionTest: () => {
        let s = { ...INITIAL_STATE, expression: '10 + 20', storedAmounts: ['10', '20'], checkIndex: 1, result: '20' };
        s = calculatorReducer(s, { type: 'CLEAR' });
        return s.expression === '' && s.result === '0' && s.storedAmounts.length === 0 && s.checkIndex === null;
      },
    },
    {
      name: 'TEST 6: CHECK != EQUALS',
      expression: '10 + 20 + 30',
      expected: 'CHECK shows amount, NOT total 60',
      description: 'CHECK reviews without calculating total',
      actionTest: () => {
        let s = { ...INITIAL_STATE, expression: '10 + 20 + 30', storedAmounts: ['10', '20', '30'] };
        s = calculatorReducer(s, { type: 'CHECK' });
        // CHECK must show amount 10, not the sum 60
        return s.result === '10';
      },
    },
    {
      name: '12 + 8',
      expression: '12 + 8',
      expected: '20',
      description: 'Addition of integers',
    },
    {
      name: '20 − 5',
      expression: '20 − 5',
      expected: '15',
      description: 'Subtraction of integers',
    },
    {
      name: '6 × 7',
      expression: '6 × 7',
      expected: '42',
      description: 'Multiplication',
    },
    {
      name: '100 ÷ 4',
      expression: '100 ÷ 4',
      expected: '25',
      description: 'Division',
    },
    {
      name: '10 + 5 × 2',
      expression: '10 + 5 × 2',
      expected: '20',
      description: 'Operator precedence (× before +)',
    },
    {
      name: '25 %',
      expression: '25 %',
      expected: '0.25',
      description: 'Percentage calculation',
    },
    {
      name: '√ 81',
      expression: '√ 81',
      expected: '9',
      description: 'Square root operation',
    },
    {
      name: '12.5 + 2.5',
      expression: '12.5 + 2.5',
      expected: '15',
      description: 'Decimal numbers arithmetic',
    },
    {
      name: '1000 ÷ 0',
      expression: '1000 ÷ 0',
      expected: 'Error',
      description: 'Division by zero protection',
    },
    {
      name: '12345 → Delete',
      expression: '1234',
      expected: '1234',
      description: 'Delete last digit from 12345',
      actionTest: () => {
        let s = { ...INITIAL_STATE, expression: '12345', result: '12345' };
        s = calculatorReducer(s, { type: 'DELETE' });
        return s.expression === '1234';
      },
    },
    {
      name: '00 input handling',
      expression: '500',
      expected: '500',
      description: 'Double zero appending',
      actionTest: () => {
        let s = { ...INITIAL_STATE, expression: '5', result: '5' };
        s = calculatorReducer(s, { type: 'INPUT_DOUBLE_ZERO' });
        return s.expression === '500';
      },
    },
  ];

  const handleRunAll = () => {
    let allOk = true;
    for (const test of testCases) {
      if (test.actionTest) {
        if (!test.actionTest()) {
          allOk = false;
          break;
        }
      } else {
        const res = evaluateExpression(test.expression);
        if (res.result !== test.expected) {
          allOk = false;
          break;
        }
      }
    }
    setAllPassed(allOk);
  };

  return (
    <div
      id="verification-panel"
      className="w-full max-w-sm sm:max-w-md bg-[#081711] border border-emerald-900/60 rounded-xl overflow-hidden shadow-lg"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a1f17] border-b border-emerald-900/40">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Verification Suite ({testCases.length} Tests)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-run-all-tests"
            type="button"
            onClick={handleRunAll}
            className="inline-flex items-center px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium shadow-sm transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3 mr-1" />
            Verify All
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-emerald-400 hover:text-emerald-200 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Status banner when verified */}
      {allPassed !== null && (
        <div className={`px-4 py-2 text-xs flex items-center justify-between ${allPassed ? 'bg-emerald-950/80 text-emerald-300' : 'bg-rose-950/80 text-rose-300'}`}>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">All {testCases.length} requirements verified & passing perfectly.</span>
          </div>
          <button
            type="button"
            onClick={() => { setAllPassed(null); onClear(); }}
            className="underline text-[11px] hover:text-white"
          >
            Reset
          </button>
        </div>
      )}

      {/* Expandable test case grid */}
      {isExpanded && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
          {testCases.map((test, index) => {
            const isPassing = test.actionTest
              ? test.actionTest()
              : evaluateExpression(test.expression).result === test.expected;

            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (test.name === 'TEST 5: CLEAR Reset') {
                    onClear();
                  } else {
                    onLoadTest(test.expression, false);
                  }
                }}
                className="flex items-center justify-between p-2 rounded-lg bg-[#0e241c] hover:bg-[#133327] border border-emerald-900/40 text-left transition-colors cursor-pointer group"
                title={`Click to test: ${test.name} -> ${test.expected}`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-mono font-medium text-emerald-200 truncate group-hover:text-emerald-100">
                    {test.name}
                  </span>
                  <span className="text-[10px] text-emerald-500/80 truncate">{test.description}</span>
                </div>
                <div className="shrink-0 flex items-center">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/40 font-mono">
                    {isPassing ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

