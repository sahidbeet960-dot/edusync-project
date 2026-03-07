import 'package:flutter/material.dart';
import '../../../data/models/question_model.dart';
import '../../../data/repositories/forum_repository.dart';

class ForumViewModel extends ChangeNotifier {
  final ForumRepository _repo = ForumRepository();

  bool _isLoading = false;
  bool _hasLoaded = false;
  List<QuestionModel> _questions = [];
  QuestionModel? _selectedQuestion;
  List<AnswerModel> _answers = [];
  String? _error;
  String _searchQuery = '';

  bool get isLoading => _isLoading;
  List<QuestionModel> get questions => _questions;
  QuestionModel? get selectedQuestion => _selectedQuestion;
  List<AnswerModel> get answers => _answers;
  String? get error => _error;

  List<QuestionModel> get filteredQuestions {
    if (_searchQuery.isEmpty) return _questions;
    final query = _searchQuery.toLowerCase();
    return _questions.where((q) {
      return q.title.toLowerCase().contains(query) ||
          q.content.toLowerCase().contains(query);
    }).toList();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<void> loadQuestions({bool forceRefresh = false}) async {
    if (_hasLoaded && !forceRefresh) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _questions = await _repo.getQuestions();
      _hasLoaded = true;
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Load question detail — answers come nested in the response
  Future<void> loadQuestionDetail(String id) async {
    _isLoading = true;
    notifyListeners();

    try {
      _selectedQuestion = await _repo.getQuestion(id);
      _answers = _selectedQuestion?.answers ?? [];
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createQuestion({
    required String title,
    required String content,
  }) async {
    try {
      final question = await _repo.createQuestion(
        title: title,
        content: content,
      );
      _questions.insert(0, question);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> createAnswer({
    required String questionId,
    required String content,
  }) async {
    try {
      final answer = await _repo.createAnswer(
        questionId: questionId,
        content: content,
      );
      _answers.add(answer);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Vote on an answer: 1 = upvote, -1 = downvote, 0 = remove
  Future<void> vote(String answerId, int voteValue) async {
    try {
      await _repo.vote(answerId, voteValue);
      // Refresh to get updated vote counts
      if (_selectedQuestion != null) {
        await loadQuestionDetail(_selectedQuestion!.id);
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }
}
