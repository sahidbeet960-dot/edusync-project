import 'package:dio/dio.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../models/material_model.dart';

class MaterialRepository {
  final ApiClient _api = ApiClient();

  Future<List<MaterialModel>> getMaterials({int? semester}) async {
    final queryParams = <String, dynamic>{};
    if (semester != null) {
      queryParams['semester'] = semester;
    }
    
    final response = await _api.get(
      ApiConstants.materials,
      queryParameters: queryParams.isNotEmpty ? queryParams : null,
    );
    
    // Handle both direct list response and paginated/wrapped response
    List<dynamic> data;
    if (response.data is List) {
      data = response.data;
    } else if (response.data is Map && response.data.containsKey('items')) {
      data = response.data['items'];
    } else {
      data = [response.data]; // fallback
    }

    return data.map((json) => MaterialModel.fromJson(json)).toList();
  }

  // Modified to handle string response from the backend
  // The backend might return a success string rather than the created object.
  // In a real scenario we might need to fetch the list again or parse the string if it contains ID.
  Future<MaterialModel> createMaterial({
    required String title,
    required List<int> fileBytes,
    required String fileName,
    String? description,
    required int semester,
    String? tags,
  }) async {
    final formData = FormData.fromMap({
      'title': title,
      'semester': semester,
      if (description != null && description.isNotEmpty) 'description': description,
      if (tags != null && tags.isNotEmpty) 'tags': tags,
      'file': MultipartFile.fromBytes(
        fileBytes,
        filename: fileName,
      ),
    });

    final response = await _api.uploadFile(
      ApiConstants.materials,
      formData,
    );
    
    // If backend returns a string (like a success message), we return a placeholder model
    // so the UI doesn't crash, and the viewmodel will need to reload the materials.
    if (response.data is String) {
      return MaterialModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(), // Temporary ID
        title: title,
        fileUrl: '', // Temporary
        uploaderId: '',
        semester: semester,
        description: description,
        tags: tags,
        createdAt: DateTime.now(),
      );
    }
    
    return MaterialModel.fromJson(response.data);
  }

  Future<MaterialModel> verifyMaterial(String id) async {
    final response = await _api.post(ApiConstants.materialVerify(id));
    return MaterialModel.fromJson(response.data);
  }

  Future<MaterialModel> unverifyMaterial(String id) async {
    final response = await _api.post(ApiConstants.materialUnverify(id));
    return MaterialModel.fromJson(response.data);
  }

  Future<void> deleteMaterial(String id) async {
    await _api.delete(ApiConstants.materialDelete(id));
  }
}
