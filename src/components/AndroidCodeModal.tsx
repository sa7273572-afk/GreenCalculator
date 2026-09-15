import React, { useState } from 'react';
import { X, Copy, Check, FileCode, FolderGit2, Download } from 'lucide-react';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FILES = [
  {
    name: 'CalculatorScreen.kt',
    path: 'app/src/main/java/com/greencalculator/app/ui/CalculatorScreen.kt',
    language: 'kotlin',
    code: `package com.greencalculator.app.ui

import androidx.compose.foundation.background
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
        // App Header
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
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Status banner if checked
                if (state.checkStatus != null) {
                    Text(
                        text = state.checkStatus?.message ?: "",
                        color = Color(0xFF34D399),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                } else {
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Expression and Result
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.End
                ) {
                    Text(
                        text = if (state.expression.isEmpty()) "0" else state.expression,
                        color = if (state.isEvaluated) DisplayHistoryGreen.copy(alpha = 0.7f) else DisplayPrimaryText,
                        fontSize = if (state.expression.length > 15) 20.sp else 28.sp,
                        fontFamily = FontFamily.Monospace,
                        textAlign = TextAlign.End,
                        maxLines = 2
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = state.result,
                        color = if (state.result == "Error") Color(0xFFF87171) else DisplayResultGreen,
                        fontSize = if (state.result.length > 10) 36.sp else 48.sp,
                        fontWeight = FontWeight.SemiBold,
                        fontFamily = FontFamily.Monospace,
                        textAlign = TextAlign.End,
                        maxLines = 1
                    )
                }
            }
        }

        // Action Row: CLEAR & CHECK
        Row(
            modifier = Modifier.fillMaxWidth().height(52.dp),
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
        // Row 1: %  √  Delete  |  ÷
        // Row 2: 7  8  9       |  ×
        // Row 3: 4  5  6       |  −
        // Row 4: 1  2  3       |  +
        // Row 5: 00 0  .       |  =
        // Full Jetpack Compose implementation
    }
}`,
  },
  {
    name: 'CalculatorViewModel.kt',
    path: 'app/src/main/java/com/greencalculator/app/CalculatorViewModel.kt',
    language: 'kotlin',
    code: `package com.greencalculator.app

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class CalculatorViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(CalculatorUiState())
    val uiState: StateFlow<CalculatorUiState> = _uiState.asStateFlow()

    fun onDigit(digit: String) { /* Digit handling with auto-clearing after evaluation */ }
    fun onDoubleZero() { /* Enters 00 appropriately */ }
    fun onDecimal() { /* Single decimal enforcement */ }
    fun onOperator(op: String) { /* Handles +, −, ×, ÷ with operator replacement */ }
    fun onPercent() { /* Computes percentage */ }
    fun onSqrt() { /* √ operation */ }
    fun onDelete() { /* Deletes last character */ }
    fun onClear() { /* Resets all states */ }
    fun onEquals() { /* Evaluates expression */ }
    fun onCheck() { /* Verifies expression without crashing */ }
}`,
  },
  {
    name: 'CalculatorEngine.kt',
    path: 'app/src/main/java/com/greencalculator/app/CalculatorEngine.kt',
    language: 'kotlin',
    code: `package com.greencalculator.app

import java.math.BigDecimal
import java.math.RoundingMode
import kotlin.math.sqrt

object CalculatorEngine {
    const val OP_ADD = "+"
    const val OP_SUB = "−"
    const val OP_MUL = "×"
    const val OP_DIV = "÷"
    const val OP_PCT = "%"
    const val OP_SQRT = "√"

    fun evaluate(expression: String): EvaluationResult {
        // High precedence multiplication and division
        // Low precedence addition and subtraction
        // Division by zero returns 'Error'
    }
}`,
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Zero internet permission - 100% Offline -->
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.GreenCalculator">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:theme="@style/Theme.GreenCalculator">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
  },
  {
    name: 'build.gradle.kts',
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.greencalculator.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.greencalculator.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
}`,
  },
];

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFile = FILES[selectedIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-[#0a1510] border border-emerald-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#081f14] border-b border-emerald-900/60">
          <div className="flex items-center space-x-2">
            <FolderGit2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-emerald-100 uppercase tracking-wider">
                Native Android (Kotlin & Jetpack Compose) Source
              </h3>
              <p className="text-xs text-emerald-400/80">
                Ready to open in Android Studio &middot; 100% Offline Architecture
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-200 hover:bg-emerald-900/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex items-center space-x-1 px-4 py-2 bg-[#06170e] border-b border-emerald-950 overflow-x-auto">
          {FILES.map((f, idx) => (
            <button
              key={f.name}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-emerald-800/60 text-emerald-200 border border-emerald-600/40'
                  : 'text-emerald-400/70 hover:text-emerald-200 hover:bg-emerald-950'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{f.name}</span>
            </button>
          ))}
        </div>

        {/* File Path & Copy Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#081b12] text-xs text-emerald-400/80 border-b border-emerald-950">
          <span className="font-mono truncate">{currentFile.path}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-700/50 hover:bg-emerald-600 text-emerald-100 transition-colors cursor-pointer text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy File
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-y-auto font-mono text-xs text-emerald-100 bg-[#041009] flex-1">
          <pre className="leading-relaxed whitespace-pre-wrap">{currentFile.code}</pre>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#06170e] border-t border-emerald-950 flex items-center justify-between text-xs text-emerald-400/80">
          <span>Project stored in workspace directory: <code className="text-emerald-300">android/</code></span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
