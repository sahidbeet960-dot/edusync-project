
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../models/user_model.dart';

class AuthRepository {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _api.postForm(
      ApiConstants.login,
      data: {'username': email, 'password': password},
    );
    final token = response.data['access_token'];
    if (token != null) {
      await _api.saveToken(token);
    }
    return response.data;
  }

  Future<UserModel> getMe() async {
    final response = await _api.get(ApiConstants.userProfile);
    return UserModel.fromJson(response.data);
  }

  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String fullName,
    String role = 'STUDENT',
    String? department,
    int? semester,
    String? bio,
  }) async {
    final body = <String, dynamic>{
      'email': email,
      'password': password,
      'full_name': fullName,
      'role': role,
    };
    if (department != null && department.isNotEmpty) body['department'] = department;
    if (semester != null) body['semester'] = semester;
    if (bio != null && bio.isNotEmpty) body['bio'] = bio;

    final response = await _api.post(
      ApiConstants.register,
      data: body,
    );
    return response.data;
  }

  Future<void> logout() async {
    await _api.clearTokens();
  }

  Future<bool> isLoggedIn() async {
    return await _api.hasToken();
  }
}
