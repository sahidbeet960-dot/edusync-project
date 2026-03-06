class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  ApiException({required this.message, this.statusCode, this.data});

  @override
  String toString() => 'ApiException($statusCode): $message';
}

class UnauthorizedException extends ApiException {
  UnauthorizedException({super.message = 'Unauthorized'})
      : super(statusCode: 401);
}

class ForbiddenException extends ApiException {
  ForbiddenException({super.message = 'Forbidden'})
      : super(statusCode: 403);
}

class NotFoundException extends ApiException {
  NotFoundException({super.message = 'Not found'})
      : super(statusCode: 404);
}

class NetworkException extends ApiException {
  NetworkException({super.message = 'Network error. Please check your connection.'});
}

class ServerException extends ApiException {
  ServerException({super.message = 'Server error. Please try again later.'})
      : super(statusCode: 500);
}
