import 'package:dio/dio.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../models/question_model.dart';

class ForumRepository {
  final ApiClient _api = ApiClient();

  /// GET /api/v1/forum/questions — list all questions (no auth required)
  Future<List<QuestionModel>> getQuestions() async {
    final response = await _api.get(ApiConstants.forumQuestions);
    final List data =
        response.data is List ? response.data : response.data['items'] ?? [];
    return data.map((json) => QuestionModel.fromJson(json)).toList();
  }

  /// GET /api/v1/forum/questions/{id} — question detail with nested answers
  Future<QuestionModel> getQuestion(String id) async {
    final response = await _api.get(ApiConstants.forumQuestionDetail(id));
    return QuestionModel.fromJson(response.data);
  }

  /// POST /api/v1/forum/questions — ask a question
  Future<QuestionModel> createQuestion({
    required String title,
    required String content,
    List<int>? fileBytes,
    String? fileName,
  }) async {
    dynamic requestData;

    if (fileBytes != null && fileName != null) {
      requestData = FormData.fromMap({
        'title': title,
        'content': content,
        'file': MultipartFile.fromBytes(
          fileBytes,
          filename: fileName,
        ),
      });

      final response = await _api.uploadFile(
        ApiConstants.forumQuestions,
        requestData,
      );
      return QuestionModel.fromJson(response.data);
    } else {
      requestData = FormData.fromMap({
        'title': title,
        'content': content,
      });

      final response = await _api.uploadFile(
        ApiConstants.forumQuestions,
        requestData,
      );
      return QuestionModel.fromJson(response.data);
    }
  }

  /// POST /api/v1/forum/questions/{id}/answers — answer a question
  Future<AnswerModel> createAnswer({
    required String questionId,
    required String content,
  }) async {
    final response = await _api.post(
      ApiConstants.forumQuestionAnswers(questionId),
      data: {'content': content},
    );
    return AnswerModel.fromJson(response.data);
  }

  /// POST /api/v1/forum/answers/{id}/vote — vote on an answer
  /// vote: 1 = upvote, -1 = downvote, 0 = remove vote
  Future<Map<String, dynamic>> vote(String answerId, int vote) async {
    final response = await _api.post(
      ApiConstants.forumAnswerVote(answerId),
      data: {'vote': vote},
    );
    return response.data;
  }
}
