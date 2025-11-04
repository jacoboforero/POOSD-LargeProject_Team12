import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/auth_provider.dart';
import 'onboarding_screen.dart';

/// Unified Authentication Screen
/// Handles both login and registration seamlessly
/// - Enter email → tries to login
/// - If user exists → show OTP field
/// - If user doesn't exist → go to onboarding
class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool otpSent = false;
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _otpController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final email = _emailController.text.trim();

    // Try to login first (existing user)
    bool success = await authProvider.login(email);

    if (success && mounted) {
      // Existing user - show OTP field
      setState(() {
        otpSent = true;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('OTP sent! Check your backend console for the code.'),
          backgroundColor: AppTheme.darkGray,
        ),
      );
    } else if (mounted && authProvider.errorMessage != null) {
      // Debug: Print the actual error message
      print('DEBUG: Error message = "${authProvider.errorMessage}"');

      // Check if error is "User not found" - means new user
      final errorMsg = authProvider.errorMessage!.toLowerCase();
      print('DEBUG: Lowercase error = "$errorMsg"');
      print('DEBUG: Contains "not found"? ${errorMsg.contains('not found')}');
      print('DEBUG: Contains "register"? ${errorMsg.contains('register')}');

      if (errorMsg.contains('not found') ||
          errorMsg.contains('register first') ||
          errorMsg.contains('register') ||
          errorMsg.contains('does not exist') ||
          errorMsg.contains('no user')) {
        // New user - navigate to onboarding
        print('DEBUG: New user detected! Navigating to onboarding...');
        authProvider.clearError();

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('New user detected! Let\'s set up your preferences.'),
            backgroundColor: AppTheme.darkGray,
            duration: Duration(seconds: 2),
          ),
        );

        // Navigate to onboarding after a brief delay
        Future.delayed(const Duration(milliseconds: 500), () async {
          if (mounted) {
            final result = await Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => OnboardingScreen(email: email),
              ),
            );

            // If onboarding completed and sent OTP, show OTP entry screen
            if (result != null && result is Map && result['otpSent'] == true && mounted) {
              setState(() {
                otpSent = true;
                _emailController.text = result['email'] ?? email;
              });

              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('OTP sent! Check your backend console for the code.'),
                  backgroundColor: AppTheme.darkGray,
                ),
              );
            }
          }
        });
      } else {
        // Other error - show to user
        print('DEBUG: Showing error to user: ${authProvider.errorMessage!}');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${authProvider.errorMessage!}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  Future<void> _verifyOtp() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final email = _emailController.text.trim();
    final code = _otpController.text.trim();

    final success = await authProvider.verifyOtp(email, code);

    if (success && mounted) {
      // Navigate to landing page
      Navigator.of(context).pushReplacementNamed('/landing');
    } else if (mounted && authProvider.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage!),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _backToEmail() {
    setState(() {
      otpSent = false;
      _otpController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.offWhite,
      appBar: AppBar(
        title: Text(
          'IntelliBrief',
          style: Theme.of(context).appBarTheme.titleTextStyle,
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppTheme.paddingPage),
            child: _buildAuthCard(context),
          ),
        ),
      ),
    );
  }

  Widget _buildAuthCard(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

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
              children: [
                // Title
                Text(
                  otpSent ? 'Enter Verification Code' : 'Welcome',
                  style: Theme.of(context).textTheme.displaySmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppTheme.spacingMedium),

                if (!otpSent) ...[
                  // Instruction text
                  Text(
                    'Enter your email to continue',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.darkText.withValues(alpha: 0.7),
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppTheme.spacingLarge),

                  // Email field
                  _buildTextField(
                    controller: _emailController,
                    hint: 'Email',
                    icon: Icons.email_outlined,
                    keyboardType: TextInputType.emailAddress,
                    enabled: !authProvider.isLoading,
                  ),
                  const SizedBox(height: AppTheme.spacingLarge),

                  // Send OTP button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: authProvider.isLoading ? null : _sendOtp,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          vertical: AppTheme.spacingXSmall,
                        ),
                        child: authProvider.isLoading
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
                                'Continue',
                                style: TextStyle(fontSize: 16),
                              ),
                      ),
                    ),
                  ),
                ] else ...[
                  // Instructions for OTP
                  Text(
                    'A 6-digit code has been sent to:\n${_emailController.text}',
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppTheme.spacingSmall),
                  Text(
                    'Check your backend console for the code',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontStyle: FontStyle.italic,
                          color: AppTheme.darkText.withValues(alpha: 0.7),
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppTheme.spacingLarge),

                  // OTP field
                  _buildTextField(
                    controller: _otpController,
                    hint: 'Enter 6-digit code',
                    icon: Icons.lock_outline,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    enabled: !authProvider.isLoading,
                  ),
                  const SizedBox(height: AppTheme.spacingLarge),

                  // Verify button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: authProvider.isLoading ? null : _verifyOtp,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          vertical: AppTheme.spacingXSmall,
                        ),
                        child: authProvider.isLoading
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
                                'Verify & Login',
                                style: TextStyle(fontSize: 16),
                              ),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacingMedium),

                  // Back button
                  TextButton(
                    onPressed: authProvider.isLoading ? null : _backToEmail,
                    child: const Text(
                      'Back to email',
                      style: TextStyle(
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    int? maxLength,
    bool enabled = true,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      maxLength: maxLength,
      enabled: enabled,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: Icon(icon, color: AppTheme.mutedTan),
        counterText: '', // Hide character counter
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter $hint';
        }
        if (hint == 'Email' && !value.contains('@')) {
          return 'Please enter a valid email';
        }
        if (hint.contains('code') && value.length != 6) {
          return 'Code must be 6 digits';
        }
        return null;
      },
    );
  }
}
