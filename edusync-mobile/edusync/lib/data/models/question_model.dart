class QuestionModel {
  final String id;
  final String title;
  final String content;
  final String authorId;
  final String? authorName;
  final String? fileUrl; // Added fileUrl
  final DateTime createdAt;
  final int answerCount;
  final List<AnswerModel> answers;

  QuestionModel({
    required this.id,
    required this.title,
    required this.content,
    required this.authorId,
    this.authorName,
    this.fileUrl,
    required this.createdAt,
    this.answerCount = 0,
    this.answers = const [],
  });

  factory QuestionModel.fromJson(Map<String, dynamic> json) {
    List<AnswerModel> answers = [];
    if (json['answers'] != null) {
      answers = (json['answers'] as List)
          .map((a) => AnswerModel.fromJson(a))
          .toList();
    }

    return QuestionModel(
      id: json['id'].toString(),
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      authorId: json['author_id']?.toString() ?? '',
      authorName: json['author_name'],
      fileUrl: json['file_url'], // Map file_url
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      answerCount: json['answer_count'] ?? answers.length,
      answers: answers,
    );
  }

  Map<String, dynamic> toJson() => {
        'title': title,
        'content': content,
      };

  /// Safely extracts the file extension from the [fileUrl]
  String get fileExtension {
    if (fileUrl == null || fileUrl!.isEmpty) return '';
    try {
      final uri = Uri.parse(fileUrl!);
      if (uri.pathSegments.isNotEmpty) {
        final lastSegment = uri.pathSegments.last;
        if (lastSegment.contains('.')) {
          final ext = lastSegment.split('.').last.toUpperCase();
          if (ext.length <= 4 && RegExp(r'^[A-Z0-9]+$').hasMatch(ext)) {
            return ext;
          }
        }
      }
      return 'FILE';
    } catch (_) {
      return 'FILE';
    }
  }

  /// Checks if the attached file is an image
  bool get isImage {
    final ext = fileExtension;
    return ['PNG', 'JPG', 'JPEG'].contains(ext);
  }
}

class AnswerModel {
  final String id;
  final String questionId;
  final String authorId;
  final String? authorName;
  final String? authorRole;
  final String content;
  final int upvotes;
  final int downvotes;
  final bool isProfessorVerified;
  final DateTime createdAt;

  AnswerModel({
    required this.id,
    required this.questionId,
    required this.authorId,
    this.authorName,
    this.authorRole,
    required this.content,
    this.upvotes = 0,
    this.downvotes = 0,
    this.isProfessorVerified = false,
    required this.createdAt,
  });

  factory AnswerModel.fromJson(Map<String, dynamic> json) {
    return AnswerModel(
      id: json['id'].toString(),
      questionId: json['question_id']?.toString() ?? '',
      authorId: json['author_id']?.toString() ?? '',
      authorName: json['author_name'],
      authorRole: json['author_role'],
      content: json['content'] ?? '',
      upvotes: json['upvotes'] ?? 0,
      downvotes: json['downvotes'] ?? 0,
      isProfessorVerified: json['is_professor_verified'] ?? false,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'content': content,
      };

  int get score => upvotes - downvotes;
}
