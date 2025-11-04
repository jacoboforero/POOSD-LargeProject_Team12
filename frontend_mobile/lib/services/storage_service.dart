import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Secure Storage Service
/// Handles secure storage of JWT tokens and user data
class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
  );

  static const String _tokenKey = 'jwt_token';
  static const String _emailKey = 'user_email';

  /// Save JWT token
  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  /// Get JWT token
  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  /// Delete JWT token
  Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }

  /// Save user email
  Future<void> saveUserEmail(String email) async {
    await _storage.write(key: _emailKey, value: email);
  }

  /// Get user email
  Future<String?> getUserEmail() async {
    return await _storage.read(key: _emailKey);
  }

  /// Delete user email
  Future<void> deleteUserEmail() async {
    await _storage.delete(key: _emailKey);
  }

  /// Clear all stored data
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
