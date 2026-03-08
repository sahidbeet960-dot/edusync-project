import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/avatar_widget.dart';
import '../../../core/widgets/promo_slider.dart';
import '../../../core/widgets/gradient_scaffold.dart';
import '../../auth/viewmodels/auth_viewmodel.dart';
import '../../home/viewmodels/home_viewmodel.dart';
import '../viewmodels/dashboard_viewmodel.dart';
import '../../materials/viewmodels/materials_viewmodel.dart';
import '../../../data/models/academic_event_model.dart';
import '../../../data/models/material_model.dart';
import '../../materials/views/pdf_viewer_screen.dart';
import '../../materials/views/txt_viewer_screen.dart';
import '../../materials/views/doc_viewer_screen.dart';
import '../../materials/views/image_viewer_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  // ─── File type maps ───
  static const _fileIcons = {
    'PDF': Icons.picture_as_pdf_rounded,
    'DOC': Icons.description_rounded,
    'DOCX': Icons.description_rounded,
    'PPT': Icons.slideshow_rounded,
    'PPTX': Icons.slideshow_rounded,
    'TXT': Icons.article_rounded,
    'XLS': Icons.table_chart_rounded,
    'XLSX': Icons.table_chart_rounded,
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

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<DashboardViewModel>().loadDashboard();
    });
  }

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
      final uri = Uri.parse(material.fileUrl);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
      } else if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open file')),
        );
      }
    }
  }

  Future<void> _downloadFile(BuildContext context, MaterialModel material) async {
    try {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const SizedBox(
                width: 18, height: 18,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
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
      final savePath = '${dir.path}/$sanitizedTitle.$ext';
      await Dio().download(material.fileUrl, savePath);

      if (context.mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 20),
                const SizedBox(width: 12),
                Expanded(child: Text('Downloaded: $sanitizedTitle.$ext')),
              ],
            ),
            backgroundColor: AppColors.surfaceDark,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } catch (e) {
      final uri = Uri.parse(material.fileUrl);
      final canLaunch = await canLaunchUrl(uri);
      
      if (context.mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        if (canLaunch) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Download failed.')),
          );
        }
      }
    }
  }

  Future<void> _toggleVerify(BuildContext context, MaterialModel material) async {
    final matVM = context.read<MaterialsViewModel>();
    final dashboardVM = context.read<DashboardViewModel>();
    final scaffoldMsgr = ScaffoldMessenger.of(context);
    
    bool success;
    if (material.isVerified) {
      success = await matVM.unverifyMaterial(material.id);
    } else {
      success = await matVM.verifyMaterial(material.id);
    }
    if (success) {
      HapticFeedback.mediumImpact();
      // Reload dashboard to reflect changes
      dashboardVM.loadDashboard(forceRefresh: true);
      scaffoldMsgr.showSnackBar(
        SnackBar(
          content: Text(material.isVerified ? 'Material unverified' : 'Material verified ✓'),
          backgroundColor: AppColors.surfaceDark,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

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
              child: Text('Delete Material',
                style: AppTextStyles.titleLarge.copyWith(color: AppColors.textPrimaryDark)),
            ),
          ],
        ),
        content: Text(
          'Delete "${material.title}"? This cannot be undone.',
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondaryDark),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondaryDark)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error, elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final matVM = context.read<MaterialsViewModel>();
      final dashboardVM = context.read<DashboardViewModel>();
      final success = await matVM.deleteMaterial(material.id);
      if (success) {
        dashboardVM.loadDashboard(forceRefresh: true);
      }
    }
  }

  Future<void> _confirmLogout(BuildContext context, AuthViewModel auth) async {
    HapticFeedback.mediumImpact();
    final bool? confirm = await showDialog<bool>(
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
              child: const Icon(Icons.logout_rounded, color: AppColors.error),
            ),
            const SizedBox(width: 12),
            Text('Sign Out', style: AppTextStyles.titleLarge.copyWith(color: AppColors.textPrimaryDark)),
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
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Yes, Sign Out', style: TextStyle(fontWeight: FontWeight.bold)),
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
    final dashboard = context.watch<DashboardViewModel>();

    return GradientScaffold(
      body: RefreshIndicator(
        onRefresh: () => dashboard.loadDashboard(forceRefresh: true),
        color: AppColors.primary,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
          slivers: [
            SliverToBoxAdapter(
              child: _buildHeroSection(context, dashboard),
            ),

            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const SizedBox(height: 12),
                  const PromoSlider(),
                  const SizedBox(height: 28),

                  _buildQuickActions(context),
                  const SizedBox(height: 36),

                  _buildDataHeader('Upcoming Events', dashboard.upcomingEvents.length),
                  const SizedBox(height: 16),
                  if (dashboard.isLoading)
                    _buildShimmerList()
                  else if (dashboard.upcomingEvents.isEmpty)
                    _buildActionableEmptyState(
                      context,
                      title: "You're all caught up 🎉",
                      subtitle: "Create your first event to stay organized.",
                      btnText: "Add Event",
                      icon: Icons.event_available_rounded,
                      onTap: () => context.read<HomeViewModel>().setIndex(1),
                    )
                  else
                    ...dashboard.upcomingEvents.map((e) => _buildEventCard(e)),
                  
                  const SizedBox(height: 36),

                  _buildDataHeader('Recent Materials', dashboard.recentMaterials.length),
                  const SizedBox(height: 16),
                  if (dashboard.isLoading)
                    _buildShimmerList()
                  else if (dashboard.recentMaterials.isEmpty)
                    _buildActionableEmptyState(
                      context,
                      title: "Your vault is empty",
                      subtitle: "Upload notes to earn points and help peers.",
                      btnText: "Upload Material",
                      icon: Icons.cloud_upload_outlined,
                      onTap: () => context.read<HomeViewModel>().setIndex(2),
                    )
                  else
                    SizedBox(
                      height: 230, 
                      child: ListView.separated(
                        physics: const BouncingScrollPhysics(),
                        scrollDirection: Axis.horizontal,
                        itemCount: dashboard.recentMaterials.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 16),
                        itemBuilder: (_, i) => _buildModernMaterialCard(dashboard.recentMaterials[i]),
                      ),
                    ),
                  
                  const SizedBox(height: 100),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroSection(BuildContext context, DashboardViewModel dashboard) {
    final auth = context.watch<AuthViewModel>();
    final firstName = auth.user?.fullName.split(' ').first ?? 'Student';
    
    String subtitle = "Let's learn something today.";
    if (dashboard.upcomingEvents.isNotEmpty) {
      subtitle = "You have ${dashboard.upcomingEvents.length} events coming up.";
    }

    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 20, 24, 10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${_greeting()}, $firstName 👋',
                    style: AppTextStyles.headlineMedium.copyWith(
                      color: AppColors.textPrimaryDark,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    subtitle,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.textSecondaryDark,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            
            Row(
              children: [
                GestureDetector(
                  onTap: () {
                    HapticFeedback.selectionClick();
                    context.push('/profile');
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.surfaceDark.withValues(alpha: 0.6),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withValues(alpha: 0.08), width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ClipOval(
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                        child: Padding(
                           padding: const EdgeInsets.all(4.0),
                           child: Stack(
                            alignment: Alignment.center,
                            children: [
                              const SizedBox(
                                width: 44,
                                height: 44,
                                child: CircularProgressIndicator(
                                  value: 0.7,
                                  strokeWidth: 2.5,
                                  color: AppColors.primary,
                                  backgroundColor: Colors.transparent,
                                ),
                              ),
                              AvatarWidget(
                                name: auth.user?.fullName ?? '',
                                size: 36,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () => _confirmLogout(context, auth),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceDark.withValues(alpha: 0.6),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withValues(alpha: 0.08), width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.error.withValues(alpha: 0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ClipOval(
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                        child: const Icon(
                          Icons.logout_rounded,
                          color: AppColors.error,
                          size: 24,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      _QuickAction('AI Hub', Icons.auto_awesome_rounded, const Color(0xFF6C63FF), () => context.push('/ai')),
      _QuickAction('Study Room', Icons.groups_rounded, const Color(0xFF00D9A6), () => context.read<HomeViewModel>().setIndex(4)),
      _QuickAction('Materials', Icons.folder_rounded, const Color(0xFFFFBE0B), () => context.read<HomeViewModel>().setIndex(2)),
      _QuickAction('Ask', Icons.forum_rounded, const Color(0xFFE040FB), () => context.read<HomeViewModel>().setIndex(3)),
    ];

    return Row(
      children: actions.map((a) => Expanded(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 5),
          child: _TactileCard(
            onTap: a.onTap,
            color: a.themeColor.withValues(alpha: 0.1),
            borderColor: a.themeColor.withValues(alpha: 0.25),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: a.themeColor.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(a.icon, color: a.themeColor, size: 24),
                ),
                const SizedBox(height: 10),
                Text(
                  a.label,
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.textPrimaryDark,
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                ),
              ],
            ),
          ),
        ),
      )).toList(),
    );
  }

  Widget _buildDataHeader(String title, int count) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              title,
              style: AppTextStyles.titleLarge.copyWith(
                color: AppColors.textPrimaryDark,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.3,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                count.toString(),
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                ),
              ),
            ),
            const Spacer(),
            Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textSecondaryDark.withValues(alpha: 0.5)),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          height: 3,
          width: 40,
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
      ],
    );
  }

  Widget _buildEventCard(AcademicEventModel event) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: _TactileCard(
        onTap: () {},
        color: AppColors.primary.withValues(alpha: 0.1),
        borderColor: AppColors.primary.withValues(alpha: 0.2),
        child: Row(
          children: [
            Container(
              width: 4,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (event.location != null) ...[
                    Text(
                      event.location!.toUpperCase(),
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                  ],
                  Text(
                    event.title,
                    style: AppTextStyles.titleMedium.copyWith(
                      color: AppColors.textPrimaryDark,
                      fontWeight: FontWeight.w700,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.surfaceDark,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    DateFormat('MMM d').format(event.eventDate),
                    style: AppTextStyles.labelLarge.copyWith(color: AppColors.textPrimaryDark),
                  ),
                  Text(
                    DateFormat('h:mm a').format(event.eventDate),
                    style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondaryDark, fontSize: 10),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Modern Material Card (Dashboard) ───
  Widget _buildModernMaterialCard(MaterialModel material) {
    final ext = material.fileExtension.toUpperCase();
    final icon = _fileIcons[ext] ?? Icons.insert_drive_file_rounded;
    final color = _fileColors[ext] ?? AppColors.primaryLight;
    final auth = context.watch<AuthViewModel>();
    final canVerify = auth.user?.canVerify ?? false;

    return SizedBox(
      width: 175,
      child: _TactileCard(
        onTap: () => _openMaterial(context, material), 
        color: Colors.white.withValues(alpha: 0.03),
        borderColor: material.isVerified
            ? AppColors.success.withValues(alpha: 0.3)
            : Colors.white.withValues(alpha: 0.1),
        padding: const EdgeInsets.all(14),
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(icon, color: color, size: 20),
                    ),
                    // 3-dot popup menu
                    SizedBox(
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
                    ),
                  ],
                ),
                const Spacer(),
                if (material.tagList.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      material.tagList.first.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 8,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 6),
                ],
                Text(
                  material.title,
                  style: AppTextStyles.titleMedium.copyWith(
                    color: AppColors.textPrimaryDark,
                    fontWeight: FontWeight.w700,
                    height: 1.2,
                    fontSize: 13,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
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
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    const Spacer(),
                    if (material.isVerified)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.verified_rounded, color: AppColors.success, size: 10),
                            SizedBox(width: 2),
                            Text(
                              'Verified',
                              style: TextStyle(
                                color: AppColors.success,
                                fontSize: 8,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ],
        ),
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

  Widget _buildActionableEmptyState(
    BuildContext context, {
    required String title,
    required String subtitle,
    required String btnText,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
      decoration: BoxDecoration(
        color: AppColors.surfaceDark.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
          )
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 32, color: AppColors.primary),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: AppTextStyles.titleMedium.copyWith(color: AppColors.textPrimaryDark, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondaryDark),
          ),
          const SizedBox(height: 24),
          InkWell(
            onTap: () {
              HapticFeedback.lightImpact();
              onTap();
            },
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: Text(btnText, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerList() {
    return Column(
      children: List.generate(
        3,
        (_) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.surfaceDark,
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }
}

class _TactileCard extends StatefulWidget {
  final Widget child;
  final VoidCallback onTap;
  final EdgeInsetsGeometry? padding;
  final Color? color;
  final Color? borderColor;
  final List<BoxShadow>? boxShadow;

  const _TactileCard({
    required this.child, 
    required this.onTap, 
    this.padding,
    this.color,
    this.borderColor,
    this.boxShadow,
  });

  @override
  State<_TactileCard> createState() => _TactileCardState();
}

class _TactileCardState extends State<_TactileCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) {
        setState(() => _isPressed = false);
        HapticFeedback.selectionClick();
        widget.onTap();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeInOut,
        transform: Matrix4.diagonal3Values(_isPressed ? 0.96 : 1.0, _isPressed ? 0.96 : 1.0, 1.0),
        padding: widget.padding ?? const EdgeInsets.symmetric(vertical: 20, horizontal: 8),
        decoration: BoxDecoration(
          color: widget.color ?? AppColors.cardDark.withValues(alpha: 0.9),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: widget.borderColor ?? Colors.white.withValues(alpha: 0.1), 
            width: 1.5,
          ),
          boxShadow: widget.boxShadow ?? [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.1),
              blurRadius: 24,
              offset: const Offset(0, 8),
              spreadRadius: -4,
            ),
          ],
        ),
        child: widget.child,
      ),
    );
  }
}

class _QuickAction {
  final String label;
  final IconData icon;
  final Color themeColor;
  final VoidCallback onTap;

  _QuickAction(this.label, this.icon, this.themeColor, this.onTap);
}