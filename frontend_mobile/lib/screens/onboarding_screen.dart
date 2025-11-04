import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

/// Onboarding Screen - Personalize Your Daily Briefing
/// Collects user preferences: topics, interests, job industry, demographic
class OnboardingScreen extends StatefulWidget {
  final String email;

  const OnboardingScreen({
    super.key,
    required this.email,
  });

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _topicsController = TextEditingController();
  final _interestsController = TextEditingController();
  final _jobIndustryController = TextEditingController();
  final _demographicController = TextEditingController();

  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _topicsController.dispose();
    _interestsController.dispose();
    _jobIndustryController.dispose();
    _demographicController.dispose();
    super.dispose();
  }

  Future<void> _completeOnboarding() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final apiService = ApiService();

      // Register user with preferences
      await apiService.register(
        widget.email,
        topics: _topicsController.text.trim(),
        interests: _interestsController.text.trim(),
        jobIndustry: _jobIndustryController.text.trim(),
        demographic: _demographicController.text.trim(),
      );

      if (mounted) {
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Registration successful! Sending OTP...'),
            backgroundColor: AppTheme.darkGray,
            duration: Duration(seconds: 2),
          ),
        );

        // Automatically trigger login to send OTP
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final loginSuccess = await authProvider.login(widget.email);

        if (loginSuccess && mounted) {
          // Pop back to auth screen and signal that OTP was sent
          Navigator.of(context).pop({'otpSent': true, 'email': widget.email});
        } else if (mounted && authProvider.errorMessage != null) {
          // If login fails after registration, show error
          setState(() {
            _errorMessage = 'Registration succeeded but failed to send OTP: ${authProvider.errorMessage}';
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.offWhite,
      appBar: AppBar(
        title: const Text('IntelliBrief'),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppTheme.paddingPage),
            child: _buildOnboardingCard(context),
          ),
        ),
      ),
    );
  }

  Widget _buildOnboardingCard(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 420),
      child: Card(
        color: AppTheme.warmBeige,
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.paddingCard),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Center(
                  child: Text(
                    '🗞️ Personalize Your Daily Briefing',
                    style: Theme.of(context).textTheme.displayMedium,
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: AppTheme.spacingSmall),

                // Subtitle
                Center(
                  child: Text(
                    'Let\'s learn a bit about your news style',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontStyle: FontStyle.italic,
                        ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: AppTheme.spacingLarge),

                // Question 1: Topics
                Text(
                  '📰 What topics make headlines in your world?',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppTheme.spacingSmall),
                TextFormField(
                  controller: _topicsController,
                  decoration: const InputDecoration(
                    hintText: 'e.g., Technology, Politics, Sports',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your topics of interest';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: AppTheme.spacingLarge),

                // Question 2: Interests
                Text(
                  '💡 What subjects always catch your curiosity?',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppTheme.spacingSmall),
                TextFormField(
                  controller: _interestsController,
                  decoration: const InputDecoration(
                    hintText: 'e.g., AI, Climate Change, Startups',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your interests';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: AppTheme.spacingLarge),

                // Question 3: Job Industry
                Text(
                  '💼 What industry are you part of (or dreaming of joining)?',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppTheme.spacingSmall),
                TextFormField(
                  controller: _jobIndustryController,
                  decoration: const InputDecoration(
                    hintText: 'e.g., Software Engineering, Healthcare',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your industry';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: AppTheme.spacingLarge),

                // Question 4: Demographic
                Text(
                  '👤 How would you describe yourself as a reader?',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppTheme.spacingSmall),
                TextFormField(
                  controller: _demographicController,
                  decoration: const InputDecoration(
                    hintText: 'e.g., Professional, Student, Enthusiast',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please describe yourself';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: AppTheme.spacingXLarge),

                // Error message
                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(AppTheme.spacingSmall),
                    decoration: BoxDecoration(
                      color: Colors.red.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                    ),
                    child: Text(
                      _errorMessage!,
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacingMedium),
                ],

                // Submit button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _completeOnboarding,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        vertical: AppTheme.spacingXSmall,
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  AppTheme.offWhite,
                                ),
                              ),
                            )
                          : const Text('Complete Setup'),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
