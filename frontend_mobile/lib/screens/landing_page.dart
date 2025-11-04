import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

/// Landing Page - Main dashboard after login
/// Shows Generate Briefing button and displays briefing when ready
class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  final ApiService _apiService = ApiService();

  bool _isGenerating = false;
  String? _briefingId;
  String? _briefingContent;
  String? _errorMessage;
  String _status = 'idle'; // idle, queued, fetching, summarizing, done, error

  Future<void> _generateBriefing() async {
    setState(() {
      _isGenerating = true;
      _briefingContent = null;
      _errorMessage = null;
      _status = 'queued';
    });

    try {
      // Step 1: Start generation
      final response = await _apiService.generateBriefing();

      print('DEBUG: Generate response = $response');

      // Check for briefingId in response (not nested in 'data')
      final briefingId = response['briefingId'] as String?;

      if (briefingId != null) {
        setState(() {
          _briefingId = briefingId;
        });

        // Step 2: Poll for completion
        await _pollBriefingStatus(briefingId);
      } else {
        throw Exception('Failed to start briefing generation - no briefingId in response');
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
        _isGenerating = false;
        _status = 'error';
      });
    }
  }

  Future<void> _pollBriefingStatus(String briefingId) async {
    // Poll every 2 seconds for up to 2 minutes
    const maxAttempts = 60;
    int attempts = 0;

    while (attempts < maxAttempts) {
      await Future.delayed(const Duration(seconds: 2));

      try {
        final statusResponse = await _apiService.getBriefingStatus(briefingId);

        print('DEBUG: Status response = $statusResponse');

        // Response is direct, not nested in 'data'
        final status = statusResponse['status'] as String?;
        final progress = statusResponse['progress'] as int? ?? 0;

        if (status != null) {
          setState(() {
            _status = status;
          });

          if (status == 'done') {
            // Fetch the complete briefing
            await _fetchCompleteBriefing(briefingId);
            break;
          } else if (status == 'error') {
            final reason = statusResponse['statusReason'] ?? 'Unknown error';
            throw Exception('Briefing generation failed: $reason');
          }
        }
      } catch (e) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception: ', '');
          _isGenerating = false;
          _status = 'error';
        });
        break;
      }

      attempts++;
    }

    if (attempts >= maxAttempts && _status != 'done') {
      setState(() {
        _errorMessage = 'Briefing generation timed out. Please try again.';
        _isGenerating = false;
        _status = 'error';
      });
    }
  }

  Future<void> _fetchCompleteBriefing(String briefingId) async {
    try {
      final response = await _apiService.getBriefing(briefingId);

      print('DEBUG: Briefing response = $response');

      // Response is direct, not nested in 'data'
      if (response['summary'] != null) {
        final summary = response['summary'];
        final sections = summary['sections'] as List<dynamic>? ?? [];

        // Build briefing content from sections
        final content = StringBuffer();
        for (var section in sections) {
          if (section['category'] != null) {
            content.writeln('📰 ${section['category'].toString().toUpperCase()}');
            content.writeln();
          }
          if (section['text'] != null) {
            content.writeln(section['text']);
            content.writeln();
          }
        }

        setState(() {
          _briefingContent = content.toString().trim();
          _isGenerating = false;
          _status = 'done';
        });
      } else {
        throw Exception('Invalid briefing data - no summary found');
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
        _isGenerating = false;
        _status = 'error';
      });
    }
  }

  String _getStatusMessage() {
    switch (_status) {
      case 'queued':
        return 'Queued for processing...';
      case 'fetching':
        return 'Fetching latest news articles...';
      case 'summarizing':
        return 'Creating your personalized summary...';
      case 'done':
        return 'Briefing ready!';
      case 'error':
        return 'Error occurred';
      default:
        return 'Ready to generate';
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.offWhite,
      appBar: AppBar(
        title: const Text('IntelliBrief'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await authProvider.logout();
              if (context.mounted) {
                Navigator.of(context).pushReplacementNamed('/');
              }
            },
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppTheme.paddingPage),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Welcome message
              Text(
                'Welcome back!',
                style: Theme.of(context).textTheme.displayLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppTheme.spacingSmall),

              Text(
                authProvider.userEmail ?? '',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.darkText.withValues(alpha: 0.7),
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppTheme.spacingXLarge),

              // Generate Briefing Button
              if (!_isGenerating && _briefingContent == null)
                ElevatedButton(
                  onPressed: _generateBriefing,
                  child: const Padding(
                    padding: EdgeInsets.all(AppTheme.spacingMedium),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.newspaper, size: 24),
                        SizedBox(width: AppTheme.spacingSmall),
                        Text(
                          'Generate Briefing',
                          style: TextStyle(fontSize: 18),
                        ),
                      ],
                    ),
                  ),
                ),

              // Loading State
              if (_isGenerating) ...[
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(AppTheme.paddingCard),
                    child: Column(
                      children: [
                        // Logo/Icon placeholder
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: AppTheme.darkGray,
                            borderRadius:
                                BorderRadius.circular(AppTheme.radiusMedium),
                          ),
                          child: const Icon(
                            Icons.newspaper,
                            size: 40,
                            color: AppTheme.offWhite,
                          ),
                        ),
                        const SizedBox(height: AppTheme.spacingLarge),

                        // Loading indicator
                        const CircularProgressIndicator(
                          valueColor:
                              AlwaysStoppedAnimation<Color>(AppTheme.darkGray),
                        ),
                        const SizedBox(height: AppTheme.spacingLarge),

                        // Status message
                        Text(
                          _getStatusMessage(),
                          style: Theme.of(context).textTheme.titleMedium,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AppTheme.spacingSmall),

                        Text(
                          'This may take a minute...',
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    fontStyle: FontStyle.italic,
                                    color:
                                        AppTheme.darkText.withValues(alpha: 0.7),
                                  ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              ],

              // Briefing Content
              if (_briefingContent != null) ...[
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(AppTheme.paddingCard),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '🗞️ Your Briefing',
                              style: Theme.of(context).textTheme.displayMedium,
                            ),
                            IconButton(
                              icon: const Icon(Icons.refresh),
                              onPressed: _generateBriefing,
                              tooltip: 'Generate new briefing',
                            ),
                          ],
                        ),
                        const SizedBox(height: AppTheme.spacingLarge),

                        Text(
                          _briefingContent!,
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                      ],
                    ),
                  ),
                ),
              ],

              // Error Message
              if (_errorMessage != null) ...[
                const SizedBox(height: AppTheme.spacingLarge),
                Container(
                  padding: const EdgeInsets.all(AppTheme.spacingMedium),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                    border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.error_outline, color: Colors.red),
                          const SizedBox(width: AppTheme.spacingSmall),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(color: Colors.red),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppTheme.spacingMedium),
                      ElevatedButton(
                        onPressed: _generateBriefing,
                        child: const Text('Try Again'),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
