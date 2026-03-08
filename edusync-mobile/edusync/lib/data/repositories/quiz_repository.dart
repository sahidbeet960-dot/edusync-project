import 'package:dio/dio.dart';
import '../../core/network/api_exceptions.dart';
import '../models/quiz_model.dart';
import 'dart:convert';

class QuizRepository {
  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: 'https://edusync-ai-latest.onrender.com', // Override the base URL
      connectTimeout: const Duration(seconds: 60),
      receiveTimeout: const Duration(seconds: 60),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  )..interceptors.add(LogInterceptor(
    request: true,
    requestHeader: true,
    requestBody: true,
    responseHeader: true,
    responseBody: true,
    error: true,
  ));

  /// POST /generate-quiz
  /// Returns a QuizResponse object
  Future<QuizResponse> generateQuiz({
    required List<String> urls,
    required int numQuestions,
  }) async {
    try {
      final response = await _dio.post(
        '/generate-quiz',
        data: {
          'urls': urls,
          'num_questions': numQuestions,
        },
      );
      
      if (response.statusCode == 200) {
        final data = response.data;
        if (data is Map<String, dynamic> && data['success'] == false) {
          final errorMsg = data['error']?.toString() ?? 'Quiz generation failed.';
          final suggestion = data['suggestion']?.toString();
          final fullMessage = suggestion != null && suggestion.isNotEmpty
              ? '$errorMsg\n$suggestion'
              : errorMsg;
          throw ApiException(message: fullMessage);
        }
        return QuizResponse.fromJson(data);
      } else {
        throw ApiException(
            message: 'Failed to generate quiz. Server returned ${response.statusCode}');
      }
    } on DioException catch (e) {
      String errorMessage = 'Failed to generate quiz due to network error.';
      if (e.response != null) {
         try {
           final Map<String, dynamic> errorData = e.response?.data is String ? jsonDecode(e.response?.data) : e.response?.data;
           if (errorData.containsKey('detail') && errorData['detail'] != null) {
              errorMessage = errorData['detail'].toString();
           } else if (errorData.containsKey('error') && errorData['error'] != null) {
              errorMessage = errorData['error'].toString();
           } else if (e.response?.statusMessage != null) {
              errorMessage = e.response!.statusMessage!;
           }
         } catch (_) {}
         throw ApiException(message: errorMessage, statusCode: e.response?.statusCode);
      }
      throw ApiException(message: errorMessage);
    } catch (e) {
      throw ApiException(message: 'An unexpected error occurred: $e');
    }
  }
}
