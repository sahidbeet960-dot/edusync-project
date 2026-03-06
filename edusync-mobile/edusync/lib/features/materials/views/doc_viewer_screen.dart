import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

/// In-app viewer for DOC, DOCX, PPT, PPTX, XLS, XLSX files
/// Uses Google Docs Viewer to render documents from public Cloudinary URLs
class DocViewerScreen extends StatefulWidget {
  final String docUrl;
  final String title;

  const DocViewerScreen({
    super.key,
    required this.docUrl,
    required this.title,
  });

  @override
  State<DocViewerScreen> createState() => _DocViewerScreenState();
}

class _DocViewerScreenState extends State<DocViewerScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    final encodedUrl = Uri.encodeComponent(widget.docUrl);
    final viewerUrl = 'https://docs.google.com/gview?embedded=true&url=$encodedUrl';

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(AppColors.backgroundDark)
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (_) {
          if (mounted) {
            setState(() => _isLoading = true);
          }
        },
        onPageFinished: (_) {
          if (mounted) {
            setState(() => _isLoading = false);
          }
        },
        onWebResourceError: (_) {
          if (mounted) {
            setState(() {
              _hasError = true;
              _isLoading = false;
            });
          }
        },
      ))
      ..loadRequest(Uri.parse(viewerUrl));
  }

  Future<void> _launchExternal() async {
    final uri = Uri.parse(widget.docUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        title: Text(
          widget.title,
          style: AppTextStyles.titleMedium.copyWith(color: AppColors.textPrimaryDark),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        backgroundColor: AppColors.surfaceDark,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.textPrimaryDark),
        actions: [
          IconButton(
            icon: const Icon(Icons.open_in_browser_rounded),
            tooltip: 'Open in Browser',
            onPressed: _launchExternal,
          ),
          IconButton(
            icon: const Icon(Icons.download_rounded),
            tooltip: 'Download',
            onPressed: _launchExternal,
          ),
        ],
      ),
      body: Stack(
        children: [
          if (_hasError)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.error.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 48),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Could not load document',
                      style: AppTextStyles.titleMedium.copyWith(color: AppColors.textPrimaryDark),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Try opening it in your browser instead',
                      style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondaryDark),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _launchExternal,
                      icon: const Icon(Icons.open_in_browser_rounded),
                      label: const Text('Open in Browser'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
        ],
      ),
    );
  }
}
