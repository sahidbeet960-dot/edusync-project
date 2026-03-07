
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/gradient_scaffold.dart';
import '../viewmodels/ai_hub_viewmodel.dart';
import '../../auth/viewmodels/auth_viewmodel.dart';

class AiSummaryScreen extends StatefulWidget {
  const AiSummaryScreen({super.key});

  @override
  State<AiSummaryScreen> createState() => _AiSummaryScreenState();
}

class _AiSummaryScreenState extends State<AiSummaryScreen> {
  bool _isInit = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInit) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.read<AiHubViewModel>().initSummarySession();
      });
      _isInit = true;
    }
  }

  Future<void> _pickAndSummarize(BuildContext context, AiHubViewModel vm, AuthViewModel auth) async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
      allowMultiple: true,
    );

    if (result != null) {
      if (result.files.isNotEmpty && context.mounted) {
        await vm.generateSummary(result.files);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final aiVM = context.watch<AiHubViewModel>();
    final authVM = context.watch<AuthViewModel>();

    return GradientScaffold(
      showOrbs: true,
      appBar: AppBar(
        title: Column(
          children: [
            const Text('Document Summarizer', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            Text('Quick Insights', style: TextStyle(fontSize: 12, color: AppColors.textSecondaryDark.withValues(alpha: 0.7))),
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: aiVM.isGeneratingSummary
          ? _buildLoadingState()
          : aiVM.summaryText == null
              ? _buildEmptyState(context, aiVM, authVM)
              : _buildDataState(aiVM, context, authVM),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: AppColors.primary),
          const SizedBox(height: 24),
          Text(
            'Reading & Summarizing...',
            style: AppTextStyles.titleMedium.copyWith(color: AppColors.textPrimaryDark),
          ),
          const SizedBox(height: 8),
          Text(
            'Extracting the key points and concepts using AI.',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondaryDark),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, AiHubViewModel vm, AuthViewModel auth) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.auto_awesome_motion_rounded, size: 64, color: AppColors.primary),
            ),
            const SizedBox(height: 32),
            Text(
              'No Summary Generated',
              style: AppTextStyles.headlineSmall.copyWith(color: AppColors.textPrimaryDark, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text(
              'Upload your lecture slides or notes to instantly generate a comprehensive summary of the core materials.',
              style: AppTextStyles.bodyLarge.copyWith(color: AppColors.textSecondaryDark, height: 1.5),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 48),
            ElevatedButton.icon(
              onPressed: () => _pickAndSummarize(context, vm, auth),
              icon: const Icon(Icons.upload_file_rounded),
              label: const Text('Upload Document', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 8,
                shadowColor: AppColors.primary.withValues(alpha: 0.4),
              ),
            ),
            if (vm.error != null) ...[
              const SizedBox(height: 24),
              Text(vm.error!, style: const TextStyle(color: AppColors.error), textAlign: TextAlign.center),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildDataState(AiHubViewModel vm, BuildContext context, AuthViewModel auth) {
    return ListView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(24),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.subject_rounded, color: AppColors.primaryLight, size: 24),
                const SizedBox(width: 12),
                Text(
                  'Generated Summary',
                  style: AppTextStyles.titleLarge.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            IconButton(
              onPressed: () => _pickAndSummarize(context, vm, auth), 
              icon: const Icon(Icons.refresh_rounded, color: AppColors.primary),
              tooltip: 'Summarize Another Document',
            )
          ],
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.cardDark,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
          ),
          child: MarkdownBody(
            data: vm.summaryText ?? '',
            styleSheet: MarkdownStyleSheet(
              p: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 15, height: 1.6),
              h1: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
              h2: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              h3: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              listBullet: const TextStyle(color: AppColors.primaryLight),
              code: const TextStyle(color: AppColors.primaryLight, backgroundColor: Colors.black26, fontFamily: 'monospace'),
              codeblockDecoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(8)),
            ),
            selectable: true,
          ),
        ),
        const SizedBox(height: 48),
      ],
    );
  }
}
