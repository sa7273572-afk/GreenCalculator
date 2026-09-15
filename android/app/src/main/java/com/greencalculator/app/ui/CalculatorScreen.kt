package com.greencalculator.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.greencalculator.app.*
import com.greencalculator.app.ui.theme.*

@Composable
fun CalculatorScreen(
    viewModel: CalculatorViewModel = androidx.lifecycle.viewmodel.compose.viewModel(),
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(SurfaceDark)
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // App header title
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "GREEN CALCULATOR",
                color = DisplayHistoryGreen,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.5.sp
            )
            Text(
                text = "OFFLINE MODE",
                color = Color(0xFF10B981),
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold
            )
        }

        // 1. DISPLAY AREA - Dark Green Theme
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .clip(RoundedCornerShape(16.dp))
                .background(DarkGreenDisplayBg)
                .padding(horizontal = 20.dp, vertical = 16.dp)
        ) {
            val isChecking = state.checkIndex != null && state.storedAmounts.isNotEmpty()
            val amountCount = state.storedAmounts.size

            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Top row of display: Status notification on left, Amount Counter on top-right
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (state.checkStatus != null) {
                        val statusColor = when (state.checkStatus?.type) {
                            CheckType.VALID -> Color(0xFF10B981)
                            CheckType.INCOMPLETE -> Color(0xFFFBBF24)
                            CheckType.ERROR -> Color(0xFFEF4444)
                            else -> Color.White
                        }
                        Text(
                            text = state.checkStatus?.message ?: "",
                            color = statusColor,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f, fill = false)
                        )
                    } else if (isChecking) {
                        Text(
                            text = "CHECK MODE",
                            color = Color(0xFF34D399),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                    } else {
                        Spacer(modifier = Modifier.width(1.dp))
                    }

                    // Small subtle amount counter in top-right corner
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = if (isChecking) Color(0xFF064E3B) else Color(0xFF0A291B),
                        tonalElevation = 1.dp
                    ) {
                        Text(
                            text = if (isChecking) {
                                "${(state.checkIndex ?: 0) + 1}/$amountCount"
                            } else if (amountCount > 0) {
                                "Amounts: $amountCount"
                            } else {
                                "Amounts: 0"
                            },
                            color = if (isChecking) Color(0xFFA7F3D0) else if (amountCount > 0) Color(0xFF6EE7B7) else Color(0xFF059669).copy(alpha = 0.6f),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            fontFamily = FontFamily.Monospace,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }

                // Expression & Result readout
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.End
                ) {
                    // Expression line (in check mode: shows "Amount X", not full expression)
                    val expressionText = if (isChecking) {
                        "Amount ${(state.checkIndex ?: 0) + 1}"
                    } else if (state.expression.isEmpty()) {
                        "0"
                    } else {
                        state.expression
                    }

                    Text(
                        text = expressionText,
                        color = if (isChecking) Color(0xFF34D399) else if (state.isEvaluated) DisplayHistoryGreen.copy(alpha = 0.7f) else DisplayPrimaryText,
                        fontSize = if (isChecking) 18.sp else if (expressionText.length > 15) 20.sp else 28.sp,
                        fontWeight = if (isChecking) FontWeight.SemiBold else FontWeight.Normal,
                        fontFamily = FontFamily.Monospace,
                        textAlign = TextAlign.End,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        lineHeight = 32.sp
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Result line
                    Text(
                        text = state.result,
                        color = if (state.result == "Error") Color(0xFFF87171) else DisplayResultGreen,
                        fontSize = if (state.result.length > 10) 36.sp else 48.sp,
                        fontWeight = FontWeight.SemiBold,
                        fontFamily = FontFamily.Monospace,
                        textAlign = TextAlign.End,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }

        // Action Row: CLEAR and CHECK
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            CalculatorButton(
                label = "CLEAR",
                bgColor = ClearButtonBg,
                textColor = ClearButtonText,
                modifier = Modifier.weight(1f),
                onClick = { viewModel.onClear() }
            )
            CalculatorButton(
                label = "CHECK",
                bgColor = CheckButtonBg,
                textColor = CheckButtonText,
                modifier = Modifier.weight(1f),
                onClick = { viewModel.onCheck() }
            )
        }

        // 2. MAIN KEYPAD & RIGHT OPERATOR COLUMN
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Row 1: %  √  Delete  |  ÷
            Row(
                modifier = Modifier.fillMaxWidth().height(68.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                CalculatorButton(
                    label = "%",
                    bgColor = SpecialButtonBg,
                    textColor = SpecialButtonText,
                    modifier = Modifier.weight(1f),
                    onClick = { viewModel.onPercent() }
                )
                CalculatorButton(
                    label = "√",
                    bgColor = SpecialButtonBg,
                    textColor = SpecialButtonText,
                    modifier = Modifier.weight(1f),
                    onClick = { viewModel.onSqrt() }
                )
                CalculatorButton(
                    label = "⌫",
                    bgColor = SpecialButtonBg,
                    textColor = SpecialButtonText,
                    modifier = Modifier.weight(1f),
                    onClick = { viewModel.onDelete() }
                )
                CalculatorButton(
                    label = "÷",
                    bgColor = OperatorButtonBg,
                    textColor = OperatorButtonText,
                    modifier = Modifier.weight(1f),
                    onClick = { viewModel.onOperator(CalculatorEngine.OP_DIV) }
                )
            }

            // Row 2: 7  8  9  |  ×
            Row(
                modifier = Modifier.fillMaxWidth().height(68.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                CalculatorButton(label = "7", modifier = Modifier.weight(1f)) { viewModel.onDigit("7") }
                CalculatorButton(label = "8", modifier = Modifier.weight(1f)) { viewModel.onDigit("8") }
                CalculatorButton(label = "9", modifier = Modifier.weight(1f)) { viewModel.onDigit("9") }
                CalculatorButton(
                    label = "×",
                    bgColor = OperatorButtonBg,
                    textColor = OperatorButtonText,
                    modifier = Modifier.weight(1f),
                    onClick = { viewModel.onOperator(CalculatorEngine.OP_MUL) }
                )
            }

            // Row 3: 4  5  6  |  −
            Row(
                modifier = Modifier.fillMaxWidth().height(68.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                CalculatorButton(label = "4", modifier = Modifier.weight(1f)) { viewModel.onDigit("4") }
                CalculatorButton(label = "5", modifier = Modifier.weight(1f)) { viewModel.onDigit("5") }
                CalculatorButton(label = "6", modifier = Modifier.weight(1f)) { viewModel.onDigit("6") }
                CalculatorButton(
                    label = "−",
                    bgColor = OperatorButtonBg,
                    textColor = OperatorButtonText,
                    modifier = Modifier.weight(1f),
                    onClick = { viewModel.onOperator(CalculatorEngine.OP_SUB) }
                )
            }

            // Row 4: 1  2  3  |  +
            Row(
                modifier = Modifier.fillMaxWidth().height(68.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                CalculatorButton(label = "1", modifier = Modifier.weight(1f)) { viewModel.onDigit("1") }
                CalculatorButton(label = "2", modifier = Modifier.weight(1f)) { viewModel.onDigit("2") }
                CalculatorButton(label = "3", modifier = Modifier.weight(1f)) { viewModel.onDigit("3") }
                CalculatorButton(
                    label = "+",
                    bgColor = OperatorButtonBg,
                    textColor = OperatorButtonText,
                    modifier = Modifier.weight(1f),
                    onClick = { viewModel.onOperator(CalculatorEngine.OP_ADD) }
                )
            }

            // Row 5: 00  0  .  |  =
            Row(
                modifier = Modifier.fillMaxWidth().height(68.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                CalculatorButton(label = "00", modifier = Modifier.weight(1f)) { viewModel.onDoubleZero() }
                CalculatorButton(label = "0", modifier = Modifier.weight(1f)) { viewModel.onDigit("0") }
                CalculatorButton(label = ".", modifier = Modifier.weight(1f)) { viewModel.onDecimal() }
                CalculatorButton(
                    label = "=",
                    bgColor = Color(0xFF10B981),
                    textColor = Color.White,
                    modifier = Modifier.weight(1f),
                    onClick = { viewModel.onEquals() }
                )
            }
        }
    }
}

@Composable
fun CalculatorButton(
    label: String,
    modifier: Modifier = Modifier,
    bgColor: Color = NumberButtonBg,
    textColor: Color = NumberButtonText,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = modifier.fillMaxHeight(),
        shape = RoundedCornerShape(14.dp),
        color = bgColor,
        tonalElevation = 2.dp,
        shadowElevation = 1.dp
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = label,
                color = textColor,
                fontSize = if (label.length > 2) 16.sp else 24.sp,
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center
            )
        }
    }
}
