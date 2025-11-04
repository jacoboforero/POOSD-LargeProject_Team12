import 'dart:convert';
import 'package:http/http.dart' as http;
import 'storage_service.dart';

/// API Service for IntelliBrief Backend
/// Handles all HTTP requests to the backend server
class ApiService {
  // Base URL - change this to your backend URL
  static const String baseUrl = 'http://129.212.183.227:3001';
  // For local development (iOS simulator), use: http://localhost:3001
  // For Android emulator, use: http://10.0.2.2:3001
  // For production, use: http://129.212.183.227:3001

  final StorageService _storage = StorageService();

  /// Register a new user with email and optional preferences
  Future<Map<String, dynamic>> register(
    String email, {
    String? topics,
    String? interests,
    String? jobIndustry,
    String? demographic,
  }) async {
    try {
      final body = <String, dynamic>{'email': email};

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

  /// Generate a new briefing
  Future<Map<String, dynamic>> generateBriefing({
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
        Uri.parse('$baseUrl/api/briefings/generate'),
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
}
