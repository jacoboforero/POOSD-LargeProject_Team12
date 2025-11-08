import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

/// Authentication State Provider
/// Manages authentication state across the app using Provider pattern
class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();

  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _userEmail;
  Map<String, dynamic>? _userData;
  String? _errorMessage;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get userEmail => _userEmail;
  Map<String, dynamic>? get userData => _userData;
  String? get errorMessage => _errorMessage;

  /// Initialize auth state on app start
  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      final isAuth = await _apiService.isAuthenticated();
      _isAuthenticated = isAuth;

      if (isAuth) {
        _userEmail = await _storageService.getUserEmail();
        // Optionally fetch user data
        await fetchUserData();
      }
    } catch (e) {
      _isAuthenticated = false;
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Register new user
  Future<bool> register(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _apiService.register(email);
      _userEmail = email;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Login existing user with password (verifies password and sends OTP)
  Future<bool> loginWithPassword(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _apiService.loginWithPassword(email, password);
      _userEmail = email;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Login existing user (legacy OTP method)
  Future<bool> login(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _apiService.login(email);
      _userEmail = email;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Verify OTP code
  Future<bool> verifyOtp(String email, String code) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiService.verifyOtp(email, code);

      // Response is direct: {token, user}, not nested in 'data'
      if (response['token'] != null) {
        _isAuthenticated = true;
        _userEmail = email;
        _userData = response['user'];
      }

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Fetch current user data
  Future<void> fetchUserData() async {
    try {
      final response = await _apiService.getCurrentUser();
      if (response['data'] != null) {
        _userData = response['data'];
        notifyListeners();
      }
    } catch (e) {
      // Silently fail - user data is optional
      debugPrint('Failed to fetch user data: $e');
    }
  }

  /// Logout user
  Future<void> logout() async {
    await _apiService.logout();
    _isAuthenticated = false;
    _userEmail = null;
    _userData = null;
    _errorMessage = null;
    notifyListeners();
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
