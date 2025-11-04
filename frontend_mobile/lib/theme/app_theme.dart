import 'package:flutter/material.dart';

/// IntelliBrief App Theme
/// Matches the updated webapp's warm, elegant newspaper-style design
class AppTheme {
  // Primary Colors (Updated to match webapp)
  static const Color warmBeige = Color(0xFFF4F1EA); // Warm beige - backgrounds, cards
  static const Color darkGray = Color(0xFF4B4B4B); // Dark gray - buttons
  static const Color darkText = Color(0xFF1A1A1A); // Primary text
  static const Color mutedTan = Color(0xFFBFB8A9); // Input borders
  static const Color lightTan = Color(0xFFD8D2C4); // Dividers
  static const Color offWhite = Color(0xFFFFFDFA); // Content backgrounds
  static const Color black = Color(0xFF000000); // Button hover/emphasis

  // Border Radius values
  static const double radiusLarge = 8.0; // For cards
  static const double radiusMedium = 6.0; // For panels
  static const double radiusSmall = 4.0; // For inputs/buttons

  // Spacing values
  static const double spacingXSmall = 8.0;
  static const double spacingSmall = 12.0;
  static const double spacingMedium = 16.0;
  static const double spacingLarge = 24.0;
  static const double spacingXLarge = 32.0;

  // Padding values
  static const double paddingCard = 32.0; // 2rem
  static const double paddingPage = 24.0; // 1.5rem
  static const double paddingInput = 14.4; // 0.9rem

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,

      // Color Scheme
      colorScheme: const ColorScheme.light(
        primary: darkGray,
        secondary: warmBeige,
        surface: warmBeige,
        background: offWhite,
        error: Colors.red,
        onPrimary: offWhite,
        onSecondary: darkText,
        onSurface: darkText,
        onBackground: darkText,
      ),

      // Scaffold Background
      scaffoldBackgroundColor: offWhite,

      // AppBar Theme
      appBarTheme: const AppBarTheme(
        backgroundColor: warmBeige,
        foregroundColor: darkText,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w600,
          color: darkText,
          fontFamily: 'Georgia',
          letterSpacing: 0.6,
        ),
      ),

      // Card Theme
      cardTheme: CardThemeData(
        color: warmBeige,
        elevation: 8,
        shadowColor: Colors.black.withValues(alpha: 0.15),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusLarge),
        ),
      ),

      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: offWhite,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: paddingInput,
          vertical: paddingInput,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusSmall),
          borderSide: const BorderSide(
            color: mutedTan,
            width: 1.5,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusSmall),
          borderSide: const BorderSide(
            color: mutedTan,
            width: 1.5,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusSmall),
          borderSide: const BorderSide(
            color: darkText,
            width: 1.5,
          ),
        ),
        hintStyle: const TextStyle(
          color: mutedTan,
          fontSize: 16,
          fontFamily: 'Georgia',
        ),
        labelStyle: const TextStyle(
          color: darkText,
          fontSize: 16,
          fontFamily: 'Georgia',
        ),
      ),

      // Elevated Button Theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: darkGray,
          foregroundColor: offWhite,
          padding: const EdgeInsets.symmetric(
            horizontal: paddingInput,
            vertical: paddingInput,
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            fontFamily: 'Georgia',
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusSmall),
          ),
        ).copyWith(
          backgroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.hovered)) {
              return black;
            }
            if (states.contains(WidgetState.disabled)) {
              return mutedTan;
            }
            return darkGray;
          }),
        ),
      ),

      // Text Button Theme (for links)
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: darkGray,
          textStyle: const TextStyle(
            fontSize: 16,
            decoration: TextDecoration.underline,
            fontFamily: 'Georgia',
          ),
        ),
      ),

      // Typography
      textTheme: const TextTheme(
        // Page Title
        displayLarge: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w600,
          color: darkText,
          fontFamily: 'Georgia',
          letterSpacing: 0.6,
        ),
        // Section Heading
        displayMedium: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          color: darkText,
          fontFamily: 'Georgia',
        ),
        // Small Heading
        displaySmall: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: darkText,
          fontFamily: 'Georgia',
        ),
        // Regular text
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: darkText,
          fontFamily: 'Georgia',
        ),
        bodyMedium: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: darkText,
          fontFamily: 'Georgia',
        ),
        // Small text
        bodySmall: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: darkText,
          fontFamily: 'Georgia',
        ),
        // Question labels
        titleMedium: TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w500,
          color: darkText,
          fontFamily: 'Georgia',
          letterSpacing: 0.2,
        ),
        // Button text
        labelLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          fontFamily: 'Georgia',
        ),
      ),

      // Font Family
      fontFamily: 'Georgia',
    );
  }
}
