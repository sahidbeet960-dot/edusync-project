import 'package:flutter/material.dart';
import '../../../core/network/api_exceptions.dart';
import '../../../data/models/user_model.dart';
import '../../../data/repositories/auth_repository.dart';

enum AuthState { initial, loading, authenticated, unauthenticated, error }

class AuthViewModel extends ChangeNotifier {
  final AuthRepository _authRepo = AuthRepository();

  AuthState _state = AuthState.initial;
  UserModel? _user;
  String? _error;

  AuthViewModel() {
    checkAuth();
  }

  AuthState get state => _state;
  UserModel? get user => _user;
  String? get error => _error;
  bool get isAuthenticated => _state == AuthState.authenticated;
  bool get isLoading => _state == AuthState.loading;

  Future<void> checkAuth() async {
    final loggedIn = await _authRepo.isLoggedIn();
    if (loggedIn) {
      try {
        _user = await _authRepo.getMe();
        _state = AuthState.authenticated;
      } catch (_) {
        await _authRepo.logout();
        _state = AuthState.unauthenticated;
      }
    } else {
      _state = AuthState.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _state = AuthState.loading;
    _error = null;
    notifyListeners();

    try {
      await _authRepo.login(email, password);
      _user = await _authRepo.getMe();
      _state = AuthState.authenticated;
      notifyListeners();
      return true;
    } catch (e) {
      _error = _friendlyError(e);
      _state = AuthState.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String fullName,
    String role = 'STUDENT',
    String? department,
    int? semester,
    String? bio,
  }) async {
    _state = AuthState.loading;
    _error = null;
    notifyListeners();

    try {
      await _authRepo.register(
        email: email,
        password: password,
        fullName: fullName,
        role: role,
        department: department,
        semester: semester,
        bio: bio,
      );
      // Auto-login after successful registration
      return await login(email, password);
    } catch (e) {
      print('Registration error: $e');
      if (e is ApiException) {
        print('ApiException details: ${e.message}');
      }
      _error = _friendlyError(e);
      _state = AuthState.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authRepo.logout();
    _user = null;
    _state = AuthState.unauthenticated;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }


  String _friendlyError(dynamic e) {
    if (e is ApiException) {
      if (e is UnauthorizedException) {
        return 'Invalid email or password. Please try again.';
      }
      if (e is ForbiddenException) {
        return 'You don\'t have permission to do this.';
      }
      if (e is NetworkException) {
        return 'No internet connection. Please check your network.';
      }
      if (e is ServerException) {
        return 'Server is temporarily unavailable. Try again later.';
      }
      return e.message;
    }
    return 'Something went wrong. Please try again.';
  }
}
