import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/services.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../core/widgets/gradient_scaffold.dart';
import '../../../data/models/material_model.dart';
import '../../auth/viewmodels/auth_viewmodel.dart';
import '../viewmodels/materials_viewmodel.dart';
import 'package:file_picker/file_picker.dart';
import 'pdf_viewer_screen.dart';
import 'txt_viewer_screen.dart';
import 'doc_viewer_screen.dart';
import 'image_viewer_screen.dart';

class MaterialsScreen extends StatefulWidget {
  const MaterialsScreen({super.key});

  @override
  State<MaterialsScreen> createState() => _MaterialsScreenState();
}

class _MaterialsScreenState extends State<MaterialsScreen> {
  final _searchCtl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MaterialsViewModel>().loadMaterials();
    });
  }

  @override
  void dispose() {
    _searchCtl.dispose();
    super.dispose();
  }

  // ─── File type maps (shared) ───
  static const _fileIcons = {
    'PDF': Icons.picture_as_pdf_rounded,
    'DOC': Icons.description_rounded,
    'DOCX': Icons.description_rounded,
    'PPT': Icons.slideshow_rounded,
    'PPTX': Icons.slideshow_rounded,
    'TXT': Icons.article_rounded,
    'XLS': Icons.table_chart_rounded,
    'XLSX': Icons.table_chart_rounded,
    'MP4': Icons.play_circle_fill_rounded,
    'PNG': Icons.image_rounded,
    'JPG': Icons.image_rounded,
    'JPEG': Icons.image_rounded,
    'DRIVE': Icons.add_to_drive_rounded,
    'LINK': Icons.link_rounded,
  };

  static const _fileColors = {
    'PDF': Color(0xFFF43F5E),
    'DOC': Color(0xFF3B82F6),
    'DOCX': Color(0xFF3B82F6),
    'PPT': Color(0xFFF59E0B),
    'PPTX': Color(0xFFF59E0B),
    'TXT': Color(0xFF8B5CF6),
    'XLS': Color(0xFF10B981),
    'XLSX': Color(0xFF10B981),
    'PNG': Color(0xFF06B6D4),
    'JPG': Color(0xFF06B6D4),
    'JPEG': Color(0xFF06B6D4),
    'DRIVE': Color(0xFF10B981),
    'LINK': Color(0xFF6366F1),
  };

  // ─── Open Material ───
  void _openMaterial(BuildContext context, MaterialModel material) async {
    final ext = material.fileExtension.toUpperCase();
    if (ext == 'PDF') {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PdfViewerScreen(
            pdfUrl: material.fileUrl,
            title: material.title,
          ),
        ),
      );
    } else if (ext == 'TXT') {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => TxtViewerScreen(
            txtUrl: material.fileUrl,
            title: material.title,
          ),
        ),
      );
    } else if (['DOC', 'DOCX', 'PPT', 'PPTX', 'XLS', 'XLSX'].contains(ext)) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => DocViewerScreen(
            docUrl: material.fileUrl,
            title: material.title,
          ),
        ),
      );
    } else if (['PNG', 'JPG', 'JPEG'].contains(ext)) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ImageViewerScreen(
            imageUrl: material.fileUrl,
            title: material.title,
          ),
        ),
      );
    } else {
      // Fallback: open in browser
      final uri = Uri.parse(material.fileUrl);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open file')),
        );
      }
    }
  }

  // ─── Download ───
  Future<void> _downloadFile(BuildContext context, MaterialModel material) async {
    try {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(child: Text('Downloading ${material.title}...')),
            ],
          ),
          duration: const Duration(seconds: 10),
          backgroundColor: AppColors.surfaceDark,
        ),
      );

      final dir = await getApplicationDocumentsDirectory();
      final ext = material.fileExtension.toLowerCase();
      final sanitizedTitle = material.title.replaceAll(RegExp(r'[^\w\s\-.]'), '').replaceAll(' ', '_');
      final fileName = '$sanitizedTitle.$ext';
      final savePath = '${dir.path}/$fileName';

      await Dio().download(material.fileUrl, savePath);

      if (context.mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 20),
                const SizedBox(width: 12),
                Expanded(child: Text('Downloaded: $fileName')),
              ],
            ),
            backgroundColor: AppColors.surfaceDark,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        // Fallback: open in external browser for download
        final uri = Uri.parse(material.fileUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Download failed. Please try again.')),
          );
        }
      }
    }
  }

  // ─── Verify / Unverify ───
  Future<void> _toggleVerify(BuildContext context, MaterialModel material) async {
    final matVM = context.read<MaterialsViewModel>();
    bool success;
    if (material.isVerified) {
      success = await matVM.unverifyMaterial(material.id);
    } else {
      success = await matVM.verifyMaterial(material.id);
    }
    if (mounted && success) {
      HapticFeedback.mediumImpact();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(material.isVerified ? 'Material unverified' : 'Material verified ✓'),
          backgroundColor: AppColors.surfaceDark,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } else if (mounted && !success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(matVM.error ?? 'Operation failed'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  // ─── Delete ───
  Future<void> _confirmDelete(BuildContext context, MaterialModel material) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.delete_forever_rounded, color: AppColors.error),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Delete Material',
                style: AppTextStyles.titleLarge.copyWith(color: AppColors.textPrimaryDark),
              ),
            ),
          ],
        ),
        content: Text(
          'Are you sure you want to delete "${material.title}"? This cannot be undone.',
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondaryDark),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondaryDark)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final matVM = context.read<MaterialsViewModel>();
      final success = await matVM.deleteMaterial(material.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success ? 'Material deleted' : (matVM.error ?? 'Delete failed')),
            backgroundColor: success ? AppColors.surfaceDark : AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final matVM = context.watch<MaterialsViewModel>();

    return GradientScaffold(
      floatingActionButton: _buildGlowingFab(),
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.folder_copy_rounded, color: AppColors.primaryLight, size: 24),
                  ),
                  const SizedBox(width: 16),
                  Text(
                    'Materials',
                    style: AppTextStyles.headlineMedium.copyWith(
                      color: AppColors.textPrimaryDark,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.refresh_rounded),
                    color: AppColors.textSecondaryDark,
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      matVM.loadMaterials(forceRefresh: true);
                    },
                  ),
                ],
              ),
            ),

            // Search
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              child: CustomTextField(
                controller: _searchCtl,
                hint: 'Search textbooks, slides, notes...',
                prefixIcon: Icons.search_rounded,
                onChanged: matVM.setSearchQuery,
                suffix: _searchCtl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchCtl.clear();
                          matVM.setSearchQuery('');
                        },
                      )
                    : null,
              ),
            ),

            // Segmented Glass Bar for Semesters
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: SizedBox(
                height: 48,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  children: [
                    _buildSegmentedTab('All', matVM.selectedSemester == null, () {
                      HapticFeedback.selectionClick();
                      matVM.setSemester(null);
                    }),
                    ...List.generate(
                      8,
                      (i) => _buildSegmentedTab(
                        'Sem ${i + 1}',
                        matVM.selectedSemester == i + 1,
                        () {
                          HapticFeedback.selectionClick();
                          matVM.setSemester(i + 1);
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Materials grid
            Expanded(
              child: matVM.isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: AppColors.primary),
                    )
                  : matVM.filteredMaterials.isEmpty
                      ? EmptyState(
                          icon: Icons.folder_off_rounded,
                          title: 'No materials found',
                          subtitle: 'Try changing your filters',
                          lottieAsset: 'assets/animations/empty_list.json',
                        )
                      : RefreshIndicator(
                          onRefresh: () => matVM.loadMaterials(forceRefresh: true),
                          color: AppColors.primary,
                          child: GridView.builder(
                            physics: const BouncingScrollPhysics(),
                            padding: const EdgeInsets.fromLTRB(24, 24, 24, 120),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              mainAxisSpacing: 16,
                              crossAxisSpacing: 16,
                              childAspectRatio: 0.68,
                            ),
                            itemCount: matVM.filteredMaterials.length,
                            itemBuilder: (_, i) => _buildEnhancedMaterialCard(matVM.filteredMaterials[i]),
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGlowingFab() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 90),
      child: Container(
        decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.4),
            blurRadius: 20,
            spreadRadius: 2,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: FloatingActionButton.extended(
        onPressed: () {
          HapticFeedback.mediumImpact();
          _showUploadSheet(context);
        },
        icon: const Icon(Icons.cloud_upload_rounded, color: Colors.white),
        label: const Text('Upload', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        focusElevation: 0,
        hoverElevation: 0,
        highlightElevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
      ),
    ));
  }

  Widget _buildSegmentedTab(String label, bool selected, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOutExpo,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            gradient: selected
                ? AppColors.primaryGradient
                : LinearGradient(colors: [Colors.white.withValues(alpha: 0.05), Colors.white.withValues(alpha: 0.05)]),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: selected ? Colors.transparent : Colors.white.withValues(alpha: 0.1),
            ),
            boxShadow: selected
                ? [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.4),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    )
                  ]
                : [],
          ),
          child: Text(
            label,
            style: TextStyle(
              color: selected ? Colors.white : AppColors.textSecondaryDark,
              fontSize: 14,
              fontWeight: selected ? FontWeight.bold : FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
        ),
      ),
    );
  }

  // ─── Enhanced Material Card ───
  Widget _buildEnhancedMaterialCard(MaterialModel material) {
    final ext = material.fileExtension.toUpperCase();
    final icon = _fileIcons[ext] ?? Icons.insert_drive_file_rounded;
    final color = _fileColors[ext] ?? AppColors.primaryLight;
    final auth = context.watch<AuthViewModel>();
    final canVerify = auth.user?.canVerify ?? false;

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        _openMaterial(context, material);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.03),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: material.isVerified
                ? AppColors.success.withValues(alpha: 0.3)
                : Colors.white.withValues(alpha: 0.1),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 20,
              offset: const Offset(0, 10),
            )
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Stack(
              children: [
                // Top Color Bar
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [color, color.withValues(alpha: 0.6)],
                      ),
                    ),
                  ),
                ),

                // Verified shimmer overlay
                if (material.isVerified)
                  Positioned(
                    top: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.15),
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(12),
                        ),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.verified_rounded, color: AppColors.success, size: 12),
                          SizedBox(width: 3),
                          Text(
                            'Verified',
                            style: TextStyle(
                              color: AppColors.success,
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top: Icon and 3-dot menu
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(icon, color: color, size: 22),
                          ),
                          // 3-dot popup menu
                          _buildPopupMenu(context, material, canVerify),
                        ],
                      ),
                      const Spacer(),

                      // Title
                      Text(
                        material.title,
                        style: AppTextStyles.titleMedium.copyWith(
                          color: AppColors.textPrimaryDark,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          height: 1.3,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),

                      // Tags
                      if (material.tagList.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            gradient: AppColors.primaryGradient,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            material.tagList.first.toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 8,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      const SizedBox(height: 10),

                      // Bottom Metadata row
                      Divider(color: Colors.white.withValues(alpha: 0.1), height: 1),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              ext,
                              style: TextStyle(
                                color: color,
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ),
                          const Spacer(),
                          if (material.semester != null) ...[
                            Icon(Icons.school_rounded, size: 12, color: AppColors.textSecondaryDark.withValues(alpha: 0.7)),
                            const SizedBox(width: 3),
                            Text(
                              'S${material.semester}',
                              style: TextStyle(
                                color: AppColors.textSecondaryDark,
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ─── Popup Menu ───
  Widget _buildPopupMenu(BuildContext context, MaterialModel material, bool canVerify) {
    return SizedBox(
      width: 28,
      height: 28,
      child: PopupMenuButton<String>(
        icon: Icon(Icons.more_vert_rounded, color: AppColors.textSecondaryDark, size: 18),
        color: AppColors.cardDark,
        elevation: 8,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        padding: EdgeInsets.zero,
        onSelected: (value) {
          switch (value) {
            case 'open':
              _openMaterial(context, material);
              break;
            case 'download':
              _downloadFile(context, material);
              break;
            case 'verify':
              _toggleVerify(context, material);
              break;
            case 'delete':
              _confirmDelete(context, material);
              break;
          }
        },
        itemBuilder: (_) => [
          _buildMenuItem(Icons.open_in_new_rounded, 'Open', 'open', AppColors.primaryLight),
          _buildMenuItem(Icons.download_rounded, 'Download', 'download', const Color(0xFF06B6D4)),
          if (canVerify)
            _buildMenuItem(
              material.isVerified ? Icons.remove_circle_outline_rounded : Icons.verified_rounded,
              material.isVerified ? 'Unverify' : 'Verify',
              'verify',
              material.isVerified ? AppColors.warning : AppColors.success,
            ),
          _buildMenuItem(Icons.delete_outline_rounded, 'Delete', 'delete', AppColors.error),
        ],
      ),
    );
  }

  PopupMenuEntry<String> _buildMenuItem(IconData icon, String label, String value, Color color) {
    return PopupMenuItem<String>(
      value: value,
      height: 44,
      child: Row(
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 12),
          Text(
            label,
            style: TextStyle(
              color: AppColors.textPrimaryDark,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  void _showUploadSheet(BuildContext context) {
    final titleCtl = TextEditingController();
    final descCtl = TextEditingController();
    final tagsCtl = TextEditingController();
    int? semester;
    PlatformFile? selectedFile;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: EdgeInsets.fromLTRB(
            24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 48, height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                Text(
                  'Upload Material',
                  style: AppTextStyles.headlineSmall.copyWith(color: AppColors.textPrimaryDark),
                ),
                const SizedBox(height: 24),
                
                GestureDetector(
                  onTap: () async {
                    HapticFeedback.mediumImpact();
                    final result = await FilePicker.platform.pickFiles(
                      type: FileType.custom,
                      allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'xls', 'xlsx', 'png', 'jpg', 'jpeg'],
                      withData: true, 
                    );
                    if (result != null && result.files.isNotEmpty) {
                      setSheetState(() {
                        selectedFile = result.files.first;
                      });
                      if (titleCtl.text.isEmpty && selectedFile?.name != null) {
                        setSheetState(() {
                          titleCtl.text = selectedFile!.name;
                        });
                      }
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.upload_file_rounded, color: AppColors.primaryLight, size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            selectedFile != null ? selectedFile!.name : 'Select File (PDF, DOC, PPT, IMG...)',
                            style: TextStyle(
                              color: selectedFile != null ? AppColors.textPrimaryDark : AppColors.textSecondaryDark,
                              fontSize: 14,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: titleCtl,
                  label: 'TITLE',
                  hint: 'Material title',
                  prefixIcon: Icons.title_rounded,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: descCtl,
                  label: 'DESCRIPTION (OPTIONAL)',
                  hint: 'Provide details about this document',
                  maxLines: 2,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: tagsCtl,
                  label: 'TAGS',
                  hint: 'Comma-separated (e.g. math, exam)',
                  prefixIcon: Icons.tag_rounded,
                ),
                const SizedBox(height: 16),
                
                Text(
                  'SEMESTER',
                  style: TextStyle(
                    color: AppColors.textSecondaryDark,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<int>(
                  initialValue: semester,
                  dropdownColor: AppColors.surfaceDark,
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.white.withValues(alpha: 0.05),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: AppColors.primaryLight, width: 2),
                    ),
                  ),
                  items: List.generate(
                    8,
                    (i) => DropdownMenuItem(value: i + 1, child: Text('Semester ${i + 1}')),
                  ),
                  onChanged: (v) => setSheetState(() => semester = v),
                ),
                const SizedBox(height: 32),
                
                Consumer<MaterialsViewModel>(
                  builder: (context, matVM, child) {
                    return GradientButton(
                      text: matVM.isUploading ? 'Uploading...' : 'Submit Material',
                      icon: matVM.isUploading ? null : Icons.cloud_upload_rounded,
                      onPressed: matVM.isUploading ? null : () async {
                        if (titleCtl.text.trim().isEmpty || semester == null || selectedFile == null || selectedFile!.bytes == null) {
                          ScaffoldMessenger.of(ctx).showSnackBar(
                            const SnackBar(content: Text('Please select a file, provide a title and semester.')),
                          );
                          return;
                        }

                        final success = await matVM.uploadMaterial(
                          title: titleCtl.text.trim(),
                          description: descCtl.text.trim().isNotEmpty ? descCtl.text.trim() : null,
                          tags: tagsCtl.text.trim().isNotEmpty ? tagsCtl.text.trim() : null,
                          semester: semester!,
                          fileBytes: selectedFile!.bytes!,
                          fileName: selectedFile!.name,
                        );

                        if (success && ctx.mounted) {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Material uploaded successfully!')),
                          );
                        } else if (!success && ctx.mounted) {
                          ScaffoldMessenger.of(ctx).showSnackBar(
                            SnackBar(content: Text(matVM.error ?? 'Upload failed')),
                          );
                        }
                      },
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}