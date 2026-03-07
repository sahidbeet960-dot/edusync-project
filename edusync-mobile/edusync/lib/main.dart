import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// Theme & Router Imports
import 'core/router/app_router.dart';
import 'core/theme/app_themes.dart';
import 'core/providers/theme_provider.dart'; // Ensure this matches your file path

// ViewModel / Provider Imports
import 'features/auth/viewmodels/auth_viewmodel.dart';
import 'features/home/viewmodels/home_viewmodel.dart';
import 'features/dashboard/viewmodels/dashboard_viewmodel.dart';
import 'features/materials/viewmodels/materials_viewmodel.dart';
import 'features/calendar/viewmodels/calendar_viewmodel.dart';
import 'features/forum/viewmodels/forum_viewmodel.dart';
import 'features/study_room/viewmodels/study_room_viewmodel.dart';
import 'features/ai_hub/viewmodels/ai_hub_viewmodel.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthViewModel()),
        ChangeNotifierProvider(create: (_) => HomeViewModel()),
        ChangeNotifierProvider(create: (_) => DashboardViewModel()),
        ChangeNotifierProvider(create: (_) => MaterialsViewModel()),
        ChangeNotifierProvider(create: (_) => CalendarViewModel()),
        ChangeNotifierProvider(create: (_) => ForumViewModel()),
        ChangeNotifierProvider(create: (_) => StudyRoomViewModel()),
        ChangeNotifierProvider(create: (_) => AiHubViewModel()),
      ],
      child: const EduSyncApp(),
    ),
  );
}

class EduSyncApp extends StatelessWidget {
  const EduSyncApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Listen to the current theme mode from ThemeProvider
    final themeProvider = context.watch<ThemeProvider>();
    
    // Listen to Auth state to provide it to the router for redirects
    final authVM = context.watch<AuthViewModel>();

    return MaterialApp.router(
      title: 'EduSync',
      debugShowCheckedModeBanner: false,
      
      themeMode: themeProvider.themeMode,
      theme: AppTheme.darkTheme,
      
      routerConfig: AppRouter.router(authVM),
    );
  }
}