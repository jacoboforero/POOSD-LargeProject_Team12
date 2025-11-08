import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import 'onboarding_screen.dart';

/// Unified Authentication Screen
/// Handles both login and registration seamlessly
/// - Enter email → check if user exists
/// - If user exists → show password field → verify password → show OTP field → login
/// - If user doesn't exist → go to onboarding
class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool showPasswordField = false;
  bool showOtpField = false;
  bool isCheckingUser = false;
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _otpController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _handleEmailSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final email = _emailController.text.trim();
    final apiService = ApiService();

    setState(() {
      isCheckingUser = true;
    });

    try {
      // Check if user exists
      final userExists = await apiService.checkUserExists(email);

      if (mounted) {
        setState(() {
          isCheckingUser = false;
        });

        if (userExists) {
          // Existing user - show password field
          setState(() {
            showPasswordField = true;
          });
        } else {
          // New user - navigate to onboarding
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('New user detected! Let\'s set up your preferences.'),
              backgroundColor: AppTheme.darkGray,
              duration: Duration(seconds: 2),
            ),
          );

          Future.delayed(const Duration(milliseconds: 500), () async {
            if (mounted) {
              final result = await Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => OnboardingScreen(email: email),
                ),
              );

              // If onboarding completed and OTP sent, show OTP field
              if (result != null && result is Map && result['otpSent'] == true && mounted) {
                setState(() {
                  showOtpField = true;
                  _emailController.text = result['email'] ?? email;
                });
              }
            }
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isCheckingUser = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error checking user: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _handlePasswordLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    final success = await authProvider.loginWithPassword(email, password);

    if (success && mounted) {
      // Password verified - show OTP field
      setState(() {
        showOtpField = true;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Verification code sent to your email! Check your inbox.'),
          backgroundColor: AppTheme.darkGray,
          duration: Duration(seconds: 5),
        ),
      );
    } else if (mounted && authProvider.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage!),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _handleOtpVerification() async {
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
      showPasswordField = false;
      showOtpField = false;
      _passwordController.clear();
      _otpController.clear();
    });
  }

  void _backToPassword() {
    setState(() {
      showOtpField = false;
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
                  showOtpField
                      ? 'Enter Verification Code'
                      : showPasswordField
                          ? 'Welcome Back'
                          : 'Welcome',
                  style: Theme.of(context).textTheme.displaySmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppTheme.spacingMedium),

                if (showOtpField) ...[
                  // OTP verification screen
                  Text(
                    'A verification code has been sent to:\n${_emailController.text}',
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppTheme.spacingSmall),
                  Text(
                    'Check your email for the verification code',
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
                      onPressed: authProvider.isLoading ? null : _handleOtpVerification,
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
                    onPressed: authProvider.isLoading ? null : _backToPassword,
                    child: const Text(
                      'Back to password',
                      style: TextStyle(
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ] else if (showPasswordField) ...[
                  // Password login screen
                  Text(
                    'Enter your password to continue',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.darkText.withValues(alpha: 0.7),
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppTheme.spacingLarge),

                  // Email field (disabled)
                  _buildTextField(
                    controller: _emailController,
                    hint: 'Email',
                    icon: Icons.email_outlined,
                    keyboardType: TextInputType.emailAddress,
                    enabled: false,
                  ),
                  const SizedBox(height: AppTheme.spacingMedium),

                  // Password field
                  _buildPasswordField(
                    controller: _passwordController,
                    hint: 'Password',
                    icon: Icons.lock_outline,
                    enabled: !authProvider.isLoading,
                  ),
                  const SizedBox(height: AppTheme.spacingSmall),

                  // Forgot password button
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: authProvider.isLoading ? null : () {
                        Navigator.of(context).pushNamed(
                          '/forgot-password',
                          arguments: _emailController.text.trim(),
                        );
                      },
                      child: const Text(
                        'Forgot password?',
                        style: TextStyle(
                          fontSize: 14,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacingMedium),

                  // Login button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: authProvider.isLoading ? null : _handlePasswordLogin,
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
                ] else ...[
                  // Email entry screen
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
                    enabled: !authProvider.isLoading && !isCheckingUser,
                  ),
                  const SizedBox(height: AppTheme.spacingLarge),

                  // Continue button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: (authProvider.isLoading || isCheckingUser) ? null : _handleEmailSubmit,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          vertical: AppTheme.spacingXSmall,
                        ),
                        child: (authProvider.isLoading || isCheckingUser)
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

  Widget _buildPasswordField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool enabled = true,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: _obscurePassword,
      enabled: enabled,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: Icon(icon, color: AppTheme.mutedTan),
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
          return 'Please enter your password';
        }
        if (value.length < 6) {
          return 'Password must be at least 6 characters';
        }
        return null;
      },
    );
  }
}
