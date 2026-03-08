import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/gradient_scaffold.dart';
import '../viewmodels/quiz_viewmodel.dart';

class QuizScreen extends StatelessWidget {
  const QuizScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GradientScaffold(
      body: SafeArea(
        child: _QuizContent(),
      ),
    );
  }
}

class _QuizContent extends StatelessWidget {
  const _QuizContent();

  @override
  Widget build(BuildContext context) {
    final quizVM = context.watch<QuizViewModel>();

    if (quizVM.isGenerating) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(color: AppColors.primary),
            const SizedBox(height: 24),
            Text(
              'Generating your Quiz...',
              style: AppTextStyles.titleMedium.copyWith(color: AppColors.textPrimaryDark),
            ),
            const SizedBox(height: 8),
            Text(
              'Analyzing document content.',
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondaryDark),
            ),
          ],
        ),
      );
    }

    if (quizVM.state == QuizState.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 64),
              const SizedBox(height: 16),
              Text(
                'Something went wrong',
                style: AppTextStyles.titleLarge.copyWith(color: AppColors.textPrimaryDark),
              ),
              const SizedBox(height: 8),
              Text(
                quizVM.error ?? 'Unknown error',
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondaryDark),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              GradientButton(
                text: 'Go Back',
                gradient: AppColors.primaryGradient,
                onPressed: () {
                  quizVM.reset();
                  context.pop();
                },
              )
            ],
          ),
        ),
      );
    }

    if (!quizVM.isActive || quizVM.questions.isEmpty) {
      return const SizedBox.shrink();
    }

    final currentQuestionIndex = quizVM.currentQuestionIndex;
    final question = quizVM.currentQuestion!;
    final total = quizVM.totalQuestions;
    final progress = (currentQuestionIndex + 1) / total;

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header / Progress
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.close_rounded, color: AppColors.textSecondaryDark),
                onPressed: () {
                  _showExitDialog(context);
                },
              ),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: progress,
                    minHeight: 10,
                    backgroundColor: AppColors.glassBorder,
                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Text(
                '${currentQuestionIndex + 1} / $total',
                style: AppTextStyles.titleMedium.copyWith(
                  color: AppColors.textPrimaryDark,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),

          // Question Card
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceDark,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.glassBorder),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Text(
                      question.question,
                      style: AppTextStyles.titleLarge.copyWith(
                        color: AppColors.textPrimaryDark,
                        height: 1.4,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Options
                  ...question.options.map((option) {
                    final isSelected = quizVM.userAnswers[currentQuestionIndex] == option;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: GestureDetector(
                        onTap: () => quizVM.selectAnswer(option),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.primary.withValues(alpha: 0.1) : AppColors.surfaceDark,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? AppColors.primary : AppColors.glassBorder,
                              width: isSelected ? 2 : 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: isSelected ? AppColors.primary : AppColors.textSecondaryDark.withValues(alpha: 0.5),
                                    width: 2,
                                  ),
                                  color: isSelected ? AppColors.primary : Colors.transparent,
                                ),
                                child: isSelected 
                                    ? const Icon(Icons.check_rounded, color: Colors.white, size: 16)
                                    : null,
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Text(
                                  option,
                                  style: AppTextStyles.bodyMedium.copyWith(
                                    color: isSelected ? AppColors.primary : AppColors.textPrimaryDark,
                                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),

          // Navigation Buttons
          Row(
            children: [
              if (currentQuestionIndex > 0)
                Expanded(
                  child: OutlinedButton(
                    onPressed: quizVM.previousQuestion,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      side: const BorderSide(color: AppColors.primary),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: Text(
                      'Previous',
                      style: AppTextStyles.titleMedium.copyWith(color: AppColors.primary),
                    ),
                  ),
                )
              else 
                 const Spacer(),
                 
              const SizedBox(width: 16),
              
              Expanded(
                flex: 2,
                child: GradientButton(
                  text: currentQuestionIndex == total - 1 ? 'Finish Quiz' : 'Next Question',
                  gradient: currentQuestionIndex == total - 1 ? AppColors.accentGradient : AppColors.primaryGradient,
                  onPressed: () {
                     if (currentQuestionIndex == total - 1) {
                         quizVM.submitQuiz();
                         context.pushReplacement('/quiz-analysis');
                     } else {
                         quizVM.nextQuestion();
                     }
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showExitDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Exit Quiz?'),
        content: const Text('Are you sure you want to end the quiz early? Your progress will be lost.'),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        actions: [
          TextButton(
            onPressed: () => context.pop(),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondaryDark)),
          ),
          TextButton(
            onPressed: () {
              context.pop(); // close dialog
              context.read<QuizViewModel>().reset();
              context.pop(); // close quiz screen
            },
            child: const Text('Exit', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }
}
