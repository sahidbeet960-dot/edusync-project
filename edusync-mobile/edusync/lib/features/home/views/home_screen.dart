import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../dashboard/views/dashboard_screen.dart';
import '../../calendar/views/calendar_screen.dart';
import '../../materials/views/materials_screen.dart';
import '../../forum/views/forum_screen.dart';
import '../../study_room/views/study_rooms_screen.dart';
import '../viewmodels/home_viewmodel.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late PageController _pageController;

  static const _screens = [
    DashboardScreen(),
    CalendarScreen(),
    MaterialsScreen(),
    ForumScreen(),
    StudyRoomsScreen(),
  ];

  @override
  void initState() {
    super.initState();
    final initialIndex = context.read<HomeViewModel>().currentIndex;
    _pageController = PageController(initialPage: initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onPageChanged(int index) {
    context.read<HomeViewModel>().setIndex(index);
  }

  void _onNavItemTapped(int index) {
    HapticFeedback.lightImpact(); // Premium tactile feel
    context.read<HomeViewModel>().setIndex(index);
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeOutCubic, // Modern swift animation
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<HomeViewModel>(
      builder: (context, homeVM, _) {
        if (_pageController.hasClients) {
          final currentPage = _pageController.page?.round() ?? 0;
          if (currentPage != homeVM.currentIndex) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (_pageController.hasClients) {
                _pageController.animateToPage(
                  homeVM.currentIndex,
                  duration: const Duration(milliseconds: 400),
                  curve: Curves.easeOutCubic,
                );
              }
            });
          }
        }

        return Scaffold(
          extendBody: true, // Crucial for floating dock
          body: PageView(
            controller: _pageController,
            onPageChanged: _onPageChanged,
            physics: const BouncingScrollPhysics(),
            children: _screens,
          ),
          bottomNavigationBar: _buildFloatingDock(homeVM.currentIndex),
        );
      },
    );
  }

  Widget _buildFloatingDock(int currentIndex) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.only(left: 24, right: 24, bottom: 16),
        child: Container(
          height: 72,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(36),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.15),
                blurRadius: 30,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(36),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.75),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.5),
                    width: 1.5,
                  ),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildDockItem(0, Icons.dashboard_rounded, 'Home', currentIndex),
                    _buildDockItem(1, Icons.calendar_month_rounded, 'Plan', currentIndex),
                    _buildDockItem(2, Icons.folder_rounded, 'Files', currentIndex),
                    _buildDockItem(3, Icons.forum_rounded, 'Ask', currentIndex),
                    _buildDockItem(4, Icons.groups_rounded, 'Focus', currentIndex),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDockItem(int index, IconData icon, String label, int currentIndex) {
    final isSelected = index == currentIndex;

    return GestureDetector(
      onTap: () => _onNavItemTapped(index),
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 56,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOutBack,
              transform: Matrix4.diagonal3Values(isSelected ? 1.15 : 1.0, isSelected ? 1.15 : 1.0, 1.0),
              child: Icon(
                icon,
                color: isSelected ? AppColors.primary : AppColors.textSecondaryDark.withValues(alpha: 0.6),
                size: 26,
              ),
            ),
            const SizedBox(height: 6),
            // Animated active indicator dot
            AnimatedOpacity(
              duration: const Duration(milliseconds: 200),
              opacity: isSelected ? 1.0 : 0.0,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeOutCubic,
                width: isSelected ? 16 : 4,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}