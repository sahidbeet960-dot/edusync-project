class ApiConstants {
  ApiConstants._();

  // Production backend
  static const String baseUrl =
      'API_URL';
  static const String apiPrefix = '/api';


  static const String login = '$apiPrefix/auth/login';
  static const String register = '$apiPrefix/auth/register';
  
  static const String userProfile = '$apiPrefix/users/me/profile';
}