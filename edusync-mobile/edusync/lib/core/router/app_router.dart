import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/viewmodels/auth_viewmodel.dart';
import '../../features/auth/views/login_screen.dart';
import '../../features/home/views/home_screen.dart';


import '../../features/profile/views/profile_screen.dart';
import '../../features/ai_hub/views/ai_hub_screen.dart';
import '../../features/ai_hub/views/ai_chat_screen.dart';
import '../../features/ai_hub/views/ai_infographs_screen.dart';
import '../../features/ai_hub/views/ai_summary_screen.dart';
import '../../features/ai_hub/views/ai_pyq_screen.dart';

class AppRouter {
  static GoRouter? _router;

  static GoRouter router(AuthViewModel authVM) {
    _router ??= GoRouter(
      initialLocation: '/',
      refreshListenable: authVM,
      redirect: (context, state) {
        final authState = authVM.state;
        final isLoggingIn = state.matchedLocation == '/login';
        final isSplash = state.matchedLocation == '/splash';

        if (authState == AuthState.initial) {
          return '/splash';
        }
        final isLoggedIn = authVM.isAuthenticated;
        if (!isLoggedIn && !isLoggingIn) return '/login';
        if (isLoggedIn && (isLoggingIn || isSplash)) return '/';
        
        return null;
      },
      routes: [
        GoRoute(
          path: '/splash',
          builder: (context, state) => const _SplashScreen(),
        ),
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/',
          builder: (context, state) => const HomeScreen(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfileScreen(),
        ),
        GoRoute(
          path: '/ai',
          builder: (context, state) => const AiHubScreen(),
        ),
        GoRoute(
          path: '/ai/chat',
          builder: (context, state) => const AiChatScreen(),
        ),
        GoRoute(
          path: '/ai/infographs',
          builder: (context, state) => const AiInfographsScreen(),
        ),
        GoRoute(
          path: '/ai/summary',
          builder: (context, state) => const AiSummaryScreen(),
        ),
        GoRoute(
          path: '/ai/pyqs',
          builder: (context, state) => const AiPyqScreen(),
        ),
      ],
    );
    return _router!;
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFF0F172A), // AppColors.backgroundDark
      body: Center(
        child: CircularProgressIndicator(
          color: Color(0xFF6366F1), // AppColors.primary
        ),
      ),
    );
  }
}
