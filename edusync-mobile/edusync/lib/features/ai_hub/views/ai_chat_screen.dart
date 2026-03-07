import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/gradient_scaffold.dart';
import '../../auth/viewmodels/auth_viewmodel.dart';
import '../viewmodels/ai_hub_viewmodel.dart';
import '../models/ai_message_model.dart';

class AiChatScreen extends StatefulWidget {
  const AiChatScreen({super.key});

  @override
  State<AiChatScreen> createState() => _AiChatScreenState();
}

class _AiChatScreenState extends State<AiChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  bool _isInit = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInit) {
      final auth = context.read<AuthViewModel>();
      final uid = auth.user?.id ?? 'guest';
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.read<AiHubViewModel>().initChatSession('user_$uid');
      });
      _isInit = true;
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        0.0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  Future<void> _pickAndUploadDocuments(BuildContext context, AiHubViewModel vm, AuthViewModel auth) async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
      allowMultiple: true,
    );

    if (result != null) {
      if (result.files.isNotEmpty && context.mounted) {
        final userId = auth.user?.id.toString() ?? 'guest';
        await vm.uploadChatDocuments(userId, result.files);
        _scrollToBottom();
      }
    }
  }

  void _sendMessage(AiHubViewModel vm) {
    final text = _messageController.text;
    if (text.trim().isNotEmpty) {
      vm.sendMessage(text);
      _messageController.clear();
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    final aiVM = context.watch<AiHubViewModel>();
    final authVM = context.watch<AuthViewModel>();

    return GradientScaffold(
      showOrbs: false,
      appBar: AppBar(
        title: Column(
          children: [
            const Text('AI Assistant', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            Text('Document RAG Chat', style: TextStyle(fontSize: 12, color: AppColors.textSecondaryDark.withValues(alpha: 0.7))),
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.upload_file_rounded),
            color: AppColors.primary,
            onPressed: aiVM.isUploadingDocs || aiVM.isChatLoading ? null : () => _pickAndUploadDocuments(context, aiVM, authVM),
            tooltip: 'Upload PDFs',
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          if (aiVM.isUploadingDocs)
            const LinearProgressIndicator(color: AppColors.primary, backgroundColor: Colors.transparent),
          
          if (aiVM.error != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: AppColors.error.withValues(alpha: 0.1),
              child: Row(
                children: [
                  const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 20),
                  const SizedBox(width: 8),
                  Expanded(child: Text(aiVM.error!, style: const TextStyle(color: AppColors.error, fontSize: 13))),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: AppColors.error, size: 16),
                    onPressed: () => aiVM.clearError(),
                  ),
                ],
              ),
            ),

          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              reverse: true,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              physics: const BouncingScrollPhysics(),
              itemCount: aiVM.chatHistory.length,
              itemBuilder: (context, index) {
                final messages = aiVM.chatHistory.reversed.toList();
                final msg = messages[index];
                return _buildMessageBubble(msg);
              },
            ),
          ),

          if (aiVM.isChatLoading)
             Padding(
               padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 24.0),
               child: Row(
                 mainAxisAlignment: MainAxisAlignment.start,
                 children: [
                   const SizedBox(
                     width: 16, height: 16,
                     child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryLight),
                   ),
                   const SizedBox(width: 12),
                   Text('Thinking...', style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 13, fontStyle: FontStyle.italic)),
                 ],
               ),
             ),

          _buildChatInput(aiVM),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(AiChatMessage msg) {
    final bool isMe = msg.isUser;
    final timeStr = DateFormat('HH:mm').format(msg.timestamp);

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (!isMe) ...[
                Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF6C63FF), Color(0xFF8B5CF6)]),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(color: const Color(0xFF6C63FF).withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 16),
                ),
              ],
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isMe ? AppColors.primary : AppColors.surfaceDark,
                    border: isMe ? null : Border.all(color: Colors.white.withValues(alpha: 0.05)),
                    borderRadius: BorderRadius.circular(20).copyWith(
                      bottomRight: isMe ? const Radius.circular(4) : null,
                      bottomLeft: !isMe ? const Radius.circular(4) : null,
                    ),
                  ),
                  child: isMe 
                      ? Text(msg.text, style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.4))
                      : MarkdownBody(
                          data: msg.text,
                          styleSheet: MarkdownStyleSheet(
                            p: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 14, height: 1.5),
                            code: TextStyle(color: AppColors.primaryLight, backgroundColor: Colors.black26, fontFamily: 'monospace'),
                            codeblockDecoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(8)),
                            listBullet: const TextStyle(color: AppColors.primaryLight),
                          ),
                          selectable: true,
                        ),
                ),
              ),
              if (isMe) const SizedBox(width: 32), // Spacer to balance avatar on left
            ],
          ),
          const SizedBox(height: 4),
          Padding(
            padding: EdgeInsets.only(left: isMe ? 0 : 44, right: isMe ? 4 : 0),
            child: Text(
              timeStr,
              style: TextStyle(color: AppColors.textSecondaryDark.withValues(alpha: 0.5), fontSize: 10, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChatInput(AiHubViewModel vm) {
    return Container(
      padding: const EdgeInsets.all(16).copyWith(bottom: 24),
      decoration: BoxDecoration(
        color: AppColors.backgroundDark,
        border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.05))),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _messageController,
                            maxLines: 4,
                            minLines: 1,
                            style: const TextStyle(color: Colors.white, fontSize: 15),
                            decoration: InputDecoration(
                              hintText: 'Ask about your documents...',
                              hintStyle: TextStyle(color: AppColors.textSecondaryDark.withValues(alpha: 0.6)),
                              border: InputBorder.none,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            ),
                          ),
                        ),
                        Container(
                          margin: const EdgeInsets.only(right: 6, bottom: 6),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [Color(0xFF6C63FF), Color(0xFF8B5CF6)]),
                            shape: BoxShape.circle,
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.arrow_upward_rounded, color: Colors.white, size: 20),
                            onPressed: vm.isChatLoading ? null : () => _sendMessage(vm),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
