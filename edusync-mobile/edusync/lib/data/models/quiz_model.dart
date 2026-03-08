class QuizQuestion {
  final String question;
  final List<String> options;
  final String answer;
  final String description;

  QuizQuestion({
    required this.question,
    required this.options,
    required this.answer,
    required this.description,
  });

  factory QuizQuestion.fromJson(Map<String, dynamic> json) {
    return QuizQuestion(
      question: json['Question'] as String? ?? '',
      options: (json['Options'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      answer: json['Answer'] as String? ?? '',
      description: json['Description'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'Question': question,
      'Options': options,
      'Answer': answer,
      'Description': description,
    };
  }
}

class QuizResponse {
  final bool success;
  final List<QuizQuestion> quiz;

  QuizResponse({
    required this.success,
    required this.quiz,
  });

  factory QuizResponse.fromJson(Map<String, dynamic> json) {
    return QuizResponse(
      success: json['success'] as bool? ?? false,
      quiz: (json['quiz'] as List<dynamic>?)
              ?.map((e) => QuizQuestion.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'quiz': quiz.map((e) => e.toJson()).toList(),
    };
  }
}

class QuizResult {
  final List<QuizQuestion> questions;
  final Map<int, String> userAnswers; // questionIndex -> selectedOption
  final int score;

  QuizResult({
    required this.questions,
    required this.userAnswers,
    required this.score,
  });
}
