/**
 * Calculator Action Reducer handling all button presses according to specifications
 */

import {
  CalculationState,
  INITIAL_STATE,
  OP_ADD,
  OP_SUB,
  OP_MUL,
  OP_DIV,
  OP_PCT,
  OP_SQRT,
  evaluateExpression,
  endsWithOperator,
  getCurrentNumberToken,
  extractAmounts,
} from './calculatorEngine';

export type CalculatorAction =
  | { type: 'INPUT_DIGIT'; digit: string }
  | { type: 'INPUT_DOUBLE_ZERO' }
  | { type: 'INPUT_DECIMAL' }
  | { type: 'INPUT_OPERATOR'; operator: string }
  | { type: 'INPUT_PERCENT' }
  | { type: 'INPUT_SQRT' }
  | { type: 'DELETE' }
  | { type: 'CLEAR' }
  | { type: 'EQUALS' }
  | { type: 'CHECK' };

export function calculatorReducer(state: CalculationState, action: CalculatorAction): CalculationState {
  switch (action.type) {
    case 'CLEAR': {
      return { ...INITIAL_STATE };
    }

    case 'DELETE': {
      // If error state active, reset to clear
      if (state.error) {
        return { ...INITIAL_STATE };
      }

      // If nothing to delete, do nothing
      if (!state.expression) {
        return { ...INITIAL_STATE };
      }

      // If expression ends with trailing space and operator (e.g. " + ")
      let newExpr = state.expression;
      if (newExpr.endsWith(' ')) {
        newExpr = newExpr.trimEnd();
      }

      // Remove last character
      newExpr = newExpr.slice(0, -1);

      // Clean up any dangling trailing space
      if (newExpr.endsWith(' ')) {
        newExpr = newExpr.trimEnd();
      }

      // If expression is now empty, reset
      if (!newExpr) {
        return { ...INITIAL_STATE };
      }

      // Live compute preview if valid
      const liveEval = evaluateExpression(newExpr);
      const newAmounts = extractAmounts(newExpr);
      return {
        ...state,
        expression: newExpr,
        result: liveEval.isError ? state.result : liveEval.result,
        storedAmounts: newAmounts,
        checkIndex: null,
        isEvaluated: false,
        checkStatus: null,
      };
    }

    case 'INPUT_DIGIT': {
      const { digit } = action;

      // If user was in error state, just evaluated (=), or reviewing via CHECK, start fresh calculation
      if (state.error || state.isEvaluated || state.checkIndex !== null) {
        return {
          ...INITIAL_STATE,
          expression: digit,
          result: digit,
          storedAmounts: [digit],
        };
      }

      let newExpr = state.expression;

      // If expression is "0", replace with new digit
      const currentToken = getCurrentNumberToken(newExpr);
      if (currentToken === '0') {
        newExpr = newExpr.slice(0, -1) + digit;
      } else {
        newExpr += digit;
      }

      const liveEval = evaluateExpression(newExpr);
      const newAmounts = extractAmounts(newExpr);
      return {
        ...state,
        expression: newExpr,
        result: liveEval.isError ? state.result : liveEval.result,
        storedAmounts: newAmounts,
        checkIndex: null,
        checkStatus: null,
      };
    }

    case 'INPUT_DOUBLE_ZERO': {
      if (state.error || state.isEvaluated || state.checkIndex !== null) {
        return {
          ...INITIAL_STATE,
          expression: '0',
          result: '0',
          storedAmounts: ['0'],
        };
      }

      let newExpr = state.expression;

      // Check current number token
      const currentToken = getCurrentNumberToken(newExpr);

      // If current token is already '0', do nothing (keep single '0')
      if (currentToken === '0') {
        return state;
      }

      // If current token is empty (e.g. start or after operator), enters '0'
      if (currentToken === '') {
        if (endsWithOperator(newExpr) || newExpr === '') {
          newExpr += (newExpr === '' ? '0' : ' 0');
        } else {
          newExpr += '0';
        }
      } else {
        // If has non-zero digits, append '00'
        newExpr += '00';
      }

      const liveEval = evaluateExpression(newExpr);
      const newAmounts = extractAmounts(newExpr);
      return {
        ...state,
        expression: newExpr,
        result: liveEval.isError ? state.result : liveEval.result,
        storedAmounts: newAmounts,
        checkIndex: null,
        checkStatus: null,
      };
    }

    case 'INPUT_DECIMAL': {
      if (state.error || state.isEvaluated || state.checkIndex !== null) {
        return {
          ...INITIAL_STATE,
          expression: '0.',
          result: '0.',
          storedAmounts: ['0.'],
        };
      }

      let newExpr = state.expression;
      const currentToken = getCurrentNumberToken(newExpr);

      // If current number already contains a decimal point, reject
      if (currentToken.includes('.')) {
        return state;
      }

      // If current token is empty, prepend '0.'
      if (currentToken === '') {
        if (endsWithOperator(newExpr)) {
          newExpr += ' 0.';
        } else if (newExpr === '') {
          newExpr = '0.';
        } else {
          newExpr += '0.';
        }
      } else {
        newExpr += '.';
      }

      const newAmounts = extractAmounts(newExpr);
      return {
        ...state,
        expression: newExpr,
        storedAmounts: newAmounts,
        checkIndex: null,
        checkStatus: null,
      };
    }

    case 'INPUT_OPERATOR': {
      const { operator } = action;

      // If there is an error, clear error and start from 0 with operator if negative
      if (state.error) {
        if (operator === OP_SUB) {
          return {
            ...INITIAL_STATE,
            expression: OP_SUB,
          };
        }
        return state;
      }

      // If evaluated, use previous result as starting point
      if (state.isEvaluated && state.result && state.result !== 'Error') {
        const newExpr = `${state.result} ${operator} `;
        return {
          ...state,
          expression: newExpr,
          storedAmounts: [state.result],
          checkIndex: null,
          isEvaluated: false,
          checkStatus: null,
        };
      }

      // If in check mode but not evaluated yet, continue with the expression
      if (state.checkIndex !== null) {
        const exprTrimmed = state.expression.trim();
        const newExpr = endsWithOperator(exprTrimmed)
          ? `${exprTrimmed.slice(0, -1).trimEnd()} ${operator} `
          : `${exprTrimmed} ${operator} `;
        return {
          ...state,
          expression: newExpr,
          storedAmounts: extractAmounts(newExpr),
          checkIndex: null,
          checkStatus: null,
        };
      }

      let newExpr = state.expression.trim();

      // If expression is empty
      if (!newExpr) {
        if (operator === OP_SUB) {
          // Allow leading minus for negative numbers
          return {
            ...state,
            expression: OP_SUB,
            checkStatus: null,
          };
        }
        return state;
      }

      // Check if ends with operator
      if (endsWithOperator(newExpr)) {
        // Special case: if ends with × or ÷, and user presses −, allow negative operand e.g. "5 × −"
        const lastChar = newExpr[newExpr.length - 1];
        if ((lastChar === OP_MUL || lastChar === OP_DIV) && operator === OP_SUB) {
          return {
            ...state,
            expression: `${newExpr} ${operator}`,
            checkStatus: null,
          };
        }

        // Replace trailing operator with the new one
        let trimmed = newExpr;
        while (endsWithOperator(trimmed)) {
          trimmed = trimmed.slice(0, -1).trimEnd();
        }
        const updatedExpr = `${trimmed} ${operator} `;
        return {
          ...state,
          expression: updatedExpr,
          storedAmounts: extractAmounts(updatedExpr),
          checkIndex: null,
          checkStatus: null,
        };
      }

      const updatedExpr = `${newExpr} ${operator} `;
      return {
        ...state,
        expression: updatedExpr,
        storedAmounts: extractAmounts(updatedExpr),
        checkIndex: null,
        checkStatus: null,
      };
    }

    case 'INPUT_PERCENT': {
      let newExpr = state.expression.trim();

      if (state.error) return state;

      if (state.isEvaluated && state.result && state.result !== 'Error') {
        newExpr = state.result;
      }

      if (!newExpr) return state;

      if (endsWithOperator(newExpr)) return state;

      // Append %
      const exprWithPct = `${newExpr} %`;
      const evalRes = evaluateExpression(exprWithPct);

      return {
        ...state,
        expression: exprWithPct,
        result: evalRes.result,
        storedAmounts: extractAmounts(exprWithPct),
        checkIndex: null,
        isEvaluated: false,
        checkStatus: null,
      };
    }

    case 'INPUT_SQRT': {
      let newExpr = state.expression.trim();

      if (state.error) {
        return {
          ...INITIAL_STATE,
          expression: OP_SQRT,
        };
      }

      // If evaluated, start new expression with √ on the result
      if (state.isEvaluated && state.result && state.result !== 'Error') {
        const val = parseFloat(state.result);
        if (val >= 0) {
          const sqrtRes = Math.sqrt(val);
          return {
            ...state,
            expression: `${OP_SQRT} ${state.result}`,
            result: sqrtRes.toString(),
            storedAmounts: [state.result],
            checkIndex: null,
            isEvaluated: true,
            checkStatus: null,
          };
        }
      }

      // If expression is empty, start with √
      if (!newExpr) {
        return {
          ...state,
          expression: `${OP_SQRT} `,
          checkIndex: null,
          checkStatus: null,
        };
      }

      // If expression ends with operator, append √
      if (endsWithOperator(newExpr)) {
        return {
          ...state,
          expression: `${newExpr} ${OP_SQRT} `,
          checkIndex: null,
          checkStatus: null,
        };
      }

      // If expression ends with a number (e.g. 81)
      const currentToken = getCurrentNumberToken(newExpr);
      if (currentToken) {
        const numVal = parseFloat(currentToken);
        if (!isNaN(numVal) && numVal >= 0) {
          const sqrtVal = Math.sqrt(numVal);
          const prefix = newExpr.slice(0, newExpr.length - currentToken.length);
          const updatedExpr = `${prefix}${OP_SQRT} ${currentToken}`;
          return {
            ...state,
            expression: updatedExpr,
            result: sqrtVal.toString(),
            storedAmounts: extractAmounts(updatedExpr),
            checkIndex: null,
            checkStatus: null,
          };
        }
      }

      const updatedExpr = `${OP_SQRT} ${newExpr}`;
      return {
        ...state,
        expression: updatedExpr,
        storedAmounts: extractAmounts(updatedExpr),
        checkIndex: null,
        checkStatus: null,
      };
    }

    case 'EQUALS': {
      if (state.error) return state;

      let expr = state.expression.trim();
      if (!expr) {
        return state;
      }

      // If ends with operator, strip trailing operator safely
      while (endsWithOperator(expr)) {
        expr = expr.slice(0, -1).trimEnd();
      }

      if (!expr) return state;

      const evalRes = evaluateExpression(expr);
      const amounts = state.storedAmounts.length > 0 ? state.storedAmounts : extractAmounts(expr);

      if (evalRes.isError) {
        return {
          ...state,
          expression: expr,
          result: 'Error',
          error: 'Error',
          storedAmounts: amounts,
          checkIndex: null,
          isEvaluated: true,
          checkStatus: null,
        };
      }

      return {
        ...state,
        expression: expr,
        result: evalRes.result,
        error: null,
        storedAmounts: amounts,
        checkIndex: null,
        isEvaluated: true,
        checkStatus: null,
      };
    }

    case 'CHECK': {
      if (state.error) return state;

      // Extract amounts from storedAmounts or current expression
      const amounts = state.storedAmounts.length > 0
        ? state.storedAmounts
        : extractAmounts(state.expression);

      if (amounts.length === 0) {
        return {
          ...state,
          checkIndex: null,
          checkStatus: {
            type: 'incomplete',
            message: 'No amounts entered to check.',
          },
        };
      }

      let nextIndex = 0;
      if (state.checkIndex !== null) {
        if (state.checkIndex < amounts.length - 1) {
          nextIndex = state.checkIndex + 1;
        } else {
          // Keep showing last amount and counter (e.g. 30 and 3/3)
          nextIndex = amounts.length - 1;
        }
      }

      return {
        ...state,
        storedAmounts: amounts,
        checkIndex: nextIndex,
        result: amounts[nextIndex],
        checkStatus: null,
      };
    }

    default:
      return state;
  }
}

