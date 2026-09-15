package com.greencalculator.app

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class CalculatorEngineTest {

    @Test
    fun testAddition() {
        assertEquals("20", CalculatorEngine.evaluate("12 + 8").result)
    }

    @Test
    fun testSubtraction() {
        assertEquals("15", CalculatorEngine.evaluate("20 − 5").result)
    }

    @Test
    fun testMultiplication() {
        assertEquals("42", CalculatorEngine.evaluate("6 × 7").result)
    }

    @Test
    fun testDivision() {
        assertEquals("25", CalculatorEngine.evaluate("100 ÷ 4").result)
    }

    @Test
    fun testOperatorPrecedence() {
        assertEquals("20", CalculatorEngine.evaluate("10 + 5 × 2").result)
    }

    @Test
    fun testPercentage() {
        assertEquals("0.25", CalculatorEngine.evaluate("25 %").result)
    }

    @Test
    fun testSquareRoot() {
        assertEquals("9", CalculatorEngine.evaluate("√ 81").result)
    }

    @Test
    fun testDecimals() {
        assertEquals("15", CalculatorEngine.evaluate("12.5 + 2.5").result)
    }

    @Test
    fun testDivisionByZero() {
        val result = CalculatorEngine.evaluate("1000 ÷ 0")
        assertEquals("Error", result.result)
        assertTrue(result.isError)
    }
}
