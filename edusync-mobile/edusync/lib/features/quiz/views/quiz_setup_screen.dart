import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/gradient_scaffold.dart';
import '../viewmodels/quiz_viewmodel.dart';
import '../../../data/models/material_model.dart';

class QuizSetupScreen extends StatefulWidget {
  final List<MaterialModel> materials;
  
  const QuizSetupScreen({super.key, required this.materials});

  @override
  State<QuizSetupScreen> createState() => _QuizSetupScreenState();
}

class _QuizSetupScreenState extends State<QuizSetupScreen> {
  int _numQuestions = 5;

  Future<void> _startQuiz() async {
    final quizVM = context.read<QuizViewModel>();
    
    // Validate if document urls exist
    final validDocs = widget.materials.where((m) => m.fileUrl.isNotEmpty).toList();
    if (validDocs.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No valid material URLs. Cannot generate quiz.'),
            backgroundColor: AppColors.error,
          ),
        );
        return;
    }
    
    context.push('/quiz');
    await quizVM.generateQuiz(validDocs.map((m) => m.fileUrl).toList(), _numQuestions);
  }

  @override
  Widget build(BuildContext context) {
    return GradientScaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(
          'Quiz Setup',
          style: AppTextStyles.titleLarge.copyWith(
            color: AppColors.textPrimaryDark,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimaryDark, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: AppColors.warmGradient,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFFF6B6B).withValues(alpha: 0.3),
                        blurRadius: 30,
                      ),
                    ],
                  ),
                  child: const Icon(Icons.quiz_rounded, color: Colors.white, size: 40),
                ),
                const SizedBox(height: 24),
                Text(
                  'Generate a Quiz',
                  style: AppTextStyles.headlineSmall.copyWith(
                    color: AppColors.textPrimaryDark,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'From: ${widget.materials.map((m) => m.title).join(", ")}',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondaryDark,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 40),
                // Number of questions slider
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Number of Questions',
                          style: AppTextStyles.titleMedium.copyWith(
                            color: AppColors.textPrimaryDark,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '$_numQuestions',
                            style: AppTextStyles.titleMedium.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SliderTheme(
                      data: SliderTheme.of(context).copyWith(
                        activeTrackColor: AppColors.primary,
                        inactiveTrackColor: AppColors.glassBorder,
                        thumbColor: Colors.white,
                        overlayColor: AppColors.primary.withValues(alpha: 0.2),
                        trackHeight: 6.0,
                        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 12.0),
                        overlayShape: const RoundSliderOverlayShape(overlayRadius: 24.0),
                      ),
                      child: Slider(
                        value: _numQuestions.toDouble(),
                        min: 3,
                        max: 20,
                        divisions: 17,
                        onChanged: (value) {
                          setState(() {
                            _numQuestions = value.round();
                          });
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 40),
                GradientButton(
                  text: 'Generate Questions',
                  icon: Icons.auto_awesome_rounded,
                  gradient: AppColors.warmGradient,
                  onPressed: _startQuiz,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
