package com.greencalculator.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = OperatorButtonBg,
    onPrimary = Color.White,
    primaryContainer = SpecialButtonBg,
    onPrimaryContainer = SpecialButtonText,
    secondary = DisplayResultGreen,
    onSecondary = DarkGreenDisplayBg,
    background = SurfaceDark,
    onBackground = DisplayPrimaryText,
    surface = KeypadBackground,
    onSurface = NumberButtonText
)

@Composable
fun GreenCalculatorTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
