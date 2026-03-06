class ApiConstants {
  ApiConstants._();

  // Production backend
  static const String baseUrl =
      'API_URL';
  static const String apiPrefix = '/api/v1';


  //----------Auth----------------------

  static const String login = '$apiPrefix/auth/login';
  static const String register = '$apiPrefix/auth/register';
  


  static const String userProfile = '$apiPrefix/users/me/profile';

  //----------Events-------------------
  
  static const String events = 'apiPrefix/events';

  //----------Material-----------------

  static const String materials = '$apiPrefix/materials/';
  static String materialVerify(String id) => '$apiPrefix/materials/$id/verify';
  static String materialUnverify(String id) => '$apiPrefix/materials/$id/unverify';
  static String materialDelete(String id) => '$apiPrefix/materials/$id';
}