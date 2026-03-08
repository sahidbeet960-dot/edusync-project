import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/gradient_scaffold.dart';

class AiHubScreen extends StatelessWidget {
  const AiHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GradientScaffold(
      appBar: AppBar(
        title: const Text('AI Hub', style: TextStyle(fontWeight: FontWeight.w800)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Supercharge your learning',
                style: AppTextStyles.headlineMedium.copyWith(
                  color: AppColors.textPrimaryDark,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Unlock tailored insights and converse with your documents.',
                style: AppTextStyles.bodyLarge.copyWith(
                  color: AppColors.textSecondaryDark,
                ),
              ),
              const SizedBox(height: 32),
              Expanded(
                child: ListView(
                  physics: const BouncingScrollPhysics(),
                  children: [
                    _FeatureCard(
                      title: 'Chat with Documents',
                      description: 'Upload PDFs and get instant answers, summaries, and explanations.',
                      lottiePath: 'assets/animations/Learning.json',
                      gradient: const LinearGradient(
                        colors: [Color(0xFF6C63FF), Color(0xFF4C1D95)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      icon: Icons.chat_bubble_rounded,
                      onTap: () {
                        HapticFeedback.lightImpact();
                        context.push('/ai/chat');
                      },
                    ),
                    const SizedBox(height: 24),
                    _FeatureCard(
                      title: 'Document Summarizer',
                      description: 'Instantly generate comprehensive summaries for lengthy reading materials.',
                      lottiePath: 'assets/animations/Ask.json',
                      gradient: const LinearGradient(
                        colors: [Color(0xFF3B82F6), Color(0xFF1E3A8A)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      icon: Icons.auto_awesome_motion_rounded,
                      onTap: () {
                        HapticFeedback.lightImpact();
                        context.push('/ai/summary');
                      },
                    ),
                    const SizedBox(height: 24),
                    _FeatureCard(
                      title: 'PYQ Analyzer',
                      description: 'AI-driven probability mapping of previous year topics.',
                      lottiePath: 'assets/animations/Ask.json', // Using ask here for visual variety
                      gradient: const LinearGradient(
                        colors: [Color(0xFFE11D48), Color(0xFF9F1239)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      icon: Icons.track_changes_rounded,
                      onTap: () {
                        HapticFeedback.lightImpact();
                        context.push('/ai/pyqs');
                      },
                    ),
                    const SizedBox(height: 24),
                    _FeatureCard(
                      title: 'Exam Infographs',
                      description: 'Analyze past papers to reveal frequently tested topics and weightage.',
                      lottiePath: 'assets/animations/loading.json',
                      gradient: const LinearGradient(
                        colors: [Color(0xFF10B981), Color(0xFF064E3B)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      icon: Icons.pie_chart_rounded,
                      onTap: () {
                        HapticFeedback.lightImpact();
                        context.push('/ai/infographs');
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final String title;
  final String description;
  final String lottiePath;
  final LinearGradient gradient;
  final IconData icon;
  final VoidCallback onTap;

  const _FeatureCard({
    required this.title,
    required this.description,
    required this.lottiePath,
    required this.gradient,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 220,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(32),
          gradient: gradient,
          boxShadow: [
            BoxShadow(
              color: gradient.colors.first.withValues(alpha: 0.3),
              blurRadius: 24,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Stack(
          children: [
            // Background Animation (clipped)
            Positioned(
              right: -40,
              bottom: -20,
              child: Opacity(
                opacity: 0.8,
                child: SizedBox(
                  width: 200,
                  height: 200,
                  child: Lottie.asset(
                    lottiePath,
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) => const SizedBox(),
                  ),
                ),
              ),
            ),
            
            // Content
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, color: Colors.white, size: 28),
                  ),
                  const Spacer(),
                  Text(
                    title,
                    style: AppTextStyles.titleLarge.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.55,
                    child: Text(
                      description,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: Colors.white.withValues(alpha: 0.9),
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
