package com.greencalculator.app

import java.math.BigDecimal
import java.math.RoundingMode
import kotlin.math.sqrt

data class EvaluationResult(
    val result: String,
    val isError: Boolean
)

object CalculatorEngine {
    const val OP_ADD = "+"
    const val OP_SUB = "−"
    const val OP_MUL = "×"
    const val OP_DIV = "÷"
    const val OP_PCT = "%"
    const val OP_SQRT = "√"

    private val OPERATORS = listOf(OP_ADD, OP_SUB, OP_MUL, OP_DIV)

    fun isOperator(char: String): Boolean = OPERATORS.contains(char)

    fun formatNumber(value: Double): String {
        if (value.isNaN() || value.isInfinite()) return "Error"
        return try {
            val bd = BigDecimal.valueOf(value).stripTrailingZeros()
            // If scale is negative, avoid scientific representation for ordinary sizes
            if (bd.scale() <= 0 && bd.abs() < BigDecimal("1000000000000")) {
                bd.toPlainString()
            } else if (bd.scale() > 10) {
                bd.setScale(10, RoundingMode.HALF_UP).stripTrailingZeros().toPlainString()
            } else {
                bd.toPlainString()
            }
        } catch (_: Exception) {
            "Error"
        }
    }

    fun tokenize(expression: String): List<String> {
        val tokens = mutableListOf<String>()
        var currentNum = StringBuilder()

        for (ch in expression) {
            val s = ch.toString()
            if (ch in '0'..'9' || ch == '.') {
                currentNum.append(ch)
            } else if (OPERATORS.contains(s) || s == OP_PCT || s == OP_SQRT) {
                if (currentNum.isNotEmpty()) {
                    tokens.add(currentNum.toString())
                    currentNum = StringBuilder()
                }
                tokens.add(s)
            } else if (ch == ' ') {
                if (currentNum.isNotEmpty()) {
                    tokens.add(currentNum.toString())
                    currentNum = StringBuilder()
                }
            }
        }
        if (currentNum.isNotEmpty()) {
            tokens.add(currentNum.toString())
        }
        return tokens
    }

    fun evaluate(expression: String): EvaluationResult {
        val trimmed = expression.trim()
        if (trimmed.isEmpty()) return EvaluationResult("0", false)

        return try {
            val tokens = tokenize(trimmed)
            if (tokens.isEmpty()) return EvaluationResult("0", false)

            if (tokens.size == 1) {
                val single = tokens[0].toDoubleOrNull() ?: return EvaluationResult("Error", true)
                return EvaluationResult(formatNumber(single), false)
            }

            // Step 1: Unary square root and unary minus
            val resolvedUnary = mutableListOf<String>()
            var i = 0
            while (i < tokens.size) {
                val token = tokens[i]
                if (token == OP_SQRT) {
                    if (i + 1 < tokens.size) {
                        val nextVal = tokens[i + 1].toDoubleOrNull()
                        if (nextVal == null || nextVal < 0.0) {
                            return EvaluationResult("Error", true)
                        }
                        resolvedUnary.add(sqrt(nextVal).toString())
                        i++
                    } else {
                        return EvaluationResult("Error", true)
                    }
                } else if (token == OP_SUB && (i == 0 || OPERATORS.contains(tokens[i - 1]))) {
                    if (i + 1 < tokens.size) {
                        val nextVal = tokens[i + 1].toDoubleOrNull()
                        if (nextVal != null) {
                            resolvedUnary.add((-nextVal).toString())
                            i++
                        } else {
                            return EvaluationResult("Error", true)
                        }
                    } else {
                        return EvaluationResult("Error", true)
                    }
                } else {
                    resolvedUnary.add(token)
                }
                i++
            }

            // Step 2: Percentage
            val resolvedPercentages = mutableListOf<String>()
            for (token in resolvedUnary) {
                if (token == OP_PCT) {
                    if (resolvedPercentages.isEmpty()) return EvaluationResult("Error", true)
                    val prevToken = resolvedPercentages.removeAt(resolvedPercentages.size - 1)
                    val prevVal = prevToken.toDoubleOrNull() ?: return EvaluationResult("Error", true)

                    if (resolvedPercentages.size >= 2) {
                        val op = resolvedPercentages[resolvedPercentages.size - 1]
                        val base = resolvedPercentages[resolvedPercentages.size - 2].toDoubleOrNull()
                        if (base != null && (op == OP_ADD || op == OP_SUB)) {
                            val pctVal = base * (prevVal / 100.0)
                            resolvedPercentages.add(pctVal.toString())
                            continue
                        }
                    }
                    resolvedPercentages.add((prevVal / 100.0).toString())
                } else {
                    resolvedPercentages.add(token)
                }
            }

            // Step 3: Multiplication & Division (precedence)
            val resolvedMulDiv = mutableListOf<String>()
            var j = 0
            while (j < resolvedPercentages.size) {
                val token = resolvedPercentages[j]
                if (token == OP_MUL || token == OP_DIV) {
                    if (resolvedMulDiv.isEmpty() || j + 1 >= resolvedPercentages.size) {
                        return EvaluationResult("Error", true)
                    }
                    val prevVal = resolvedMulDiv.removeAt(resolvedMulDiv.size - 1).toDoubleOrNull()
                        ?: return EvaluationResult("Error", true)
                    val nextVal = resolvedPercentages[j + 1].toDoubleOrNull()
                        ?: return EvaluationResult("Error", true)

                    if (token == OP_DIV) {
                        if (nextVal == 0.0) {
                            return EvaluationResult("Error", true)
                        }
                        resolvedMulDiv.add((prevVal / nextVal).toString())
                    } else {
                        resolvedMulDiv.add((prevVal * nextVal).toString())
                    }
                    j++
                } else {
                    resolvedMulDiv.add(token)
                }
                j++
            }

            // Step 4: Addition & Subtraction
            if (resolvedMulDiv.isEmpty()) return EvaluationResult("0", false)
            var total = resolvedMulDiv[0].toDoubleOrNull() ?: return EvaluationResult("Error", true)

            var k = 1
            while (k < resolvedMulDiv.size) {
                val op = resolvedMulDiv[k]
                if (k + 1 >= resolvedMulDiv.size) return EvaluationResult("Error", true)
                val nextVal = resolvedMulDiv[k + 1].toDoubleOrNull() ?: return EvaluationResult("Error", true)

                if (op == OP_ADD) {
                    total += nextVal
                } else if (op == OP_SUB) {
                    total -= nextVal
                } else {
                    return EvaluationResult("Error", true)
                }
                k += 2
            }

            EvaluationResult(formatNumber(total), false)
        } catch (_: Exception) {
            EvaluationResult("Error", true)
        }
    }

    fun extractAmounts(expression: String): List<String> {
        val trimmed = expression.trim()
        if (trimmed.isEmpty()) return emptyList()
        val tokens = tokenize(trimmed)
        val amounts = mutableListOf<String>()
        for (token in tokens) {
            if (isOperator(token) || token == OP_PCT || token == OP_SQRT) {
                continue
            }
            if (token.toDoubleOrNull() != null) {
                amounts.add(token)
            }
        }
        return amounts
    }
}

