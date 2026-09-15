/**
 * Robust Calculator Engine for Green Calculator
 * Supports standard operator precedence, decimals, square roots, percentages,
 * division-by-zero protection, and safe parsing.
 */

export interface CalculationState {
  expression: string;
  result: string;
  isEvaluated: boolean;
  error: string | null;
  storedAmounts: string[];
  checkIndex: number | null;
  checkStatus: {
    type: 'idle' | 'valid' | 'incomplete' | 'error';
    message: string;
  } | null;
}

export const INITIAL_STATE: CalculationState = {
  expression: '',
  result: '0',
  isEvaluated: false,
  error: null,
  storedAmounts: [],
  checkIndex: null,
  checkStatus: null,
};

// Operator symbols
export const OP_ADD = '+';
export const OP_SUB = '−';
export const OP_MUL = '×';
export const OP_DIV = '÷';
export const OP_PCT = '%';
export const OP_SQRT = '√';

const OPERATORS = [OP_ADD, OP_SUB, OP_MUL, OP_DIV];

/**
 * Format a number cleanly without floating point precision issues (e.g. 0.1 + 0.2 -> 0.3)
 */
export function formatNumber(num: number): string {
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return 'Error';

  // Format with high precision then remove float noise
  const precisionStr = num.toPrecision(12);
  const parsed = parseFloat(precisionStr);

  if (Math.abs(parsed) >= 1e14 || (Math.abs(parsed) > 0 && Math.abs(parsed) < 1e-6)) {
    return parsed.toExponential(6).replace(/\+/, '');
  }

  // Check if integer
  if (Number.isInteger(parsed)) {
    return parsed.toString();
  }

  // Format decimal and strip trailing zeros
  const fixed = parsed.toFixed(10);
  return fixed.replace(/\.?0+$/, '');
}

/**
 * Tokenize an expression string
 */
export function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let currentNum = '';

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];

    if ((char >= '0' && char <= '9') || char === '.') {
      currentNum += char;
    } else if (OPERATORS.includes(char) || char === OP_PCT || char === OP_SQRT || char === '(' || char === ')') {
      if (currentNum.length > 0) {
        tokens.push(currentNum);
        currentNum = '';
      }
      tokens.push(char);
    } else if (char === ' ') {
      if (currentNum.length > 0) {
        tokens.push(currentNum);
        currentNum = '';
      }
    }
  }

  if (currentNum.length > 0) {
    tokens.push(currentNum);
  }

  return tokens;
}

/**
 * Evaluates an expression string safely.
 * Returns formatted result string or 'Error'.
 */
export function evaluateExpression(expression: string): { result: string; isError: boolean } {
  const trimmed = expression.trim();
  if (!trimmed) return { result: '0', isError: false };

  try {
    const tokens = tokenize(trimmed);
    if (tokens.length === 0) return { result: '0', isError: false };

    // Handle single token
    if (tokens.length === 1) {
      const single = tokens[0];
      const val = parseFloat(single);
      if (isNaN(val)) return { result: 'Error', isError: true };
      return { result: formatNumber(val), isError: false };
    }

    // Step 1: Resolve square roots and unary minuses
    // E.g. ['√', '81'] -> ['9'], or ['10', '+', '√', '81'] -> ['10', '+', '9']
    const resolvedUnary: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token === OP_SQRT) {
        // Next token must be a number
        if (i + 1 < tokens.length) {
          const nextVal = parseFloat(tokens[i + 1]);
          if (isNaN(nextVal) || nextVal < 0) {
            return { result: 'Error', isError: true };
          }
          const sqrtResult = Math.sqrt(nextVal);
          resolvedUnary.push(sqrtResult.toString());
          i++; // skip next token
        } else {
          return { result: 'Error', isError: true };
        }
      } else if (token === OP_SUB && (i === 0 || OPERATORS.includes(tokens[i - 1]))) {
        // Unary negative number
        if (i + 1 < tokens.length) {
          const nextVal = parseFloat(tokens[i + 1]);
          if (!isNaN(nextVal)) {
            resolvedUnary.push((-nextVal).toString());
            i++;
          } else {
            return { result: 'Error', isError: true };
          }
        } else {
          return { result: 'Error', isError: true };
        }
      } else {
        resolvedUnary.push(token);
      }
    }

    // Step 2: Handle Percentages (e.g. 25 % -> 0.25, or 100 + 10 % -> 100 + 10)
    const resolvedPercentages: string[] = [];
    for (let i = 0; i < resolvedUnary.length; i++) {
      const token = resolvedUnary[i];
      if (token === OP_PCT) {
        if (resolvedPercentages.length === 0) {
          return { result: 'Error', isError: true };
        }
        const prevToken = resolvedPercentages.pop()!;
        const prevVal = parseFloat(prevToken);
        if (isNaN(prevVal)) return { result: 'Error', isError: true };

        // Check if there is an operator before the previous value (e.g. [100, '+', 10])
        if (resolvedPercentages.length >= 2) {
          const op = resolvedPercentages[resolvedPercentages.length - 1];
          const base = parseFloat(resolvedPercentages[resolvedPercentages.length - 2]);
          if (!isNaN(base) && (op === OP_ADD || op === OP_SUB)) {
            // e.g. 100 + 10% = 100 + (100 * 0.10)
            const percentVal = base * (prevVal / 100);
            resolvedPercentages.push(percentVal.toString());
            continue;
          }
        }

        // Standard standalone percent: 25% = 0.25
        resolvedPercentages.push((prevVal / 100).toString());
      } else {
        resolvedPercentages.push(token);
      }
    }

    // Step 3: Handle Multiplication and Division (high precedence)
    const resolvedMulDiv: string[] = [];
    for (let i = 0; i < resolvedPercentages.length; i++) {
      const token = resolvedPercentages[i];

      if (token === OP_MUL || token === OP_DIV) {
        if (resolvedMulDiv.length === 0 || i + 1 >= resolvedPercentages.length) {
          return { result: 'Error', isError: true };
        }

        const prevVal = parseFloat(resolvedMulDiv.pop()!);
        const nextVal = parseFloat(resolvedPercentages[i + 1]);

        if (isNaN(prevVal) || isNaN(nextVal)) {
          return { result: 'Error', isError: true };
        }

        if (token === OP_DIV) {
          if (nextVal === 0) {
            return { result: 'Error', isError: true };
          }
          resolvedMulDiv.push((prevVal / nextVal).toString());
        } else {
          resolvedMulDiv.push((prevVal * nextVal).toString());
        }

        i++; // skip next token
      } else {
        resolvedMulDiv.push(token);
      }
    }

    // Step 4: Handle Addition and Subtraction (low precedence)
    if (resolvedMulDiv.length === 0) return { result: '0', isError: false };

    let total = parseFloat(resolvedMulDiv[0]);
    if (isNaN(total)) return { result: 'Error', isError: true };

    for (let i = 1; i < resolvedMulDiv.length; i += 2) {
      const op = resolvedMulDiv[i];
      if (i + 1 >= resolvedMulDiv.length) {
        // Incomplete expression
        return { result: 'Error', isError: true };
      }
      const nextVal = parseFloat(resolvedMulDiv[i + 1]);
      if (isNaN(nextVal)) return { result: 'Error', isError: true };

      if (op === OP_ADD) {
        total += nextVal;
      } else if (op === OP_SUB) {
        total -= nextVal;
      } else {
        return { result: 'Error', isError: true };
      }
    }

    return { result: formatNumber(total), isError: false };
  } catch {
    return { result: 'Error', isError: true };
  }
}

/**
 * Checks if the last character or token is an operator
 */
export function endsWithOperator(expr: string): boolean {
  const trimmed = expr.trim();
  if (!trimmed) return false;
  const lastChar = trimmed[trimmed.length - 1];
  return OPERATORS.includes(lastChar);
}

/**
 * Gets the current active number token being typed
 */
export function getCurrentNumberToken(expr: string): string {
  let token = '';
  for (let i = expr.length - 1; i >= 0; i--) {
    const char = expr[i];
    if ((char >= '0' && char <= '9') || char === '.') {
      token = char + token;
    } else {
      break;
    }
  }
  return token;
}

/**
 * Extracts individual numeric amounts entered in an expression.
 * E.g.:
 * "10 + 20 + 30" => ["10", "20", "30"]
 * "100 + 250 + 50 + 25" => ["100", "250", "50", "25"]
 * "5.5 + 10 + 2.5" => ["5.5", "10", "2.5"]
 * "100" => ["100"]
 * Mathematical operators are not counted as amounts.
 */
export function extractAmounts(expression: string): string[] {
  const trimmed = expression.trim();
  if (!trimmed) return [];

  const tokens = tokenize(trimmed);
  const amounts: string[] = [];

  for (const token of tokens) {
    // Skip operators and special functions
    if (
      OPERATORS.includes(token) ||
      token === OP_PCT ||
      token === OP_SQRT ||
      token === '(' ||
      token === ')'
    ) {
      continue;
    }

    // Verify it parses as a number
    if (!isNaN(Number(token))) {
      amounts.push(token);
    }
  }

  return amounts;
}
