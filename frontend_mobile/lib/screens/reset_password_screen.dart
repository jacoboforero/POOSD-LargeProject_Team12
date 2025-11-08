import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

/// Reset Password Screen
/// User creates a new password after verifying the reset code
class ResetPasswordScreen extends StatefulWidget {
  final String email;
  final String code;

  const ResetPasswordScreen({
    super.key,
    required this.email,
    required this.code,
  });

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _resetPassword() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final apiService = ApiService();
      await apiService.resetPassword(
        widget.email,
        widget.code,
        _passwordController.text.trim(),
      );

      if (mounted) {
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Password reset successful! Please log in with your new password.'),
            backgroundColor: AppTheme.darkGray,
            duration: Duration(seconds: 3),
          ),
        );

        // Navigate back to auth screen (pop all password reset screens)
        Navigator.of(context).popUntil((route) => route.isFirst);
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
            child: _buildCard(context),
          ),
        ),
      ),
    );
  }

  Widget _buildCard(BuildContext context) {
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
                  'Create New Password',
                  style: Theme.of(context).textTheme.displaySmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppTheme.spacingMedium),

                // Subtitle
                Text(
                  'Enter your new password for:',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppTheme.darkText.withValues(alpha: 0.7),
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppTheme.spacingXSmall),
                Text(
                  widget.email,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppTheme.spacingLarge),

                // New password field
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  enabled: !_isLoading,
                  decoration: InputDecoration(
                    hintText: 'New Password',
                    prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.mutedTan),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
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
                TextFormField(
                  controller: _confirmPasswordController,
                  obscureText: _obscureConfirmPassword,
                  enabled: !_isLoading,
                  decoration: InputDecoration(
                    hintText: 'Confirm New Password',
                    prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.mutedTan),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscureConfirmPassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
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
                const SizedBox(height: AppTheme.spacingLarge),

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
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacingMedium),
                ],

                // Reset password button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _resetPassword,
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
                              'Reset Password',
                              style: TextStyle(fontSize: 16),
                            ),
                    ),
                  ),
                ),
                const SizedBox(height: AppTheme.spacingMedium),

                // Back button
                TextButton(
                  onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
                  child: const Text(
                    'Back',
                    style: TextStyle(
                      decoration: TextDecoration.underline,
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
