import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// A Scaffold replacement that renders a rich gradient background
/// with decorative colorful pattern orbs for a modern, vibrant look.
/// All child content floats above the gradient.
class GradientScaffold extends StatelessWidget {
  final Widget body;
  final PreferredSizeWidget? appBar;
  final Widget? floatingActionButton;
  final Widget? bottomNavigationBar;
  final FloatingActionButtonLocation? floatingActionButtonLocation;
  final bool showOrbs;
  final LinearGradient? gradient;
  final bool extendBodyBehindAppBar;

  const GradientScaffold({
    super.key,
    required this.body,
    this.appBar,
    this.floatingActionButton,
    this.bottomNavigationBar,
    this.floatingActionButtonLocation,
    this.showOrbs = true,
    this.gradient,
    this.extendBodyBehindAppBar = false,
  });

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Container(
      // The background gradient now wraps the entire Scaffold
      decoration: BoxDecoration(
        color: AppColors.backgroundDark,
        gradient: gradient ?? AppColors.backgroundGradient,
      ),
      child: Stack(
        children: [
          // Cyber pattern orbs for depth
          if (showOrbs) ...[
            // Large top-right indigo orb
            Positioned(
              top: -60,
              right: -60,
              child: Container(
                width: 320,
                height: 320,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppColors.primary.withValues(alpha: 0.15),
                      AppColors.primary.withValues(alpha: 0.05),
                      Colors.transparent,
                    ],
                    stops: const [0.0, 0.5, 1.0],
                  ),
                ),
              ),
            ),

            // Large bottom-left cyan orb
            Positioned(
              bottom: -40,
              left: -80,
              child: Container(
                width: 360,
                height: 360,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppColors.secondary.withValues(alpha: 0.12),
                      AppColors.secondary.withValues(alpha: 0.03),
                      Colors.transparent,
                    ],
                    stops: const [0.0, 0.5, 1.0],
                  ),
                ),
              ),
            ),

            // Mid-right violet orb
            Positioned(
              top: size.height * 0.35,
              right: -40,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppColors.accent4.withValues(alpha: 0.10),
                      Colors.transparent,
                    ],
                    stops: const [0.0, 1.0],
                  ),
                ),
              ),
            ),
            
            // Top-left emerald/cyan wash
            Positioned(
              top: size.height * 0.15,
              left: -40,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppColors.accent3.withValues(alpha: 0.08),
                      Colors.transparent,
                    ],
                    stops: const [0.0, 1.0],
                  ),
                ),
              ),
            ),
          ],

          // Scaffold Content
          Scaffold(
            // Scaffold is fully transparent so the orbs/gradient show through
            backgroundColor: Colors.transparent, 
            extendBodyBehindAppBar: extendBodyBehindAppBar, 
            appBar: appBar,
            floatingActionButton: floatingActionButton,
            floatingActionButtonLocation: floatingActionButtonLocation,
            bottomNavigationBar: bottomNavigationBar,
            extendBody: true, // Let bottom nav bar blend
            body: body,
          ),
        ],
      ),
    );
  }
}