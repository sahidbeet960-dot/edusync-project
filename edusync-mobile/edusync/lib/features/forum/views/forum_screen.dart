import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/avatar_widget.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../core/widgets/gradient_scaffold.dart';
import '../../../data/models/question_model.dart';
import '../viewmodels/forum_viewmodel.dart';

class ForumScreen extends StatefulWidget {
  const ForumScreen({super.key});

  @override
  State<ForumScreen> createState() => _ForumScreenState();
}

class _ForumScreenState extends State<ForumScreen> {
  final _searchCtl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<ForumViewModel>().loadQuestions();
    });
  }

  @override
  void dispose() {
    _searchCtl.dispose();
    super.dispose();
  }

  String _timeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    if (diff.inDays < 30) return '${(diff.inDays / 7).floor()}w ago';
    return DateFormat('MMM d').format(date);
  }

  @override
  Widget build(BuildContext context) {
    final forumVM = context.watch<ForumViewModel>();

    return GradientScaffold(
      floatingActionButton: _buildGlowingFab(),
      body: SafeArea(
        child: Column(
          children: [
            // ─── Header ───
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF6C63FF), Color(0xFF9C6AFF)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF6C63FF).withValues(alpha: 0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.forum_rounded, color: Colors.white, size: 22),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Doubt Forum',
                          style: AppTextStyles.headlineMedium.copyWith(
                            color: AppColors.textPrimaryDark,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${forumVM.filteredQuestions.length} discussions',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondaryDark,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _buildHeaderAction(Icons.refresh_rounded, () {
                    HapticFeedback.lightImpact();
                    forumVM.loadQuestions(forceRefresh: true);
                  }),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // ─── Search ───
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: CustomTextField(
                controller: _searchCtl,
                hint: 'Search discussions, topics...',
                prefixIcon: Icons.search_rounded,
                onChanged: forumVM.setSearchQuery,
                suffix: _searchCtl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchCtl.clear();
                          forumVM.setSearchQuery('');
                        },
                      )
                    : null,
              ),
            ),

            const SizedBox(height: 16),

            // ─── Posts list ───
            Expanded(
              child: forumVM.isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: AppColors.primary),
                    )
                  : forumVM.filteredQuestions.isEmpty
                      ? EmptyState(
                          icon: Icons.forum_rounded,
                          title: 'No posts yet',
                          subtitle: 'Start a discussion or ask a question!',
                          lottieAsset: 'assets/animations/empty_list.json',
                        )
                      : RefreshIndicator(
                          onRefresh: () => forumVM.loadQuestions(forceRefresh: true),
                          color: AppColors.primary,
                          child: ListView.builder(
                            physics: const BouncingScrollPhysics(),
                            padding: const EdgeInsets.fromLTRB(24, 8, 24, 120),
                            itemCount: forumVM.filteredQuestions.length,
                            itemBuilder: (_, i) =>
                                _buildQuestionCard(forumVM.filteredQuestions[i]),
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Header Action Button ───
  Widget _buildHeaderAction(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
        ),
        child: Icon(icon, color: AppColors.textSecondaryDark, size: 20),
      ),
    );
  }

  // ─── FAB ───
  Widget _buildGlowingFab() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 90),
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF6C63FF), Color(0xFF9C6AFF)],
          ),
          borderRadius: BorderRadius.circular(30),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF6C63FF).withValues(alpha: 0.4),
              blurRadius: 20,
              spreadRadius: 2,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: FloatingActionButton.extended(
          onPressed: () {
            HapticFeedback.mediumImpact();
            _showAskQuestionSheet(context);
          },
          icon: const Icon(Icons.edit_note_rounded, color: Colors.white, size: 22),
          label: const Text('Ask a Doubt', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 0.3)),
          backgroundColor: Colors.transparent,
          elevation: 0,
          focusElevation: 0,
          hoverElevation: 0,
          highlightElevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        ),
      ),
    );
  }

  // ─── QUESTION CARD ───

  Widget _buildQuestionCard(QuestionModel question) {
    final hasVerifiedAnswer = question.answers.any((a) => a.isProfessorVerified);

    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        _showQuestionDetail(context, question);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.03),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: hasVerifiedAnswer
                ? AppColors.success.withValues(alpha: 0.25)
                : Colors.white.withValues(alpha: 0.08),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ─── Author Row ───
                  Row(
                    children: [
                      AvatarWidget(
                        name: question.authorName ?? 'User ${question.authorId}',
                        size: 36,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              question.authorName ?? 'User ${question.authorId}',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimaryDark,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                Icon(Icons.access_time_rounded, size: 11,
                                    color: AppColors.textSecondaryDark.withValues(alpha: 0.6)),
                                const SizedBox(width: 4),
                                Text(
                                  _timeAgo(question.createdAt),
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: AppColors.textSecondaryDark.withValues(alpha: 0.7),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      // Answer count chip
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6C63FF).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.chat_bubble_outline_rounded, size: 13, color: Color(0xFF6C63FF)),
                            const SizedBox(width: 5),
                            Text(
                              '${question.answerCount}',
                              style: const TextStyle(
                                color: Color(0xFF6C63FF),
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // ─── Title ───
                  Text(
                    question.title,
                    style: AppTextStyles.titleLarge.copyWith(
                      color: AppColors.textPrimaryDark,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: 8),

                  // ─── Content Preview ───
                  Text(
                    question.content,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.textSecondaryDark,
                      height: 1.5,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: 14),

                  // ─── Footer ───
                  Row(
                    children: [
                      if (hasVerifiedAnswer)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.success.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.verified_rounded, size: 12, color: AppColors.success),
                              SizedBox(width: 4),
                              Text(
                                'Solved',
                                style: TextStyle(
                                  color: AppColors.success,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ],
                          ),
                        ),
                      const Spacer(),
                      Icon(Icons.arrow_forward_ios_rounded, size: 13,
                          color: AppColors.textSecondaryDark.withValues(alpha: 0.4)),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ─── QUESTION DETAIL (Full-screen style bottom sheet) ───

  void _showQuestionDetail(BuildContext context, QuestionModel question) {
    final forumVM = context.read<ForumViewModel>();
    forumVM.loadQuestionDetail(question.id);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.backgroundDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        final answerCtl = TextEditingController();
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.9,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          builder: (ctx, scrollCtl) {
            return Consumer<ForumViewModel>(
              builder: (ctx, vm, _) => Column(
                children: [
                  // ─── Handle ───
                  Container(
                    margin: const EdgeInsets.only(top: 12),
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),

                  // ─── Question Header ───
                  Container(
                    padding: const EdgeInsets.fromLTRB(24, 20, 24, 16),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: Colors.white.withValues(alpha: 0.06)),
                      ),
                    ),
                    child: Row(
                      children: [
                        AvatarWidget(
                          name: question.authorName ?? 'User ${question.authorId}',
                          size: 42,
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                question.authorName ?? 'User ${question.authorId}',
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimaryDark,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _timeAgo(question.createdAt),
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondaryDark.withValues(alpha: 0.8),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // close
                        GestureDetector(
                          onTap: () => Navigator.pop(ctx),
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.05),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.close_rounded, color: AppColors.textSecondaryDark, size: 18),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // ─── Scrollable Content ───
                  Expanded(
                    child: ListView(
                      controller: scrollCtl,
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.all(24),
                      children: [
                        // Title
                        Text(
                          question.title,
                          style: AppTextStyles.headlineMedium.copyWith(
                            color: AppColors.textPrimaryDark,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Content
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.03),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
                          ),
                          child: Text(
                            question.content,
                            style: AppTextStyles.bodyLarge.copyWith(
                              color: AppColors.textPrimaryDark,
                              height: 1.7,
                            ),
                          ),
                        ),

                        const SizedBox(height: 28),

                        // ─── Answers Header ───
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF6C63FF).withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.chat_rounded, size: 16, color: Color(0xFF6C63FF)),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              '${vm.answers.length} Answers',
                              style: AppTextStyles.titleLarge.copyWith(
                                color: AppColors.textPrimaryDark,
                                fontSize: 17,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Container(
                          height: 3,
                          width: 32,
                          margin: const EdgeInsets.only(left: 44),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF6C63FF), Color(0xFF9C6AFF)],
                            ),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),

                        const SizedBox(height: 20),

                        if (vm.isLoading)
                          const Center(
                            child: Padding(
                              padding: EdgeInsets.all(32),
                              child: CircularProgressIndicator(color: AppColors.primary),
                            ),
                          )
                        else if (vm.answers.isEmpty)
                          Center(
                            child: Padding(
                              padding: const EdgeInsets.all(32),
                              child: Column(
                                children: [
                                  Icon(Icons.chat_bubble_outline_rounded, size: 48,
                                      color: AppColors.textSecondaryDark.withValues(alpha: 0.3)),
                                  const SizedBox(height: 12),
                                  Text(
                                    'No answers yet',
                                    style: AppTextStyles.titleMedium.copyWith(
                                      color: AppColors.textSecondaryDark,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Be the first to help!',
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: AppColors.textSecondaryDark.withValues(alpha: 0.7),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                        else
                          ...vm.answers.map((a) => _buildAnswerCard(a, vm)),

                        const SizedBox(height: 80),
                      ],
                    ),
                  ),

                  // ─── Answer Input ───
                  Container(
                    padding: EdgeInsets.fromLTRB(
                      20, 14, 20,
                      MediaQuery.of(ctx).viewInsets.bottom + 14,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceDark,
                      border: Border(
                        top: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.3),
                          blurRadius: 20,
                          offset: const Offset(0, -6),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: answerCtl,
                            style: const TextStyle(
                              color: AppColors.textPrimaryDark,
                              fontSize: 15,
                            ),
                            maxLines: null,
                            textInputAction: TextInputAction.newline,
                            decoration: InputDecoration(
                              hintText: 'Write your answer...',
                              hintStyle: TextStyle(
                                color: AppColors.textSecondaryDark.withValues(alpha: 0.5),
                                fontWeight: FontWeight.w500,
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(20),
                                borderSide: BorderSide.none,
                              ),
                              filled: true,
                              fillColor: Colors.white.withValues(alpha: 0.05),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 14,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF6C63FF), Color(0xFF9C6AFF)],
                            ),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF6C63FF).withValues(alpha: 0.3),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: IconButton(
                            onPressed: () {
                              if (answerCtl.text.trim().isNotEmpty) {
                                HapticFeedback.mediumImpact();
                                vm.createAnswer(
                                  questionId: question.id,
                                  content: answerCtl.text.trim(),
                                );
                                answerCtl.clear();
                              }
                            },
                            icon: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // ═══════════════════════════════════════════════════════
  // ─── ANSWER CARD ───
  // ═══════════════════════════════════════════════════════

  Widget _buildAnswerCard(AnswerModel answer, ForumViewModel vm) {
    final isVerified = answer.isProfessorVerified;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: isVerified
            ? AppColors.success.withValues(alpha: 0.04)
            : Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isVerified
              ? AppColors.success.withValues(alpha: 0.2)
              : Colors.white.withValues(alpha: 0.06),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ─── Author + Verified ───
            Row(
              children: [
                AvatarWidget(
                  name: answer.authorName ?? 'User ${answer.authorId}',
                  size: 30,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              answer.authorName ?? 'User ${answer.authorId}',
                              style: const TextStyle(
                                color: AppColors.textPrimaryDark,
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (answer.authorRole != null) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: _roleColor(answer.authorRole!).withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(5),
                              ),
                              child: Text(
                                answer.authorRole!.toUpperCase(),
                                style: TextStyle(
                                  color: _roleColor(answer.authorRole!),
                                  fontSize: 8,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      Text(
                        _timeAgo(answer.createdAt),
                        style: TextStyle(
                          fontSize: 10,
                          color: AppColors.textSecondaryDark.withValues(alpha: 0.6),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isVerified)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified_rounded, size: 12, color: AppColors.success),
                        SizedBox(width: 4),
                        Text(
                          'Best',
                          style: TextStyle(
                            color: AppColors.success,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),

            const SizedBox(height: 12),

            // ─── Content ───
            Text(
              answer.content,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textPrimaryDark,
                height: 1.6,
              ),
            ),

            const SizedBox(height: 14),

            // ─── Vote Row ───
            Row(
              children: [
                _buildVoteButton(
                  Icons.thumb_up_alt_rounded,
                  answer.upvotes,
                  const Color(0xFF6C63FF),
                  true,
                  () {
                    HapticFeedback.lightImpact();
                    vm.vote(answer.id, 1);
                  },
                ),
                const SizedBox(width: 10),
                _buildVoteButton(
                  Icons.thumb_down_alt_rounded,
                  answer.downvotes,
                  AppColors.error,
                  true,
                  () {
                    HapticFeedback.lightImpact();
                    vm.vote(answer.id, -1);
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _roleColor(String role) {
    switch (role.toLowerCase()) {
      case 'professor':
        return const Color(0xFFF59E0B);
      case 'cr':
        return const Color(0xFF10B981);
      case 'admin':
        return const Color(0xFFF43F5E);
      default:
        return const Color(0xFF6C63FF);
    }
  }

  Widget _buildVoteButton(IconData icon, int count, Color color, bool alwaysShowCount, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.12)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 15, color: color),
            const SizedBox(width: 6),
            Text(
              '$count',
              style: TextStyle(
                color: color,
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── CREATE POST SHEET ───

  void _showAskQuestionSheet(BuildContext context) {
    final titleCtl = TextEditingController();
    final contentCtl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(
          24, 24, 24,
          MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF6C63FF), Color(0xFF9C6AFF)],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.edit_note_rounded, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 14),
                  Text(
                    'Ask a Doubt',
                    style: AppTextStyles.headlineSmall.copyWith(
                      color: AppColors.textPrimaryDark,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              CustomTextField(
                controller: titleCtl,
                label: 'TITLE',
                hint: "What's your question about?",
                prefixIcon: Icons.title_rounded,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: contentCtl,
                label: 'DETAILS',
                hint: 'Explain your doubt in detail...',
                maxLines: 5,
              ),

              const SizedBox(height: 28),

              GradientButton(
                text: 'Post Question',
                icon: Icons.send_rounded,
                onPressed: () {
                  if (titleCtl.text.trim().isEmpty) {
                    ScaffoldMessenger.of(ctx).showSnackBar(
                      const SnackBar(content: Text('Please provide a title')),
                    );
                    return;
                  }
                  HapticFeedback.mediumImpact();
                  context.read<ForumViewModel>().createQuestion(
                    title: titleCtl.text.trim(),
                    content: contentCtl.text.trim(),
                  );
                  Navigator.pop(ctx);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}