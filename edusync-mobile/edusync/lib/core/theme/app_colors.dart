import 'package:flutter/material.dart';

class AppColors {
  AppColors._();


  static const Color backgroundDark = Color(0xFF0B1120); // Deep dark navy
  static const Color surfaceDark = Color(0xFF131B2F); // Slightly lighter for cards
  static const Color cardDark = Color(0xFF192236); // Elevated elements
  

  static const Color primary = Color(0xFF6366F1); // Indigo
  static const Color primaryLight = Color(0xFF818CF8);
  static const Color primaryDark = Color(0xFF4F46E5);


  static const Color secondary = Color(0xFF06B6D4); // Cyan
  static const Color secondaryLight = Color(0xFF22D3EE);
  static const Color secondaryDark = Color(0xFF0891B2);


  static const Color accent1 = Color(0xFFF43F5E); // Rose
  static const Color accent2 = Color(0xFFF59E0B); // Amber
  static const Color accent3 = Color(0xFF10B981); // Emerald
  static const Color accent4 = Color(0xFF8B5CF6); // Violet


  static const Color textPrimaryDark = Color(0xFFF8FAFC); // Off-white
  static const Color textSecondaryDark = Color(0xFF94A3B8); // Slate 400


  static const Color success = Color(0xFF10B981); // Emerald
  static const Color warning = Color(0xFFF59E0B); // Amber
  static const Color error = Color(0xFFEF4444); // Red
  static const Color info = Color(0xFF3B82F6); // Blue


  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF6366F1), Color(0xFF06B6D4)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [Color(0xFF8B5CF6), Color(0xFFEC4899)], // Purple to Pink
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient warmGradient = LinearGradient(
    colors: [Color(0xFFF59E0B), Color(0xFFF43F5E)], // Amber to Rose
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );


  static const LinearGradient backgroundGradient = LinearGradient(
    colors: [Color(0xFF0B1120), Color(0xFF131B2F)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
  
  static const LinearGradient patternGradient1 = primaryGradient;
  static const LinearGradient patternGradient2 = accentGradient;
  static const LinearGradient patternGradient3 = warmGradient;

  static Color glassWhite = Colors.white.withValues(alpha: 0.05); 
  static Color glassBorder = Colors.white.withValues(alpha: 0.1); 
  static Color glassHighlight = Colors.white.withValues(alpha: 0.15); 
}