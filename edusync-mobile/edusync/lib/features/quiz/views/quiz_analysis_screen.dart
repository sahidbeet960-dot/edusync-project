import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/gradient_scaffold.dart';
import '../viewmodels/quiz_viewmodel.dart';
import '../../../data/models/quiz_model.dart';

class QuizAnalysisScreen extends StatelessWidget {
  const QuizAnalysisScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GradientScaffold(
      body: SafeArea(
        child: _AnalysisContent(),
      ),
    );
  }
}

class _AnalysisContent extends StatefulWidget {
  const _AnalysisContent();

  @override
  State<_AnalysisContent> createState() => _AnalysisContentState();
}

class _AnalysisContentState extends State<_AnalysisContent> {
  bool _isSaving = false;

  Future<void> _saveAnalysis(BuildContext context, QuizResult result) async {
    setState(() {
      _isSaving = true;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Load existing saved quizzes
      final String? existingData = prefs.getString('saved_quizzes');
      List<dynamic> savedQuizzes = [];
      if (existingData != null) {
        savedQuizzes = jsonDecode(existingData);
      }

      // Convert current result to serializable map
      final currentMap = {
        'score': result.score,
        'total': result.questions.length,
        'date': DateTime.now().toIso8601String(),
        'questions': result.questions.map((q) => q.toJson()).toList(),
        'userAnswers': result.userAnswers.map((k, v) => MapEntry(k.toString(), v)),
      };

      savedQuizzes.add(currentMap);
      await prefs.setString('saved_quizzes', jsonEncode(savedQuizzes));

      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Analysis saved securely on your device.'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
         SnackBar(
          content: Text('Failed to save analysis: $e'),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }

    if (mounted) {
      setState(() {
        _isSaving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final quizVM = context.watch<QuizViewModel>();
    final result = quizVM.getResult();

    final score = result.score;
    final total = result.questions.length;
    final percentage = total > 0 ? (score / total) * 100 : 0.0;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Header
           Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Quiz Analysis',
                style: AppTextStyles.headlineSmall.copyWith(
                  color: AppColors.textPrimaryDark,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded, color: AppColors.textPrimaryDark),
                onPressed: () {
                   quizVM.reset();
                   context.pop();
                },
              )
            ],
          ),
          const SizedBox(height: 24),
          
          // Score Card
           Container(
             width: double.infinity,
             padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
             decoration: BoxDecoration(
               gradient: AppColors.primaryGradient,
               borderRadius: BorderRadius.circular(24),
               boxShadow: [
                 BoxShadow(
                   color: AppColors.primary.withValues(alpha: 0.3),
                   blurRadius: 20,
                   offset: const Offset(0, 8),
                 ),
               ],
             ),
             child: Column(
               children: [
                 Text(
                   'Your Score',
                   style: AppTextStyles.titleMedium.copyWith(color: Colors.white.withValues(alpha: 0.8)),
                 ),
                 const SizedBox(height: 12),
                 Row(
                   mainAxisAlignment: MainAxisAlignment.center,
                   crossAxisAlignment: CrossAxisAlignment.baseline,
                   textBaseline: TextBaseline.alphabetic,
                   children: [
                     Text(
                       '$score',
                       style: const TextStyle(
                         fontSize: 64,
                         fontWeight: FontWeight.bold,
                         color: Colors.white,
                         height: 1,
                       ),
                     ),
                     Text(
                       ' / $total',
                       style: TextStyle(
                         fontSize: 24,
                         fontWeight: FontWeight.w600,
                         color: Colors.white.withValues(alpha: 0.8),
                       ),
                     ),
                   ],
                 ),
                 const SizedBox(height: 12),
                 Container(
                   padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                   decoration: BoxDecoration(
                     color: Colors.white.withValues(alpha: 0.2),
                     borderRadius: BorderRadius.circular(20),
                   ),
                   child: Text(
                     percentage >= 80 ? 'Excellent Work! 🎉' : 
                     percentage >= 50 ? 'Good Effort! 👍' : 'Keep Practicing! 💪',
                     style: AppTextStyles.bodyMedium.copyWith(
                       color: Colors.white,
                       fontWeight: FontWeight.bold,
                     ),
                   ),
                 )
               ],
             ),
           ),
           const SizedBox(height: 32),
           
           // Question Review Header
           Row(
             children: [
                const Icon(Icons.analytics_rounded, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  'Detailed Review',
                  style: AppTextStyles.titleLarge.copyWith(color: AppColors.textPrimaryDark),
                ),
             ],
           ),
           const SizedBox(height: 16),
           
           // List of Questions
           ListView.separated(
             shrinkWrap: true,
             physics: const NeverScrollableScrollPhysics(),
             itemCount: result.questions.length,
               separatorBuilder: (context, index) => const SizedBox(height: 16),
               itemBuilder: (context, index) {
                 final q = result.questions[index];
                 final userAnswer = result.userAnswers[index];
                 final isCorrect = userAnswer == q.answer;
                 
                 return Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceDark,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isCorrect ? Colors.green.withValues(alpha: 0.3) : AppColors.error.withValues(alpha: 0.3),
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                             Container(
                               padding: const EdgeInsets.all(6),
                               decoration: BoxDecoration(
                                 color: isCorrect ? Colors.green.withValues(alpha: 0.1) : AppColors.error.withValues(alpha: 0.1),
                                 shape: BoxShape.circle,
                               ),
                               child: Icon(
                                 isCorrect ? Icons.check_rounded : Icons.close_rounded,
                                 color: isCorrect ? Colors.green : AppColors.error,
                                 size: 16,
                               ),
                             ),
                             const SizedBox(width: 12),
                             Expanded(
                               child: Text(
                                 q.question,
                                 style: AppTextStyles.titleMedium.copyWith(
                                    color: AppColors.textPrimaryDark,
                                    height: 1.3,
                                 ),
                               ),
                             ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        
                        // User's Answer
                        if (!isCorrect && userAnswer != null) ...[
                          _buildAnswerRow('Your Answer:', userAnswer, AppColors.error),
                          const SizedBox(height: 8),
                        ],
                        
                        // Correct Answer
                        _buildAnswerRow(isCorrect ? 'Your Answer (Correct):' : 'Correct Answer:', q.answer, Colors.green),
                        
                        // Description/Explanation
                        if (q.description.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.glassBorder.withValues(alpha: 0.5),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                     const Icon(Icons.lightbulb_outline_rounded, color: AppColors.primary, size: 16),
                                     const SizedBox(width: 6),
                                     Text(
                                       'Explanation',
                                       style: AppTextStyles.labelLarge.copyWith(color: AppColors.textPrimaryDark),
                                     ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  q.description,
                                  style: AppTextStyles.bodyMedium.copyWith(
                                    color: AppColors.textSecondaryDark,
                                    height: 1.4,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ]
                      ],
                    ),
                 );
               },
             ),
           
           const SizedBox(height: 32),
           
           // Save Button
           GradientButton(
             text: 'Save Analysis',
             icon: Icons.save_alt_rounded,
             gradient: AppColors.warmGradient,
             isLoading: _isSaving,
             onPressed: () => _saveAnalysis(context, result),
           ),
        ],
      ),
    );
  }
  
  Widget _buildAnswerRow(String label, String value, Color color) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 130,
          child: Text(
            label,
            style: AppTextStyles.labelLarge.copyWith(color: AppColors.textSecondaryDark),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: AppTextStyles.bodyMedium.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
