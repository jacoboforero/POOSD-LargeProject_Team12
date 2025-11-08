import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import 'reset_password_screen.dart';

/// Forgot Password Screen
/// User enters the 6-digit OTP code sent to their email
class ForgotPasswordScreen extends StatefulWidget {
  final String email;

  const ForgotPasswordScreen({
    super.key,
    required this.email,
  });

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _codeController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _verifyCode() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final apiService = ApiService();
      await apiService.verifyResetCode(widget.email, _codeController.text.trim());

      if (mounted) {
        // Code verified - navigate to reset password screen
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (context) => ResetPasswordScreen(
              email: widget.email,
              code: _codeController.text.trim(),
            ),
          ),
        );
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
                  'Reset Your Password',
                  style: Theme.of(context).textTheme.displaySmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppTheme.spacingMedium),

                // Email info
                Text(
                  'A reset code has been sent to:',
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
                const SizedBox(height: AppTheme.spacingSmall),

                // Email hint
                Text(
                  'Check your email for the reset code',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontStyle: FontStyle.italic,
                        color: AppTheme.darkText.withValues(alpha: 0.6),
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppTheme.spacingLarge),

                // Code input field
                TextFormField(
                  controller: _codeController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  enabled: !_isLoading,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 8,
                  ),
                  decoration: const InputDecoration(
                    hintText: '',
                    prefixIcon: Icon(Icons.lock_outline, color: AppTheme.mutedTan),
                    counterText: '', // Hide character counter
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter the reset code';
                    }
                    if (value.length != 6) {
                      return 'Code must be 6 digits';
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

                // Verify button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _verifyCode,
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
                              'Verify Code',
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
                    'Back to login',
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
