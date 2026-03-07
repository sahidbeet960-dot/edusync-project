import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class TxtViewerScreen extends StatefulWidget {
  final String txtUrl;
  final String title;

  const TxtViewerScreen({
    super.key,
    required this.txtUrl,
    required this.title,
  });

  @override
  State<TxtViewerScreen> createState() => _TxtViewerScreenState();
}

class _TxtViewerScreenState extends State<TxtViewerScreen> {
  String? _content;
  String? _error;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchText();
  }

  Future<void> _fetchText() async {
    try {
      final response = await http.get(Uri.parse(widget.txtUrl));
      if (response.statusCode == 200) {
        setState(() {
          _content = utf8.decode(response.bodyBytes);
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = 'Failed to load text document (Status ${response.statusCode})';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to load document. Make sure you have an internet connection.';
        _isLoading = false;
      });
    }
  }

  Future<void> _launchExternal() async {
    final uri = Uri.parse(widget.txtUrl);
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
            icon: const Icon(Icons.download_rounded),
            tooltip: 'Download / Open in Browser',
            onPressed: _launchExternal,
          ),
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
        : _error != null
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 48),
                      const SizedBox(height: 16),
                      Text(
                        _error!, 
                        style: AppTextStyles.bodyMedium.copyWith(color: AppColors.error),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: _fetchText,
                        icon: const Icon(Icons.refresh_rounded),
                        label: const Text('Try Again'),
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                      )
                    ],
                  ),
                ),
              )
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                physics: const BouncingScrollPhysics(),
                child: Text(
                  _content ?? '',
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: AppColors.textPrimaryDark, 
                    height: 1.6,
                    fontFamily: 'RobotoMono', // Monospace font for txt looks cleaner
                  ),
                ),
              ),
    );
  }
}
