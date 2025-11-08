import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

/// Onboarding Screen - Personalize Your Daily Briefing
/// Collects user preferences matching the webapp exactly
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
  final _nameController = TextEditingController();
  final _locationController = TextEditingController();
  final _lifeStageController = TextEditingController();
  final _jobIndustryController = TextEditingController();
  final _attentionGrabbersController = TextEditingController();
  final _generalInterestsController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String _newsStyle = '';
  String _newsScope = '';
  bool _isLoading = false;
  String? _errorMessage;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _locationController.dispose();
    _lifeStageController.dispose();
    _jobIndustryController.dispose();
    _attentionGrabbersController.dispose();
    _generalInterestsController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
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
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      // Register user with all preferences and password
      await apiService.register(
        widget.email,
        name: _nameController.text.trim(),
        location: _locationController.text.trim(),
        lifeStage: _lifeStageController.text.trim(),
        jobIndustry: _jobIndustryController.text.trim(),
        topics: _attentionGrabbersController.text.trim(),
        interests: _generalInterestsController.text.trim(),
        newsStyle: _newsStyle.isNotEmpty ? _newsStyle : null,
        newsScope: _newsScope.isNotEmpty ? _newsScope : null,
        password: _passwordController.text.trim(),
      );

      if (mounted) {
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Registration successful! Verifying with password...'),
            backgroundColor: AppTheme.darkGray,
            duration: Duration(seconds: 2),
          ),
        );

        // Automatically verify password to trigger OTP
        final passwordSuccess = await authProvider.loginWithPassword(
          widget.email,
          _passwordController.text.trim(),
        );

        if (passwordSuccess && mounted) {
          // Password verified, OTP sent via email - return to auth screen to enter OTP
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Verification code sent to your email! Check your inbox.'),
              backgroundColor: AppTheme.darkGray,
              duration: Duration(seconds: 3),
            ),
          );
          Navigator.of(context).pop({'otpSent': true, 'email': widget.email});
        } else if (mounted && authProvider.errorMessage != null) {
          // If password verification fails after registration, show error
          setState(() {
            _errorMessage = 'Registration succeeded but failed to send verification code: ${authProvider.errorMessage}';
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
                    'Join IntelliBrief',
                    style: Theme.of(context).textTheme.displayMedium,
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: AppTheme.spacingLarge),

                // Name field
                Text(
                  'Name',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppTheme.spacingSmall),
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    hintText: 'Your full name',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your name';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: AppTheme.spacingLarge),

                // About You Section
                Center(
                  child: Text(
                    'About You',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: AppTheme.spacingMedium),

                // Location
                Text(
                  'Where are you tuning in from? (City, state, or country)',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppTheme.spacingSmall),
                TextFormField(
                  controller: _locationController,
                  decoration: const InputDecoration(
                    hintText: 'e.g., New York, NY or United States',
                  ),
                ),
                const SizedBox(height: AppTheme.spacingMedium),

                // Life Stage
                Text(
                  'What best describes your current stage in life?',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppTheme.spacingSmall),
                TextFormField(
                  controller: _lifeStageController,
                  decoration: const InputDecoration(
                    hintText: 'e.g., student, young professional, parent, retiree',
                  ),
                ),
                const SizedBox(height: AppTheme.spacingMedium),

                // Job Industry
                Text(
                  'What field or industry are you part of?',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppTheme.spacingSmall),
                TextFormField(
                  controller: _jobIndustryController,
                  decoration: const InputDecoration(
                    hintText: 'e.g., healthcare, tech, education',
                  ),
                ),
                const SizedBox(height: AppTheme.spacingLarge),

                // News Preferences Section
                Center(
                  child: Text(
                    'News Preferences',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: AppTheme.spacingXSmall),
                Center(
                  child: Text(
                    '(Helps the briefing decide which topics and styles to prioritize.)',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontStyle: FontStyle.italic,
                        ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: AppTheme.spacingMedium),

                // Attention Grabbers
                Text(
                  'What kinds of stories always grab your attention?',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppTheme.spacingSmall),
                TextFormField(
                  controller: _attentionGrabbersController,
                  decoration: const InputDecoration(
                    hintText: 'e.g., world news, tech, culture, politics, science (comma-separated)',
                  ),
                ),
                const SizedBox(height: AppTheme.spacingMedium),

                // General Interests
                Text(
                  'What are your general interests or passions?',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppTheme.spacingSmall),
                TextFormField(
                  controller: _generalInterestsController,
                  decoration: const InputDecoration(
                    hintText: 'e.g., technology, art, science, sports, travel, cooking (comma-separated)',
                  ),
                ),
                const SizedBox(height: AppTheme.spacingMedium),

                // News Style
                Text(
                  'How do you like your news served?',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppTheme.spacingSmall),
                DropdownButtonFormField<String>(
                  value: _newsStyle.isEmpty ? null : _newsStyle,
                  decoration: const InputDecoration(
                    hintText: 'Select an option',
                  ),
                  items: const [
                    DropdownMenuItem(value: 'Quick summaries', child: Text('Quick summaries')),
                    DropdownMenuItem(value: 'Thoughtful analysis', child: Text('Thoughtful analysis')),
                    DropdownMenuItem(value: 'Opinion pieces', child: Text('Opinion pieces')),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _newsStyle = value ?? '';
                    });
                  },
                ),
                const SizedBox(height: AppTheme.spacingMedium),

                // News Scope
                Text(
                  'Do you prefer global perspectives, local updates, or both?',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppTheme.spacingSmall),
                DropdownButtonFormField<String>(
                  value: _newsScope.isEmpty ? null : _newsScope,
                  decoration: const InputDecoration(
                    hintText: 'Select an option',
                  ),
                  items: const [
                    DropdownMenuItem(value: 'global', child: Text('Global perspectives')),
                    DropdownMenuItem(value: 'local', child: Text('Local updates')),
                    DropdownMenuItem(value: 'both', child: Text('Both')),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _newsScope = value ?? '';
                    });
                  },
                ),
                const SizedBox(height: AppTheme.spacingXLarge),

                // Divider
                const Divider(),
                const SizedBox(height: AppTheme.spacingMedium),

                // Password section
                Center(
                  child: Text(
                    'Secure Your Account',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: AppTheme.spacingXSmall),
                Center(
                  child: Text(
                    'Create a password to protect your account',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontStyle: FontStyle.italic,
                        ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: AppTheme.spacingMedium),

                // Password field
                Text(
                  'Password',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppTheme.spacingSmall),
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    hintText: 'At least 6 characters',
                    prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.mutedTan),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                        color: AppTheme.mutedTan,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a password';
                    }
                    if (value.length < 6) {
                      return 'Password must be at least 6 characters';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: AppTheme.spacingMedium),

                // Confirm password field
                Text(
                  'Confirm Password',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppTheme.spacingSmall),
                TextFormField(
                  controller: _confirmPasswordController,
                  obscureText: _obscureConfirmPassword,
                  decoration: InputDecoration(
                    hintText: 'Re-enter your password',
                    prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.mutedTan),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscureConfirmPassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                        color: AppTheme.mutedTan,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscureConfirmPassword = !_obscureConfirmPassword;
                        });
                      },
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please confirm your password';
                    }
                    if (value != _passwordController.text) {
                      return 'Passwords do not match';
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
                          : const Text(
                              'Complete Setup',
                              style: TextStyle(fontSize: 16),
                            ),
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
