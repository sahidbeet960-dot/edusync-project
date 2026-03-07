
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import '../../../core/constants/api_constants.dart';
import '../models/infograph_models.dart';

class AiRepository {
  final Dio _dio;

  AiRepository({Dio? dio}) : _dio = dio ?? Dio() {
    _dio.options.headers = {'Accept': 'application/json'};
  }

  // --- RAG Chatbot Service ---

  Future<int> uploadForChat({required List<PlatformFile> files, required String userId, required String namespace}) async {
    try {
      final formData = FormData();
      for (var file in files) {
        if (file.bytes != null) {
          formData.files.add(MapEntry(
            'file',
            MultipartFile.fromBytes(file.bytes!, filename: file.name),
          ));
        } else if (file.path != null) {
          formData.files.add(MapEntry(
            'file',
            await MultipartFile.fromFile(file.path!, filename: file.name),
          ));
        }
      }

      final response = await _dio.post(
        ApiConstants.aiChatUpload,
        queryParameters: {
          'user_id': userId,
          'namespace': namespace,
        },
        data: formData,
      );

      if (response.statusCode == 200) {
        return files.length;
      }
      throw Exception('Failed to upload files for chat');
    } catch (e) {
      rethrow;
    }
  }

  Future<String> chatWithDocuments({required String userMessage, required String namespace, required String sessionId}) async {
    try {
      final response = await _dio.post(
        ApiConstants.aiChat,
        data: {
          'user_message': userMessage,
          'namespace': namespace,
          'session_id': sessionId,
        },
      );

      if (response.statusCode == 200) {
        if (response.data is Map && response.data.containsKey('response')) {
          return response.data['response'].toString();
        }
        return response.data.toString();
      }
      throw Exception('Failed to communicate with AI Chat');
    } on DioException catch (e) {
       // In case the API returns plain string without json wrapper, dio might still map it
       if (e.response?.statusCode == 200 && e.response?.data != null) {
           final data = e.response!.data;
           if (data is Map && data.containsKey('response')) {
             return data['response'].toString();
           }
           return data.toString();
       }
       rethrow;
    } catch (e) {
      rethrow;
    }
  }

  // --- Infographs Service ---

  Future<String> uploadForInfographs({required List<PlatformFile> files}) async {
    try {
      final formData = FormData();
      for (var file in files) {
        if (file.bytes != null) {
          formData.files.add(MapEntry(
            'file',
            MultipartFile.fromBytes(file.bytes!, filename: file.name),
          ));
        } else if (file.path != null) {
          formData.files.add(MapEntry(
            'file',
            await MultipartFile.fromFile(file.path!, filename: file.name),
          ));
        }
      }

      final response = await _dio.post(
        ApiConstants.aiInfographsUpload,
        data: formData,
      );

      if (response.statusCode == 200) {
        final docId = response.data['document_id'];
        if (docId != null) return docId.toString();
        throw Exception('No document_id returned');
      }
      throw Exception('Failed to upload files for infographs');
    } catch (e) {
      rethrow;
    }
  }

  Future<HeatmapData> getHeatmapData(String documentId) async {
    try {
      final response = await _dio.post(
        ApiConstants.aiInfographsHeatmap,
        data: {'document_id': documentId},
      );
      if (response.statusCode == 200) {
        return HeatmapData.fromJson(response.data);
      }
      throw Exception('Failed to fetch heatmap data');
    } catch (e) {
      rethrow;
    }
  }

  Future<PieChartData> getPieChartData(String documentId) async {
    try {
      final response = await _dio.post(
        ApiConstants.aiInfographsPieChart,
        data: {'document_id': documentId},
      );
      if (response.statusCode == 200) {
        return PieChartData.fromJson(response.data);
      }
      throw Exception('Failed to fetch pie chart data');
    } catch (e) {
      rethrow;
    }
  }

  // --- Summarize Service ---

  Future<String> uploadForSummary({required List<PlatformFile> files}) async {
    try {
      final formData = FormData();
      for (var file in files) {
        if (file.bytes != null) {
          formData.files.add(MapEntry(
            'file',
            MultipartFile.fromBytes(file.bytes!, filename: file.name),
          ));
        } else if (file.path != null) {
          formData.files.add(MapEntry(
            'file',
            await MultipartFile.fromFile(file.path!, filename: file.name),
          ));
        }
      }

      final response = await _dio.post(
        ApiConstants.aiSummaryUpload,
        data: formData,
      );

      if (response.statusCode == 200) {
        final docId = response.data['document_id'];
        if (docId != null) return docId.toString();
        throw Exception('No document_id returned by summary upload API');
      }
      throw Exception('Failed to upload files for summary');
    } catch (e) {
      rethrow;
    }
  }

  Future<String> generateSummary(String documentId) async {
    try {
      final response = await _dio.post(
        ApiConstants.aiSummaryGenerate,
        data: {'document_id': documentId},
      );
      if (response.statusCode == 200) {
        if (response.data is Map && response.data.containsKey('summary')) {
          return response.data['summary'].toString();
        }
        if (response.data is Map && response.data.containsKey('response')) {
          return response.data['response'].toString();
        }
        return response.data.toString();
      }
      throw Exception('Failed to fetch summary data');
    } on DioException catch (e) {
       if (e.response?.statusCode == 200 && e.response?.data != null) {
           final data = e.response!.data;
           if (data is Map && data.containsKey('summary')) {
             return data['summary'].toString();
           }
           if (data is Map && data.containsKey('response')) {
             return data['response'].toString();
           }
           return data.toString();
       }
       rethrow;
    } catch (e) {
      rethrow;
    }
  }
}
