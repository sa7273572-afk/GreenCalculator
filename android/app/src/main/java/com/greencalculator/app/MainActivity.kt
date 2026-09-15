package com.greencalculator.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.greencalculator.app.ui.CalculatorScreen
import com.greencalculator.app.ui.theme.GreenCalculatorTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            GreenCalculatorTheme {
                CalculatorScreen()
            }
        }
    }
}
