
import 'dart:ui';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/gradient_scaffold.dart';
import '../../auth/viewmodels/auth_viewmodel.dart';
import '../viewmodels/ai_hub_viewmodel.dart';
import '../models/infograph_models.dart';

class AiInfographsScreen extends StatefulWidget {
  const AiInfographsScreen({super.key});

  @override
  State<AiInfographsScreen> createState() => _AiInfographsScreenState();
}

class _AiInfographsScreenState extends State<AiInfographsScreen> {
  bool _isInit = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInit) {
      final auth = context.read<AuthViewModel>();
      final uid = auth.user?.id ?? 'guest';
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.read<AiHubViewModel>().initInfographsSession('user_$uid');
      });
      _isInit = true;
    }
  }

  Future<void> _pickAndGenerate(BuildContext context, AiHubViewModel vm, AuthViewModel auth) async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
      allowMultiple: true,
    );

    if (result != null) {
      if (result.files.isNotEmpty && context.mounted) {
        final userId = auth.user?.id.toString() ?? 'guest';
        await vm.generateInfographs(userId, result.files);
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
            const Text('Exam Analytics', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            Text('AI Data Extractor', style: TextStyle(fontSize: 12, color: AppColors.textSecondaryDark.withValues(alpha: 0.7))),
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
      body: aiVM.isGeneratingInfographs
          ? _buildLoadingState()
          : (aiVM.heatmapData == null && aiVM.pieChartData == null)
              ? _buildEmptyState(context, aiVM, authVM)
              : _buildDataState(aiVM),
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
            'Analyzing Documents...',
            style: AppTextStyles.titleMedium.copyWith(color: AppColors.textPrimaryDark),
          ),
          const SizedBox(height: 8),
          Text(
            'Extracting topics, marks, and years using AI.',
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
              child: const Icon(Icons.analytics_rounded, size: 64, color: AppColors.primary),
            ),
            const SizedBox(height: 32),
            Text(
              'No Analytics Yet',
              style: AppTextStyles.headlineSmall.copyWith(color: AppColors.textPrimaryDark, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text(
              'Upload past year question papers (PYQs) to generate a topic weightage heatmap and pie chart analysis.',
              style: AppTextStyles.bodyLarge.copyWith(color: AppColors.textSecondaryDark, height: 1.5),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 48),
            ElevatedButton.icon(
              onPressed: () => _pickAndGenerate(context, vm, auth),
              icon: const Icon(Icons.upload_file_rounded),
              label: const Text('Upload Exam Papers', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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

  Widget _buildDataState(AiHubViewModel vm) {
    return ListView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(24),
      children: [
        if (vm.heatmapData != null) ...[
          _SectionTitle('Topic Weightage Heatmap', Icons.grid_on_rounded),
          const SizedBox(height: 16),
          _HeatmapWidget(data: vm.heatmapData!, pieData: vm.pieChartData),
          const SizedBox(height: 48),
        ],
        if (vm.pieChartData != null) ...[
          _SectionTitle('Chapter Distribution (${vm.pieChartData!.subject})', Icons.pie_chart_rounded),
          const SizedBox(height: 16),
          _PieChartWidget(data: vm.pieChartData!),
        ],
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final IconData icon;

  const _SectionTitle(this.title, this.icon);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primaryLight, size: 24),
        const SizedBox(width: 12),
        Text(
          title,
          style: AppTextStyles.titleLarge.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}

// --- Custom Native Heatmap ---
class _HeatmapWidget extends StatelessWidget {
  final HeatmapData data;
  final PieChartData? pieData;

  const _HeatmapWidget({required this.data, this.pieData});

  @override
  Widget build(BuildContext context) {
    if (data.cells.isEmpty) return const Text('No heatmap data available');

    // Extract unique topics and years
    final topics = data.cells.map((c) => c.topic).toSet().toList()..sort();
    final years = data.cells.map((c) => c.year).toSet().toList()..sort();

    // Find pie chart total for percentages
    double pieTotal = 1;
    if (pieData != null) {
      pieTotal = pieData!.shares.fold(0.0, (sum, item) => sum + item.totalMarks);
      if (pieTotal == 0) pieTotal = 1;
    }

    // Find max mark for color scaling
    double maxMark = 0;
    for (var cell in data.cells) {
      if (cell.marks > maxMark) maxMark = cell.marks;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row (Years)
            Row(
              children: [
                const SizedBox(width: 150), // Topic column width
                ...years.map((y) => SizedBox(
                  width: 60,
                  child: Center(
                    child: Text(y, style: const TextStyle(color: AppColors.textSecondaryDark, fontWeight: FontWeight.w600, fontSize: 12)),
                  ),
                )),
              ],
            ),
            const SizedBox(height: 12),
            // Data Rows (Topics)
            ...topics.map((topic) {
              String bracketInfo = '';
              if (pieData != null) {
                final share = pieData!.shares.where((s) => s.chapter == topic).firstOrNull;
                if (share != null) {
                  final pct = (share.totalMarks / pieTotal) * 100;
                  bracketInfo = ' (${pct.toStringAsFixed(1)}%)';
                }
              }

              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    SizedBox(
                      width: 150,
                      child: Text(
                        '$topic$bracketInfo',
                        style: const TextStyle(color: AppColors.textPrimaryDark, fontSize: 13),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    ...years.map((year) {
                      final cell = data.cells.where((c) => c.topic == topic && c.year == year).firstOrNull;
                      final val = cell?.marks ?? 0.0;
                      
                      // Calculate opacity based on maxMark. Avoid 0 opacity if val > 0
                      double opacity = val == 0 ? 0.05 : 0.2 + (val / maxMark) * 0.8;
                      if (opacity > 1.0) opacity = 1.0;

                      return Container(
                        width: 52,
                        height: 48,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(
                          color: val == 0 ? Colors.white.withValues(alpha: 0.05) : AppColors.primary.withValues(alpha: opacity),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Center(
                          child: Text(
                            val == 0 ? '-' : val.toStringAsFixed(0),
                            style: TextStyle(
                              color: val == 0 ? Colors.white24 : Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

// --- Custom Native Pie Chart ---
class _PieChartWidget extends StatelessWidget {
  final PieChartData data;

  const _PieChartWidget({required this.data});

  @override
  Widget build(BuildContext context) {
    if (data.shares.isEmpty) return const Text('No pie chart data available');

    double total = data.shares.fold(0, (sum, item) => sum + item.totalMarks);
    if (total == 0) total = 1;

    final colors = [
      const Color(0xFF6C63FF),
      const Color(0xFF00D9A6),
      const Color(0xFFFFBE0B),
      const Color(0xFFE040FB),
      const Color(0xFF3B82F6),
      const Color(0xFFF43F5E),
    ];

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        children: [
          SizedBox(
            height: 200,
            child: CustomPaint(
              painter: _PieChartPainter(data.shares, colors, total),
              child: const SizedBox.expand(),
            ),
          ),
          const SizedBox(height: 32),
          // Legend
          Column(
            children: List.generate(data.shares.length, (i) {
              final share = data.shares[i];
              final pct = (share.totalMarks / total) * 100;
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    Container(
                      width: 14, height: 14,
                      decoration: BoxDecoration(
                        color: colors[i % colors.length],
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        share.chapter,
                        style: const TextStyle(color: AppColors.textPrimaryDark, fontSize: 13),
                      ),
                    ),
                    Text(
                      '${pct.toStringAsFixed(1)}%',
                      style: const TextStyle(color: AppColors.textSecondaryDark, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              );
            }),
          )
        ],
      ),
    );
  }
}

class _PieChartPainter extends CustomPainter {
  final List<PieChartShare> shares;
  final List<Color> colors;
  final double total;

  _PieChartPainter(this.shares, this.colors, this.total);

  @override
  void paint(Canvas canvas, Size size) {
    if (total == 0 || shares.isEmpty) return;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2;
    
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..strokeWidth = 2.0;

    double startAngle = -math.pi / 2; // Start from top

    for (int i = 0; i < shares.length; i++) {
      final sweepAngle = (shares[i].totalMarks / total) * 2 * math.pi;
      
      paint.color = colors[i % colors.length];
      
      // Draw arc
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepAngle,
        true, // useCenter
        paint,
      );

      // Add a slight gap between slices by drawing a transparent stroke line
      final gapPaint = Paint()
        ..style = PaintingStyle.stroke
        ..color = AppColors.cardDark // Match background
        ..strokeWidth = 4.0;
      
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius + 2), // slightly larger to cover edges safely
        startAngle,
        sweepAngle,
        true,
        gapPaint,
      );

      startAngle += sweepAngle;
    }
    
    // Create donut hole
    final innerPaint = Paint()..color = AppColors.cardDark;
    canvas.drawCircle(center, radius * 0.5, innerPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
