import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import 'custom_news_query_sheet.dart';
import 'edit_profile_screen.dart';

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
  Map<String, dynamic>? _lastCustomPayload;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AuthProvider>(context, listen: false).fetchUserData();
    });
  }

  String _generationKind = 'daily';

  Future<void> _runGeneration(
    Future<Map<String, dynamic>> Function() starter,
    String kind,
  ) async {
    setState(() {
      _isGenerating = true;
      _briefingContent = null;
      _errorMessage = null;
      _status = 'queued';
      _generationKind = kind;
    });

    try {
      final response = await starter();

      print('DEBUG: Generate response = $response');

      final briefingId = response['briefingId'] as String?;

      if (briefingId != null) {
        setState(() {
          _briefingId = briefingId;
        });

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

  Future<void> _generateDailyBriefing() async {
    await _runGeneration(
      () => _apiService.generateDailyBriefing(),
      'daily',
    );
  }

  Future<void> _generateCustomNewsQuery(Map<String, dynamic> payload) async {
    _lastCustomPayload = Map<String, dynamic>.from(payload);

    await _runGeneration(
      () => _apiService.generateCustomNewsQuery(_lastCustomPayload!),
      'custom_news_query',
    );
  }

  Future<void> _openCustomNewsQuerySheet() async {
    final options = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      builder: (context) => const CustomNewsQuerySheet(),
    );

    if (options != null) {
      await _generateCustomNewsQuery(options);
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
    final prefix = _generationKind == 'custom_news_query'
        ? 'Custom news query'
        : 'Daily briefing';
    switch (_status) {
      case 'queued':
        return '$prefix queued for processing...';
      case 'fetching':
        return '$prefix is fetching articles...';
      case 'summarizing':
        return 'Creating your summary...';
      case 'done':
        return 'Briefing ready!';
      case 'error':
        return 'Error occurred';
      default:
        return 'Ready to generate';
    }
  }

  Future<void> _openProfileEditor() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final result = await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => EditProfileScreen(userData: authProvider.userData),
      ),
    );

    if (result == true && mounted) {
      await authProvider.fetchUserData();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final userData = authProvider.userData;
    final displayName = (userData?['name'] as String?)?.trim();
    final email = (userData?['email'] as String?) ??
        authProvider.userEmail ??
        '';

    return Scaffold(
      backgroundColor: AppTheme.offWhite,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: AppTheme.darkText,
        titleSpacing: 16,
        title: const Text(
          'IntelliBrief',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            letterSpacing: 0.5,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: _openProfileEditor,
            tooltip: 'Edit profile',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await authProvider.logout();
              if (context.mounted) {
                Navigator.of(context).pushReplacementNamed('/');
              }
            },
            tooltip: 'Logout',
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            children: [
              _buildHeroHeader(
                displayName: displayName,
                email: email,
                focusSummary: _focusSummary(userData),
              ),
              const SizedBox(height: 24),
              _buildGenerationCards(context),
              const SizedBox(height: 24),
              if (_isGenerating) ...[
                _buildLoaderCard(),
                const SizedBox(height: 24),
              ],
              if (_briefingContent != null) ...[
                _buildBriefingCard(context),
                const SizedBox(height: 24),
              ],
              if (_errorMessage != null) _buildErrorBanner(),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeroHeader({
    required String? displayName,
    required String email,
    required String focusSummary,
  }) {
    final greetingName =
        (displayName != null && displayName.isNotEmpty) ? displayName : 'there';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          colors: [Color(0xFFEEF2FF), Color(0xFFFFFBF5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 30,
            offset: const Offset(0, 20),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Good day, $greetingName 👋',
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.4,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            email,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF475467),
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.9),
              borderRadius: BorderRadius.circular(999),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.filter_alt_outlined, size: 16),
                const SizedBox(width: 8),
                Text(
                  'Focus: $focusSummary',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGenerationCards(BuildContext context) {
    return Wrap(
      spacing: 16,
      runSpacing: 16,
      children: [
        _buildDailyCard(context),
        _buildCustomCard(context),
      ],
    );
  }

  Widget _buildDailyCard(BuildContext context) {
    return _GradientCard(
      background: const LinearGradient(
        colors: [Color(0xFFEEF2FF), Color(0xFFE0F2FE), Color(0xFFFFF7ED)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const ChipLabel(text: 'Daily pulse'),
          const SizedBox(height: 8),
          const Text(
            'Zero-effort briefing',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            'Run your saved preferences for a polished digest in seconds—perfect for morning stand-up prep.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 16),
          const _CardBullet(
            emoji: '✨',
            text: 'Uses your saved industries & interests',
          ),
          const _CardBullet(
            emoji: '⚡',
            text: 'Fresh pull every time you tap generate',
          ),
          const _CardBullet(
            emoji: '🧭',
            text: 'Ideal for commute or pre-meeting scan',
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                foregroundColor: Colors.white,
                shape: const StadiumBorder(),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: _isGenerating ? null : _generateDailyBriefing,
              child: Text(
                _isGenerating && _generationKind == 'daily'
                    ? 'Generating...'
                    : 'Generate my daily briefing',
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomCard(BuildContext context) {
    return _GradientCard(
      background: const LinearGradient(
        colors: [Color(0xFF0B1220), Color(0xFF111C3A)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const ChipLabel(
            text: 'Research mode',
            isAccent: true,
          ),
          const SizedBox(height: 8),
          const Text(
            'Custom news query',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Blend emerging themes, required keywords, and trusted sources for a bespoke digest.',
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: Colors.white70),
          ),
          const SizedBox(height: 16),
          const _CardBullet(
            emoji: '🧪',
            text: 'Pinpoint emerging threads with topic stacks',
            darkMode: true,
          ),
          const _CardBullet(
            emoji: '🎯',
            text: 'Force-include keywords or trusted outlets',
            darkMode: true,
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black,
                shape: const StadiumBorder(),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: _isGenerating ? null : _openCustomNewsQuerySheet,
              child: Text(
                _isGenerating && _generationKind == 'custom_news_query'
                    ? 'Running query...'
                    : 'Compose custom query',
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoaderCard() {
    return _GlassPanel(
      child: Column(
        children: [
          const SizedBox(height: 12),
          const _OrbitLoader(),
          const SizedBox(height: 16),
          Text(
            _getStatusMessage(),
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          const Text(
            'Gathering sources, scraping details, and summarizing...',
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildBriefingCard(BuildContext context) {
    final bool custom = _generationKind == 'custom_news_query';
    final bool canRetryCustom =
        custom && _lastCustomPayload != null && !_isGenerating;

    final VoidCallback? regenAction = custom
        ? (canRetryCustom ? () => _generateCustomNewsQuery(_lastCustomPayload!) : null)
        : (_isGenerating ? null : _generateDailyBriefing);

    return _GlassPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      custom ? 'Custom digest' : 'Daily briefing',
                      style: const TextStyle(
                        letterSpacing: 0.3,
                        fontSize: 12,
                        color: Color(0xFFB45309),
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      '🗞️ Your briefing is ready',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Delivered at ${TimeOfDay.now().format(context)}',
                      style: const TextStyle(
                        color: Color(0xFF475467),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              OutlinedButton.icon(
                onPressed: regenAction,
                icon: const Icon(Icons.refresh),
                label: const Text('Regenerate'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.black87,
                  shape: const StadiumBorder(),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            _briefingContent ?? '',
            style: const TextStyle(
              fontSize: 16,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFE4E6), Color(0xFFFFF1F2)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.redAccent.withOpacity(0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.error_outline, color: Colors.redAccent),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  _errorMessage ?? 'Unknown error',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF991B1B),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              ElevatedButton(
                onPressed: _isGenerating ? null : _generateDailyBriefing,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: Colors.white,
                  shape: const StadiumBorder(),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                ),
                child: const Text('Try daily briefing'),
              ),
              if (_generationKind == 'custom_news_query')
                OutlinedButton(
                  onPressed: (_isGenerating || _lastCustomPayload == null)
                      ? null
                      : () => _generateCustomNewsQuery(_lastCustomPayload!),
                  style: OutlinedButton.styleFrom(
                    shape: const StadiumBorder(),
                    foregroundColor: Colors.black,
                    side: const BorderSide(color: Colors.black54),
                  ),
                  child: const Text('Retry custom query'),
                ),
            ],
          ),
        ],
      ),
    );
  }

  String _focusSummary(Map<String, dynamic>? userData) {
    final prefs = (userData?['preferences'] as Map<String, dynamic>?) ?? {};
    final topics = (prefs['topics'] as List<dynamic>? ?? [])
        .map((e) => e.toString())
        .where((e) => e.isNotEmpty)
        .toList();
    if (topics.isEmpty) return 'No saved interests yet';
    final preview = topics.take(3).join(', ');
    return '$preview${topics.length > 3 ? ' +' : ''}';
  }
}

class _GradientCard extends StatelessWidget {
  const _GradientCard({required this.background, required this.child});

  final LinearGradient background;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: background,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 30,
            offset: const Offset(0, 18),
          ),
        ],
      ),
      child: child,
    );
  }
}

class ChipLabel extends StatelessWidget {
  const ChipLabel({required this.text, this.isAccent = false});

  final String text;
  final bool isAccent;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: isAccent ? Colors.white24 : Colors.black.withOpacity(0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        text.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.2,
          color: isAccent ? Colors.white : Colors.black87,
        ),
      ),
    );
  }
}

class _CardBullet extends StatelessWidget {
  const _CardBullet({
    required this.emoji,
    required this.text,
    this.darkMode = false,
  });

  final String emoji;
  final String text;
  final bool darkMode;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(emoji, style: const TextStyle(fontSize: 16)),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              color: darkMode ? Colors.white70 : const Color(0xFF111827),
            ),
          ),
        ),
      ],
    );
  }
}

class _GlassPanel extends StatelessWidget {
  const _GlassPanel({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        gradient: const LinearGradient(
          colors: [Color(0xFFFFFBF5), Color(0xFFF6F8FB)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: Colors.white.withOpacity(0.7)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 30,
            offset: const Offset(0, 18),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _OrbitLoader extends StatelessWidget {
  const _OrbitLoader();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 64,
      width: 64,
      child: Stack(
        alignment: Alignment.center,
        children: const [
          SizedBox(
            height: 64,
            width: 64,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation(Color(0xFF1D4ED8)),
            ),
          ),
          SizedBox(
            height: 48,
            width: 48,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation(Color(0xFFE879F9)),
            ),
          ),
        ],
      ),
    );
  }
}
