import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// Screens
import 'package:edusync/features/auth/view/login_screen.dart';

// Providers & ViewModels
import 'package:edusync/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:edusync/core/providers/theme_provider.dart';

// Theme
import 'package:edusync/core/theme/app_themes.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthViewModel()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: const EduSyncApp(),
    ),
  );
}

class EduSyncApp extends StatelessWidget {
  const EduSyncApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return MaterialApp(
          title: 'EduSync',
          debugShowCheckedModeBanner: false,
          themeMode: themeProvider.themeMode,
          theme: AppTheme.darkTheme, 
          darkTheme: AppTheme.darkTheme, 
          home: const LoginScreen(),
        );
      },
    );
  }
}