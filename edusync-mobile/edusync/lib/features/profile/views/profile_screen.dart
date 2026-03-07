import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/glass_card.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/avatar_widget.dart';
import '../../../core/widgets/gradient_scaffold.dart';
import '../../auth/viewmodels/auth_viewmodel.dart';
import 'edit_profile_dialog.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  // --- ADDED: Logout Confirmation Dialog ---
  Future<void> _confirmLogout(BuildContext context, AuthViewModel auth) async {
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.logout_rounded, color: AppColors.error),
            const SizedBox(width: 10),
            Text('Sign Out', style: AppTextStyles.titleMedium.copyWith(color: AppColors.textPrimaryDark)),
          ],
        ),
        content: Text(
          'Are you sure you want to sign out?',
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondaryDark),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondaryDark)),
          ),
          TextButton(
            style: TextButton.styleFrom(
              backgroundColor: AppColors.error.withValues(alpha: 0.1),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Yes, Sign Out', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      auth.logout();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authVM = context.watch<AuthViewModel>();
    final user = authVM.user;

    return GradientScaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              const SizedBox(height: 20),

              // Profile header
              Column(
                children: [
                  AvatarWidget(
                    name: user?.fullName ?? '',
                    size: 80,
                    showBorder: true,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        user?.fullName ?? 'Student',
                        style: AppTextStyles.headlineSmall.copyWith(
                          color: AppColors.textPrimaryDark,
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (user != null)
                        Container(
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.edit,
                                color: AppColors.primary, size: 20),
                            onPressed: () {
                              showDialog(
                                context: context,
                                builder: (_) => EditProfileDialog(user: user),
                              );
                            },
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? '',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.textSecondaryDark,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      (user?.role.name ?? 'student').toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 32),

              // Gamification stats
              Row(
                children: [
                  Expanded(
                    child: GlassCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          const Icon(Icons.upload_file_rounded,
                              color: AppColors.primary, size: 28),
                          const SizedBox(height: 8),
                          Text(
                            '${user?.totalMaterialsUploaded ?? 0}',
                            style: AppTextStyles.titleMedium.copyWith(
                              color: AppColors.textPrimaryDark,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Uploads',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.textSecondaryDark,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GlassCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          const Icon(Icons.help_rounded,
                              color: AppColors.secondary, size: 28),
                          const SizedBox(height: 8),
                          Text(
                            '${user?.totalQuestionsAsked ?? 0}',
                            style: AppTextStyles.titleMedium.copyWith(
                              color: AppColors.textPrimaryDark,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Questions',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.textSecondaryDark,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: GlassCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          const Icon(Icons.verified_rounded,
                              color: AppColors.success, size: 28),
                          const SizedBox(height: 8),
                          Text(
                            '${user?.totalVerifiedAnswers ?? 0}',
                            style: AppTextStyles.titleMedium.copyWith(
                              color: AppColors.textPrimaryDark,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Verified',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.textSecondaryDark,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GlassCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          const Icon(Icons.timer_rounded,
                              color: AppColors.warning, size: 28),
                          const SizedBox(height: 8),
                          Text(
                            '${user?.totalStudyMinutes ?? 0}m',
                            style: AppTextStyles.titleMedium.copyWith(
                              color: AppColors.textPrimaryDark,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Study Time',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.textSecondaryDark,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Menu items
              _buildMenuItem(
                context,
                icon: Icons.smart_toy_rounded,
                label: 'AI Assistant',
                color: AppColors.primary,
                onTap: () => context.push('/ai'),
              ),
              _buildMenuItem(
                context,
                icon: Icons.quiz_rounded,
                label: 'Quiz Generator',
                color: AppColors.warning,
                onTap: () => context.push('/ai-quiz'),
              ),
              _buildMenuItem(
                context,
                icon: Icons.insights_rounded,
                label: 'Study Insights',
                color: AppColors.secondary,
                onTap: () {
                   ScaffoldMessenger.of(context).showSnackBar(
                     const SnackBar(content: Text('Study Insights arriving soon!')),
                   );
                },
              ),
              _buildMenuItem(
                context,
                icon: Icons.settings_rounded,
                label: 'Settings',
                color: AppColors.info,
                onTap: () {
                   ScaffoldMessenger.of(context).showSnackBar(
                     const SnackBar(content: Text('Settings menu is under construction.')),
                   );
                },
              ),
              _buildMenuItem(
                context,
                icon: Icons.help_outline_rounded,
                label: 'Help & Support',
                color: AppColors.textSecondaryDark,
                onTap: () {
                   ScaffoldMessenger.of(context).showSnackBar(
                     const SnackBar(content: Text('Contact support via email at support@edusync.com')),
                   );
                },
              ),

              const SizedBox(height: 24),

              // --- UPDATED: Calls the confirmation dialog instead of immediate logout ---
              GradientButton(
                text: 'Sign Out',
                icon: Icons.logout_rounded,
                gradient: const LinearGradient(
                  colors: [Color(0xFFFF5252), Color(0xFFFF8A80)],
                ),
                onPressed: () => _confirmLogout(context, authVM),
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: GlassCard(
        onTap: onTap,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                label,
                style: AppTextStyles.titleMedium.copyWith(
                  color: AppColors.textPrimaryDark,
                  fontSize: 14,
                ),
              ),
            ),
            const Icon(
              Icons.arrow_forward_ios_rounded,
              color: AppColors.textSecondaryDark,
              size: 14,
            ),
          ],
        ),
      ),
    );
  }
}