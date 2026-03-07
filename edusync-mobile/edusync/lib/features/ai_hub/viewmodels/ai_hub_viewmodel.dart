
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../repositories/ai_repository.dart';
import '../models/ai_message_model.dart';
import '../models/infograph_models.dart';

class AiHubViewModel extends ChangeNotifier {
  final AiRepository _repo;

  AiHubViewModel({AiRepository? repo}) : _repo = repo ?? AiRepository();

  // --- Common State ---
  String? _error;
  String? get error => _error;

  void clearError() {
    _error = null;
    notifyListeners();
  }

  // --- RAG Chat State ---
  bool _isChatLoading = false;
  bool get isChatLoading => _isChatLoading;

  bool _isUploadingDocs = false;
  bool get isUploadingDocs => _isUploadingDocs;

  final List<AiChatMessage> _chatHistory = [];
  List<AiChatMessage> get chatHistory => List.unmodifiable(_chatHistory);

  String _currentChatNamespace = '';
  String get currentChatNamespace => _currentChatNamespace;

  String? _chatSessionId;

  // Initialize a new chat session
  void initChatSession(String namespace) {
    _currentChatNamespace = namespace;
    _chatSessionId = DateTime.now().millisecondsSinceEpoch.toString();
    _chatHistory.clear();
    _chatHistory.add(AiChatMessage(
      text: "Hello! I'm your EduSync assistant. I can answer questions based on the documents you upload to this topic.",
      isUser: false,
      timestamp: DateTime.now(),
    ));
    notifyListeners();
  }

  Future<bool> uploadChatDocuments(String userId, List<PlatformFile> files) async {
    if (_currentChatNamespace.isEmpty) return false;
    
    _isUploadingDocs = true;
    _error = null;
    notifyListeners();

    try {
      final count = await _repo.uploadForChat(
        files: files,
        userId: userId,
        namespace: _currentChatNamespace,
      );
      
      _chatHistory.add(AiChatMessage(
        text: "Successfully uploaded and processed $count document(s). I am ready to answer your questions!",
        isUser: false,
        timestamp: DateTime.now(),
      ));
      
      _isUploadingDocs = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Failed to upload documents: $e';
      _isUploadingDocs = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty || _chatSessionId == null) return;

    final userMsg = AiChatMessage(
      text: text.trim(),
      isUser: true,
      timestamp: DateTime.now(),
    );
    _chatHistory.add(userMsg);
    
    _isChatLoading = true;
    _error = null;
    notifyListeners();

    try {
      final responseHtml = await _repo.chatWithDocuments(
        userMessage: text.trim(),
        namespace: _currentChatNamespace,
        sessionId: _chatSessionId!,
      );

      _chatHistory.add(AiChatMessage(
        text: responseHtml,
        isUser: false,
        timestamp: DateTime.now(),
      ));
    } catch (e) {
      _error = 'Failed to get a response: $e';
      _chatHistory.add(AiChatMessage(
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: DateTime.now(),
      ));
    } finally {
      _isChatLoading = false;
      notifyListeners();
    }
  }


  // --- Infographs State ---
  bool _isGeneratingInfographs = false;
  bool get isGeneratingInfographs => _isGeneratingInfographs;

  HeatmapData? _heatmapData;
  HeatmapData? get heatmapData => _heatmapData;

  PieChartData? _pieChartData;
  PieChartData? get pieChartData => _pieChartData;

  String _currentInfographsNamespace = '';
  
  void initInfographsSession(String namespace) {
    _currentInfographsNamespace = namespace;
    _heatmapData = null;
    _pieChartData = null;
    _error = null;
    notifyListeners();
  }

  Future<bool> generateInfographs(String userId, List<PlatformFile> files) async {
    if (_currentInfographsNamespace.isEmpty) return false;

    _isGeneratingInfographs = true;
    _error = null;
    notifyListeners();

    try {
      // 1. Upload files
      final documentId = await _repo.uploadForInfographs(
        files: files,
      );

      // 2. Fetch Heatmap
      _heatmapData = await _repo.getHeatmapData(documentId);

      // 3. Fetch Pie Chart
      _pieChartData = await _repo.getPieChartData(documentId);

      _isGeneratingInfographs = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Failed to generate infographs: $e';
      _isGeneratingInfographs = false;
      notifyListeners();
      return false;
    }
  }

  // --- Summarization State ---
  bool _isGeneratingSummary = false;
  bool get isGeneratingSummary => _isGeneratingSummary;

  String? _summaryText;
  String? get summaryText => _summaryText;

  void initSummarySession() {
    _summaryText = null;
    _error = null;
    notifyListeners();
  }

  Future<bool> generateSummary(List<PlatformFile> files) async {
    _isGeneratingSummary = true;
    _error = null;
    notifyListeners();

    try {
      // 1. Upload files to summary endpoint
      final documentId = await _repo.uploadForSummary(
        files: files,
      );

      // 2. Fetch Summary text
      _summaryText = await _repo.generateSummary(documentId);

      _isGeneratingSummary = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Failed to generate summary: ${e.toString()}';
      _isGeneratingSummary = false;
      notifyListeners();
      return false;
    }
  }
}
