import 'dart:convert';
import 'package:http/http.dart' as http;
import 'storage_service.dart';

/// API Service for IntelliBrief Backend
/// Handles all HTTP requests to the backend server
class ApiService {
  // Base URL - change this to your backend URL
  // LOCAL DEVELOPMENT - Using localhost (change port to 3002 if needed)
  static const String baseUrl = 'http://localhost:3001';

  // ALTERNATIVE CONFIGURATIONS:
  // For iOS simulator local development: http://localhost:3002
  // For Android emulator local development: http://10.0.2.2:3002
  // For production (remote server): http://129.212.183.227:3001

  final StorageService _storage = StorageService();

  /// Check if user exists (for showing password field)
  Future<bool> checkUserExists(String email) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/check-user'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email}),
      );

      print('DEBUG API: Check user response status = ${response.statusCode}');
      print('DEBUG API: Check user response body = ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['exists'] ?? false;
      } else {
        return false;
      }
    } catch (e) {
      print('DEBUG API: Check user error: $e');
      return false;
    }
  }

  /// Login with email and password (sends OTP after verification)
  Future<Map<String, dynamic>> loginWithPassword(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/login-password'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );

      print('DEBUG API: Login password response status = ${response.statusCode}');
      print('DEBUG API: Login password response body = ${response.body}');

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        final message = error['error']?['details'] ??
                       error['error']?['message'] ??
                       'Login failed';
        throw Exception(message);
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Register a new user with email and optional preferences
  Future<Map<String, dynamic>> register(
    String email, {
    String? name,
    String? topics,
    String? interests,
    String? jobIndustry,
    String? demographic,
    String? location,
    String? lifeStage,
    String? newsStyle,
    String? newsScope,
    String? password,
  }) async {
    try {
      final body = <String, dynamic>{'email': email};

      // Add name if provided
      if (name != null && name.isNotEmpty) {
        body['name'] = name;
      }

      // Add password if provided
      if (password != null && password.isNotEmpty) {
        body['password'] = password;
      }

      // Add preferences if provided - convert comma-separated strings to arrays
      if (topics != null && topics.isNotEmpty) {
        body['topics'] = topics.split(',').map((s) => s.trim()).toList();
      }
      if (interests != null && interests.isNotEmpty) {
        body['interests'] = interests.split(',').map((s) => s.trim()).toList();
      }
      if (jobIndustry != null && jobIndustry.isNotEmpty) {
        body['jobIndustry'] = jobIndustry;
      }
      if (demographic != null && demographic.isNotEmpty) {
        body['demographic'] = demographic;
      }
      if (location != null && location.isNotEmpty) {
        body['location'] = location;
      }
      if (lifeStage != null && lifeStage.isNotEmpty) {
        body['lifeStage'] = lifeStage;
      }
      if (newsStyle != null && newsStyle.isNotEmpty) {
        body['newsStyle'] = newsStyle;
      }
      if (newsScope != null && newsScope.isNotEmpty) {
        body['newsScope'] = newsScope;
      }

      print('DEBUG API: Register body = ${json.encode(body)}');

      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      );

      print('DEBUG API: Register response status = ${response.statusCode}');
      print('DEBUG API: Register response body = ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        // Backend sends error message in 'details' field
        final message = error['error']?['details'] ??
                       error['error']?['message'] ??
                       'Registration failed';
        throw Exception(message);
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Login existing user with email (sends OTP)
  Future<Map<String, dynamic>> login(String email) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email}),
      );

      print('DEBUG API: Login response status = ${response.statusCode}');
      print('DEBUG API: Login response body = ${response.body}');

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        // Parse error response
        try {
          final error = json.decode(response.body);
          print('DEBUG API: Parsed error = $error');
          // Backend sends error message in 'details' field
          final message = error['error']?['details'] ??
                         error['error']?['message'] ??
                         error['message'] ??
                         'Login failed';
          print('DEBUG API: Error message = $message');
          throw Exception(message);
        } catch (parseError) {
          print('DEBUG API: Failed to parse error, raw body = ${response.body}');
          // If we can't parse, throw the raw body if available
          if (response.body.isNotEmpty) {
            throw Exception(response.body);
          }
          throw Exception('Login failed with status ${response.statusCode}');
        }
      }
    } on Exception {
      rethrow; // Rethrow our own exceptions
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Verify OTP code and get JWT token
  Future<Map<String, dynamic>> verifyOtp(String email, String code) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/verify'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'code': code,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        print('DEBUG API: Verify response = $data');

        // Save token to secure storage - response is direct, not nested in 'data'
        if (data['token'] != null) {
          await _storage.saveToken(data['token']);
          await _storage.saveUserEmail(email);
          print('DEBUG API: Token saved successfully');
        } else {
          print('DEBUG API: No token found in response!');
        }

        return data;
      } else {
        final error = json.decode(response.body);
        // Backend sends error message in 'details' field
        final message = error['error']?['details'] ??
                       error['error']?['message'] ??
                       'Verification failed';
        throw Exception(message);
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Get current user profile (requires authentication)
  Future<Map<String, dynamic>> getCurrentUser() async {
    try {
      final token = await _storage.getToken();

      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/api/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        // Backend sends error message in 'details' field
        final message = error['error']?['details'] ??
                       error['error']?['message'] ??
                       'Failed to get user data';
        throw Exception(message);
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Update user profile/preferences
  Future<Map<String, dynamic>> updateUserProfile(Map<String, dynamic> payload) async {
    try {
      final token = await _storage.getToken();

      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await http.put(
        Uri.parse('$baseUrl/api/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(payload),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        final message = error['error']?['details'] ??
            error['error']?['message'] ??
            'Failed to update profile';
        throw Exception(message);
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Get user usage and quota information
  Future<Map<String, dynamic>> getUserUsage() async {
    try {
      final token = await _storage.getToken();

      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/api/me/usage'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        // Backend sends error message in 'details' field
        final message = error['error']?['details'] ??
                       error['error']?['message'] ??
                       'Failed to get usage data';
        throw Exception(message);
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Generate the daily briefing (saved preferences)
  Future<Map<String, dynamic>> generateDailyBriefing({
    List<String>? topics,
    List<String>? interests,
    String? jobIndustry,
    String? demographic,
  }) async {
    try {
      final token = await _storage.getToken();

      if (token == null) {
        throw Exception('No authentication token found');
      }

      final body = <String, dynamic>{};
      if (topics != null) body['topics'] = topics;
      if (interests != null) body['interests'] = interests;
      if (jobIndustry != null) body['jobIndustry'] = jobIndustry;
      if (demographic != null) body['demographic'] = demographic;

      final response = await http.post(
        Uri.parse('$baseUrl/api/briefings/generate-daily'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(body),
      );

      if (response.statusCode == 200 || response.statusCode == 202) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        // Backend sends error message in 'details' field
        final message = error['error']?['details'] ??
                       error['error']?['message'] ??
                       'Failed to generate briefing';
        throw Exception(message);
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Run a custom news query with ad-hoc parameters
  Future<Map<String, dynamic>> generateCustomNewsQuery(
      Map<String, dynamic> payload) async {
    try {
      final token = await _storage.getToken();

      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await http.post(
        Uri.parse('$baseUrl/api/briefings/generate'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(payload),
      );

      if (response.statusCode == 200 || response.statusCode == 202) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        final message = error['error']?['details'] ??
            error['error']?['message'] ??
            'Failed to run custom news query';
        throw Exception(message);
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Get briefing status
  Future<Map<String, dynamic>> getBriefingStatus(String briefingId) async {
    try {
      final token = await _storage.getToken();

      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/api/briefings/$briefingId/status'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        // Backend sends error message in 'details' field
        final message = error['error']?['details'] ??
                       error['error']?['message'] ??
                       'Failed to get briefing status';
        throw Exception(message);
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Get complete briefing
  Future<Map<String, dynamic>> getBriefing(String briefingId) async {
    try {
      final token = await _storage.getToken();

      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/api/briefings/$briefingId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        // Backend sends error message in 'details' field
        final message = error['error']?['details'] ??
                       error['error']?['message'] ??
                       'Failed to get briefing';
        throw Exception(message);
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Logout user (clear local storage)
  Future<void> logout() async {
    await _storage.clearAll();
  }

  /// Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final token = await _storage.getToken();
    return token != null;
  }

  /// Request password reset (sends OTP to console)
  Future<Map<String, dynamic>> requestPasswordReset(String email) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/forgot-password'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email.toLowerCase().trim()}),
      );

      print('DEBUG API: Forgot password response status = ${response.statusCode}');
      print('DEBUG API: Forgot password response body = ${response.body}');

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        final message = error['error']?['details'] ??
                       error['error']?['message'] ??
                       'Failed to send reset code';
        throw Exception(message);
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Verify password reset code
  Future<Map<String, dynamic>> verifyResetCode(String email, String code) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/verify-reset-code'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email.toLowerCase().trim(),
          'code': code,
        }),
      );

      print('DEBUG API: Verify reset code response status = ${response.statusCode}');
      print('DEBUG API: Verify reset code response body = ${response.body}');

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        final message = error['error']?['details'] ??
                       error['error']?['message'] ??
                       'Failed to verify reset code';
        throw Exception(message);
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// Reset password with verified code
  Future<Map<String, dynamic>> resetPassword(
    String email,
    String code,
    String newPassword,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/reset-password'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email.toLowerCase().trim(),
          'code': code,
          'newPassword': newPassword,
        }),
      );

      print('DEBUG API: Reset password response status = ${response.statusCode}');
      print('DEBUG API: Reset password response body = ${response.body}');

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        final message = error['error']?['details'] ??
                       error['error']?['message'] ??
                       'Failed to reset password';
        throw Exception(message);
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}
