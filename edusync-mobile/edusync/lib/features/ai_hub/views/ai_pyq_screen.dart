import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../viewmodels/ai_hub_viewmodel.dart';
import '../models/pyq_models.dart';

class AiPyqScreen extends StatefulWidget {
  const AiPyqScreen({super.key});

  @override
  State<AiPyqScreen> createState() => _AiPyqScreenState();
}

class _AiPyqScreenState extends State<AiPyqScreen> {
  bool _isInit = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInit) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.read<AiHubViewModel>().initPyqSession();
      });
      _isInit = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final aiVM = context.watch<AiHubViewModel>();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // Slate 50
      appBar: AppBar(
        title: const Text('PYQ Analytics', style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: -0.5, color: Color(0xFF0F172A))),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Color(0xFF0F172A)),
          onPressed: () => context.pop(),
        ),
      ),
      body: aiVM.isLoadingPyqSubjects
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _buildMainContent(context, aiVM),
    );
  }

  Widget _buildSubjectDropdownHeader(BuildContext context, AiHubViewModel vm) {
    if (vm.pyqSubjects.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 24),
        child: Text('No subjects available from the server.', style: TextStyle(color: Colors.black54)),
      );
    }

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(24, 8, 24, 24),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF3C38FF).withValues(alpha: 0.9),
            const Color(0xFF5B38FF),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF3C38FF).withValues(alpha: 0.3),
            blurRadius: 24,
            offset: const Offset(0, 12),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.auto_awesome, size: 14, color: Colors.white),
                const SizedBox(width: 6),
                Text('AI PYQ Analytics', style: AppTextStyles.labelSmall.copyWith(color: Colors.white, letterSpacing: 1.0)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Select Subject',
            style: AppTextStyles.headlineSmall.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose a subject to reveal its exact exam probability map based on historical papers.',
            style: AppTextStyles.bodyMedium.copyWith(color: Colors.white.withValues(alpha: 0.8), height: 1.4),
          ),
          const SizedBox(height: 24),
          
          // Custom Dropdown
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                )
              ],
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: vm.selectedPyqSubject,
                isExpanded: true,
                icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Color(0xFF0F172A)),
                dropdownColor: Colors.white,
                borderRadius: BorderRadius.circular(16),
                style: const TextStyle(color: Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.w600),
                hint: const Text('Select a Subject'),
                items: vm.pyqSubjects.map((subject) {
                  return DropdownMenuItem<String>(
                    value: subject,
                    child: Text(subject, style: const TextStyle(fontWeight: FontWeight.w600)),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) vm.selectPyqSubject(value);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMainContent(BuildContext context, AiHubViewModel vm) {
    if (vm.isFetchingPyqAnalytics) {
      return Column(
        children: [
          _buildSubjectDropdownHeader(context, vm),
          const Expanded(child: Center(child: CircularProgressIndicator(color: Color(0xFF3C38FF)))),
        ],
      );
    }

    final data = vm.pyqAnalyticsData;

    if (data == null || data.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        children: [
          _buildSubjectDropdownHeader(context, vm),
          SizedBox(
            height: 300,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.analytics_outlined, size: 64, color: Colors.black.withValues(alpha: 0.1)),
                  const SizedBox(height: 16),
                  Text('Select a subject to view analytics.', style: AppTextStyles.bodyMedium.copyWith(color: Colors.black54)),
                ],
              ),
            ),
          ),
        ],
      );
    }

    // Sort data by priority (High -> Medium -> Low), then by total marks
    final sortedData = List<PyqTopicData>.from(data);
    sortedData.sort((a, b) {
      final aLevel = _getPriorityValue(a.priorityLevel);
      final bLevel = _getPriorityValue(b.priorityLevel);
      if (aLevel != bLevel) return bLevel.compareTo(aLevel); // Higher priority first
      return b.totalMarksContribution.compareTo(a.totalMarksContribution); // Higher marks first
    });

    final totalPoolMarks = data.fold<int>(0, (sum, item) => sum + item.totalMarksContribution);

    return RefreshIndicator(
      onRefresh: () async => vm.selectPyqSubject(vm.selectedPyqSubject!),
      color: const Color(0xFF3C38FF),
      child: ListView(
        padding: const EdgeInsets.only(bottom: 32),
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        children: [
          _buildSubjectDropdownHeader(context, vm),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Row(
                  children: [
                    const Icon(Icons.bar_chart_rounded, color: Color(0xFF3C38FF), size: 28),
                    const SizedBox(width: 8),
                    Text('Topic Probability Map', style: AppTextStyles.titleLarge.copyWith(color: const Color(0xFF1E293B), fontWeight: FontWeight.w800)),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: Text('${data.length} Topics Extracted', style: AppTextStyles.labelSmall.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          // Clean Grid for Cards (matching screenshot)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: 450,
                mainAxisExtent: 240,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: sortedData.length,
              itemBuilder: (context, index) => _buildTopicGridItem(sortedData[index], totalPoolMarks),
            ),
          ),
        ],
      ),
    );
  }

  int _getPriorityValue(String priority) {
    switch (priority.toLowerCase()) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  Widget _buildTopicGridItem(PyqTopicData topic, int totalPoolMarks) {
    final isHigh = topic.priorityLevel.toLowerCase() == 'high';
    final isMedium = topic.priorityLevel.toLowerCase() == 'medium';
    
    // Light Theme Card Accents 
    // High: Crimson Red, Medium: Burnt Orange, Low: Forest Green
    final accentColor = isHigh ? const Color(0xFFE11D48) : (isMedium ? const Color(0xFFD97706) : const Color(0xFF059669));
    final bgColor = isHigh ? const Color(0xFFFFF1F2) : (isMedium ? const Color(0xFFFFFBEB) : const Color(0xFFECFDF5));
    final borderColor = isHigh ? const Color(0xFFFECDD3) : (isMedium ? const Color(0xFFFDE68A) : const Color(0xFFA7F3D0));

    final weightage = totalPoolMarks > 0 ? (topic.totalMarksContribution / totalPoolMarks) : 0.0;
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  topic.topicName,
                  style: AppTextStyles.titleMedium.copyWith(color: accentColor, fontWeight: FontWeight.w800, height: 1.2),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade200),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 4, offset: const Offset(0, 2))
                  ]
                ),
                child: Text(
                  '${topic.priorityLevel.toUpperCase()} PROBABILITY',
                  style: AppTextStyles.labelSmall.copyWith(color: accentColor, fontWeight: FontWeight.w800, fontSize: 10, letterSpacing: 0.5),
                ),
              ),
            ],
          ),
          Row(
            children: [
              _buildSmallBoxStat('TOTAL MARKS', topic.totalMarksContribution.toString(), accentColor),
              const SizedBox(width: 12),
              _buildSmallBoxStat('FREQUENCY', '${topic.appearanceCount} papers', const Color(0xFF475569)),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Exam Weightage', style: AppTextStyles.labelSmall.copyWith(color: const Color(0xFF475569), fontWeight: FontWeight.bold)),
                  Text('${(weightage * 100).toStringAsFixed(0)}%', style: AppTextStyles.titleMedium.copyWith(color: accentColor, fontWeight: FontWeight.w800)),
                ],
              ),
              const SizedBox(height: 8),
              // Clean rounded progress bar
              LayoutBuilder(
                builder: (context, constraints) {
                  return Stack(
                    children: [
                      Container(
                        height: 8,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 800),
                        curve: Curves.easeOutCubic,
                        height: 8,
                        width: constraints.maxWidth * weightage,
                        decoration: BoxDecoration(
                          color: accentColor,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ],
                  );
                }
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSmallBoxStat(String label, String value, Color textColor) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: AppTextStyles.labelSmall.copyWith(color: const Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.0)),
            const SizedBox(height: 6),
            // Parse for "papers" split
            if (value.contains(' papers'))
               Row(
                 crossAxisAlignment: CrossAxisAlignment.end,
                 children: [
                   Text(value.split(' ')[0], style: AppTextStyles.headlineSmall.copyWith(color: textColor, fontWeight: FontWeight.w900)),
                   const SizedBox(width: 4),
                   Padding(
                     padding: const EdgeInsets.only(bottom: 2),
                     child: Text('papers', style: AppTextStyles.labelSmall.copyWith(color: const Color(0xFF64748B), fontWeight: FontWeight.w600)),
                   ),
                 ],
               )
            else
               Text(value, style: AppTextStyles.headlineSmall.copyWith(color: textColor, fontWeight: FontWeight.w900)),
          ],
        ),
      ),
    );
  }
}
