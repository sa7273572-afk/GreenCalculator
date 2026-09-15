package com.greencalculator.app

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

data class CheckStatus(
    val type: CheckType,
    val message: String
)

enum class CheckType {
    VALID, INCOMPLETE, ERROR
}

data class CalculatorUiState(
    val expression: String = "",
    val result: String = "0",
    val isEvaluated: Boolean = false,
    val error: String? = null,
    val storedAmounts: List<String> = emptyList(),
    val checkIndex: Int? = null,
    val checkStatus: CheckStatus? = null
)

class CalculatorViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(CalculatorUiState())
    val uiState: StateFlow<CalculatorUiState> = _uiState.asStateFlow()

    fun onDigit(digit: String) {
        _uiState.update { current ->
            if (current.error != null || current.isEvaluated || current.checkIndex != null) {
                CalculatorUiState(
                    expression = digit,
                    result = digit,
                    storedAmounts = listOf(digit)
                )
            } else {
                val currentToken = getCurrentNumberToken(current.expression)
                val newExpr = if (currentToken == "0") {
                    current.expression.dropLast(1) + digit
                } else {
                    current.expression + digit
                }
                val live = CalculatorEngine.evaluate(newExpr)
                val newAmounts = CalculatorEngine.extractAmounts(newExpr)
                current.copy(
                    expression = newExpr,
                    result = if (live.isError) current.result else live.result,
                    storedAmounts = newAmounts,
                    checkIndex = null,
                    checkStatus = null
                )
            }
        }
    }

    fun onDoubleZero() {
        _uiState.update { current ->
            if (current.error != null || current.isEvaluated || current.checkIndex != null) {
                CalculatorUiState(expression = "0", result = "0", storedAmounts = listOf("0"))
            } else {
                val token = getCurrentNumberToken(current.expression)
                if (token == "0") {
                    current
                } else if (token.isEmpty()) {
                    val newExpr = if (current.expression.isEmpty() || endsWithOperator(current.expression)) {
                        if (current.expression.isEmpty()) "0" else current.expression + " 0"
                    } else {
                        current.expression + "0"
                    }
                    val newAmounts = CalculatorEngine.extractAmounts(newExpr)
                    current.copy(expression = newExpr, storedAmounts = newAmounts, checkIndex = null, checkStatus = null)
                } else {
                    val newExpr = current.expression + "00"
                    val live = CalculatorEngine.evaluate(newExpr)
                    val newAmounts = CalculatorEngine.extractAmounts(newExpr)
                    current.copy(
                        expression = newExpr,
                        result = if (live.isError) current.result else live.result,
                        storedAmounts = newAmounts,
                        checkIndex = null,
                        checkStatus = null
                    )
                }
            }
        }
    }

    fun onDecimal() {
        _uiState.update { current ->
            if (current.error != null || current.isEvaluated || current.checkIndex != null) {
                CalculatorUiState(expression = "0.", result = "0.", storedAmounts = listOf("0."))
            } else {
                val token = getCurrentNumberToken(current.expression)
                if (token.contains(".")) {
                    current
                } else {
                    val newExpr = if (token.isEmpty()) {
                        if (endsWithOperator(current.expression)) {
                            current.expression + " 0."
                        } else {
                            current.expression + "0."
                        }
                    } else {
                        current.expression + "."
                    }
                    val newAmounts = CalculatorEngine.extractAmounts(newExpr)
                    current.copy(expression = newExpr, storedAmounts = newAmounts, checkIndex = null, checkStatus = null)
                }
            }
        }
    }

    fun onOperator(op: String) {
        _uiState.update { current ->
            if (current.error != null) {
                if (op == CalculatorEngine.OP_SUB) {
                    CalculatorUiState(expression = CalculatorEngine.OP_SUB)
                } else current
            } else if (current.isEvaluated && current.result != "Error") {
                CalculatorUiState(
                    expression = "${current.result} $op ",
                    result = current.result,
                    storedAmounts = listOf(current.result)
                )
            } else if (current.checkIndex != null) {
                val exprTrimmed = current.expression.trim()
                val newExpr = if (endsWithOperator(exprTrimmed)) {
                    "${exprTrimmed.dropLast(1).trimEnd()} $op "
                } else {
                    "$exprTrimmed $op "
                }
                current.copy(
                    expression = newExpr,
                    storedAmounts = CalculatorEngine.extractAmounts(newExpr),
                    checkIndex = null,
                    checkStatus = null
                )
            } else if (current.expression.isEmpty()) {
                if (op == CalculatorEngine.OP_SUB) {
                    current.copy(expression = CalculatorEngine.OP_SUB)
                } else current
            } else if (endsWithOperator(current.expression)) {
                val trimmed = current.expression.trimEnd()
                val lastChar = trimmed.takeLast(1)
                if ((lastChar == CalculatorEngine.OP_MUL || lastChar == CalculatorEngine.OP_DIV) && op == CalculatorEngine.OP_SUB) {
                    val newExpr = "${current.expression} $op"
                    current.copy(
                        expression = newExpr,
                        storedAmounts = CalculatorEngine.extractAmounts(newExpr),
                        checkStatus = null
                    )
                } else {
                    var cleaned = trimmed
                    while (endsWithOperator(cleaned)) {
                        cleaned = cleaned.dropLast(1).trimEnd()
                    }
                    val newExpr = "$cleaned $op "
                    current.copy(
                        expression = newExpr,
                        storedAmounts = CalculatorEngine.extractAmounts(newExpr),
                        checkIndex = null,
                        checkStatus = null
                    )
                }
            } else {
                val newExpr = "${current.expression} $op "
                current.copy(
                    expression = newExpr,
                    storedAmounts = CalculatorEngine.extractAmounts(newExpr),
                    checkIndex = null,
                    checkStatus = null
                )
            }
        }
    }

    fun onPercent() {
        _uiState.update { current ->
            val expr = if (current.isEvaluated && current.result != "Error") current.result else current.expression.trim()
            if (expr.isEmpty() || endsWithOperator(expr)) return@update current

            val newExpr = "$expr %"
            val eval = CalculatorEngine.evaluate(newExpr)
            current.copy(
                expression = newExpr,
                result = eval.result,
                isEvaluated = false,
                storedAmounts = CalculatorEngine.extractAmounts(newExpr),
                checkIndex = null,
                checkStatus = null
            )
        }
    }

    fun onSqrt() {
        _uiState.update { current ->
            if (current.error != null) {
                return@update CalculatorUiState(expression = CalculatorEngine.OP_SQRT)
            }
            if (current.isEvaluated && current.result != "Error") {
                val num = current.result.toDoubleOrNull()
                if (num != null && num >= 0) {
                    val res = kotlin.math.sqrt(num)
                    return@update CalculatorUiState(
                        expression = "${CalculatorEngine.OP_SQRT} ${current.result}",
                        result = CalculatorEngine.formatNumber(res),
                        isEvaluated = true,
                        storedAmounts = listOf(current.result)
                    )
                }
            }
            if (current.expression.isEmpty()) {
                return@update current.copy(expression = "${CalculatorEngine.OP_SQRT} ", checkIndex = null)
            }
            if (endsWithOperator(current.expression)) {
                val newExpr = "${current.expression} ${CalculatorEngine.OP_SQRT} "
                return@update current.copy(
                    expression = newExpr,
                    storedAmounts = CalculatorEngine.extractAmounts(newExpr),
                    checkIndex = null
                )
            }
            val token = getCurrentNumberToken(current.expression)
            if (token.isNotEmpty()) {
                val num = token.toDoubleOrNull()
                if (num != null && num >= 0) {
                    val sqrtVal = kotlin.math.sqrt(num)
                    val prefix = current.expression.dropLast(token.length)
                    val updatedExpr = "$prefix${CalculatorEngine.OP_SQRT} $token"
                    return@update current.copy(
                        expression = updatedExpr,
                        result = CalculatorEngine.formatNumber(sqrtVal),
                        storedAmounts = CalculatorEngine.extractAmounts(updatedExpr),
                        checkIndex = null,
                        checkStatus = null
                    )
                }
            }
            val newExpr = "${CalculatorEngine.OP_SQRT} ${current.expression}"
            current.copy(
                expression = newExpr,
                storedAmounts = CalculatorEngine.extractAmounts(newExpr),
                checkIndex = null
            )
        }
    }

    fun onDelete() {
        _uiState.update { current ->
            if (current.error != null) {
                return@update CalculatorUiState()
            }
            if (current.expression.isEmpty()) return@update CalculatorUiState()

            var newExpr = current.expression.trimEnd()
            if (newExpr.isNotEmpty()) {
                newExpr = newExpr.dropLast(1).trimEnd()
            }

            if (newExpr.isEmpty()) {
                CalculatorUiState()
            } else {
                val live = CalculatorEngine.evaluate(newExpr)
                current.copy(
                    expression = newExpr,
                    result = if (live.isError) current.result else live.result,
                    storedAmounts = CalculatorEngine.extractAmounts(newExpr),
                    checkIndex = null,
                    isEvaluated = false,
                    checkStatus = null
                )
            }
        }
    }

    fun onClear() {
        _uiState.value = CalculatorUiState()
    }

    fun onEquals() {
        _uiState.update { current ->
            if (current.error != null) return@update current
            var expr = current.expression.trim()
            while (endsWithOperator(expr)) {
                expr = expr.dropLast(1).trimEnd()
            }
            if (expr.isEmpty()) return@update current

            val eval = CalculatorEngine.evaluate(expr)
            val amounts = if (current.storedAmounts.isNotEmpty()) current.storedAmounts else CalculatorEngine.extractAmounts(expr)
            if (eval.isError) {
                current.copy(
                    expression = expr,
                    result = "Error",
                    error = "Error",
                    storedAmounts = amounts,
                    checkIndex = null,
                    isEvaluated = true,
                    checkStatus = null
                )
            } else {
                current.copy(
                    expression = expr,
                    result = eval.result,
                    error = null,
                    storedAmounts = amounts,
                    checkIndex = null,
                    isEvaluated = true,
                    checkStatus = null
                )
            }
        }
    }

    fun onCheck() {
        _uiState.update { current ->
            if (current.error != null) return@update current

            val amounts = if (current.storedAmounts.isNotEmpty()) {
                current.storedAmounts
            } else {
                CalculatorEngine.extractAmounts(current.expression)
            }

            if (amounts.isEmpty()) {
                return@update current.copy(
                    checkIndex = null,
                    checkStatus = CheckStatus(
                        CheckType.INCOMPLETE,
                        "No amounts entered to check."
                    )
                )
            }

            var nextIndex = 0
            if (current.checkIndex != null) {
                if (current.checkIndex < amounts.size - 1) {
                    nextIndex = current.checkIndex + 1
                } else {
                    // Keep showing last amount and counter (e.g. 30 and 3/3)
                    nextIndex = amounts.size - 1
                }
            }

            current.copy(
                storedAmounts = amounts,
                checkIndex = nextIndex,
                result = amounts[nextIndex],
                checkStatus = null
            )
        }
    }

    private fun endsWithOperator(expr: String): Boolean {
        val trimmed = expr.trim()
        if (trimmed.isEmpty()) return false
        val last = trimmed.takeLast(1)
        return CalculatorEngine.isOperator(last)
    }

    private fun getCurrentNumberToken(expr: String): String {
        val sb = StringBuilder()
        for (i in expr.length - 1 downTo 0) {
            val ch = expr[i]
            if (ch in '0'..'9' || ch == '.') {
                sb.insert(0, ch)
            } else {
                break
            }
        }
        return sb.toString()
    }
}
