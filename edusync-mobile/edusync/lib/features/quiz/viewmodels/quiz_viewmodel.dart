import 'package:flutter/material.dart';
import '../../../data/models/quiz_model.dart';
import '../../../data/repositories/quiz_repository.dart';
import '../../../core/network/api_exceptions.dart';

enum QuizState { initial, generating, active, error, completed }

class QuizViewModel extends ChangeNotifier {
  final QuizRepository _quizRepo = QuizRepository();

  QuizState _state = QuizState.initial;
  String? _error;
  
  List<QuizQuestion> _questions = [];
  Map<int, String> _userAnswers = {}; // Mapping question index -> selected Option
  int _currentQuestionIndex = 0;
  int _score = 0;

  // Getters
  QuizState get state => _state;
  String? get error => _error;
  List<QuizQuestion> get questions => _questions;
  int get currentQuestionIndex => _currentQuestionIndex;
  QuizQuestion? get currentQuestion => _questions.isNotEmpty ? _questions[_currentQuestionIndex] : null;
  Map<int, String> get userAnswers => _userAnswers;
  int get score => _score;
  int get totalQuestions => _questions.length;
  
  bool get isGenerating => _state == QuizState.generating;
  bool get isActive => _state == QuizState.active;

  /// Initiate quiz generation
  Future<void> generateQuiz(List<String> fileUrls, int numQuestions) async {
    _state = QuizState.generating;
    _error = null;
    _questions = [];
    _userAnswers = {};
    _currentQuestionIndex = 0;
    _score = 0;
    notifyListeners();

    try {
      final response = await _quizRepo.generateQuiz(
        urls: fileUrls,
        numQuestions: numQuestions,
      );

      if (response.success && response.quiz.isNotEmpty) {
        _questions = response.quiz;
        _state = QuizState.active;
      } else {
        _error = "Failed to generate quiz questions.";
        _state = QuizState.error;
      }
    } on ApiException catch (e) {
      _error = e.message;
      _state = QuizState.error;
    } catch (e) {
      _error = 'An unexpected error occurred. Please try again.';
      _state = QuizState.error;
    }
    notifyListeners();
  }

  /// Select an answer for the current question
  void selectAnswer(String option) {
    if (_state != QuizState.active) return;
    _userAnswers[_currentQuestionIndex] = option;
    notifyListeners();
  }

  /// Go to previous question
  void previousQuestion() {
    if (_currentQuestionIndex > 0) {
      _currentQuestionIndex--;
      notifyListeners();
    }
  }

  /// Go to next question, or finish if it's the last one
  void nextQuestion() {
    if (_currentQuestionIndex < _questions.length - 1) {
      _currentQuestionIndex++;
      notifyListeners();
    }
  }

  /// Finish Quiz and Calculate Score
  void submitQuiz() {
    if (_state != QuizState.active) return;
    
    _score = 0;
    for (int i = 0; i < _questions.length; i++) {
      if (_userAnswers[i] == _questions[i].answer) {
        _score++;
      }
    }
    _state = QuizState.completed;
    notifyListeners();
  }

  /// Return a QuizResult object (useful for passing to the Analysis screen)
  QuizResult getResult() {
    return QuizResult(
      questions: _questions,
      userAnswers: _userAnswers,
      score: _score,
    );
  }

  /// Reset the QuizViewModel to initial state
  void reset() {
    _state = QuizState.initial;
    _error = null;
    _questions = [];
    _userAnswers = {};
    _currentQuestionIndex = 0;
    _score = 0;
    notifyListeners();
  }
}
