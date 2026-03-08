class ApiConstants {
  ApiConstants._();

  // Production backend
  static const String baseUrl =
      'https://edusync-project-production.up.railway.app';
  
  static const String wsBaseUrl = 'wss://edusync-project-production.up.railway.app';
  static const String apiPrefix = '/api/v1';

  // AI Hub Service
  static const String aiBaseUrl = 'https://edusync-ai-service.onrender.com';
  static const String aiChatUpload = '$aiBaseUrl/chatbot/upload';
  static const String aiChat = '$aiBaseUrl/chatbot/chat';
  static const String aiInfographsUpload = '$aiBaseUrl/infograph/infograph/upload';
  static const String aiInfographsHeatmap = '$aiBaseUrl/infograph/infograph/heatmap';
  static const String aiInfographsPieChart = '$aiBaseUrl/infograph/infograph/piechart';
  
  static const String aiSummaryUpload = '$aiBaseUrl/summary/summary/upload';
  static const String aiSummaryGenerate = '$aiBaseUrl/summary/summary';
  
  static const String aiPyqSubjects = '$baseUrl$apiPrefix/pyqs/';
  static String aiPyqAnalytics(String subject) => '$baseUrl$apiPrefix/pyqs/analytics/topics/${Uri.encodeComponent(subject)}';


  //----------Auth----------------------

  static const String login = '$apiPrefix/auth/login';
  static const String register = '$apiPrefix/auth/register';
  


  static const String userProfile = '$apiPrefix/users/me/profile';
  static const String updateUserProfile = '$apiPrefix/users/me';

  //----------Events-------------------

  static const String events = '$apiPrefix/events/';

  //----------Material-----------------

  static const String materials = '$apiPrefix/materials/';
  static String materialVerify(String id) => '$apiPrefix/materials/$id/verify';
  static String materialUnverify(String id) => '$apiPrefix/materials/$id/unverify';
  static String materialDelete(String id) => '$apiPrefix/materials/$id';

  //----------Forum--------------

    static const String forumQuestions = '$apiPrefix/forum/questions';
  static String forumQuestionDetail(String questionId) =>
      '$apiPrefix/forum/questions/$questionId';
  static String forumQuestionAnswers(String questionId) =>
      '$apiPrefix/forum/questions/$questionId/answers';
  static String forumAnswerVote(String answerId) =>
      '$apiPrefix/forum/answers/$answerId/vote';

    // Study Room (WebSocket) - UPDATED WITH userId
  static String studyRoomWs(String roomId, String username, int userId) =>
      '$wsBaseUrl$apiPrefix/rooms/ws/$roomId?username=${Uri.encodeQueryComponent(username)}&user_id=$userId';

  // Study Sessions & Stats
  static const String studySessions = '$apiPrefix/study/sessions';
  static const String studyMyStats = '$apiPrefix/study/my-stats';
  


}