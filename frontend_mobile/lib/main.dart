import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme.dart';
import 'screens/auth_screen.dart';
import 'screens/landing_page.dart';
import 'screens/forgot_password_screen.dart';
import 'providers/auth_provider.dart';
import 'services/api_service.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: MaterialApp(
        title: 'IntelliBrief',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const AuthScreen(),
        routes: {
          '/landing': (context) => const LandingPage(),
        },
        onGenerateRoute: (settings) {
          // Handle forgot password route with email argument
          if (settings.name == '/forgot-password') {
            final email = settings.arguments as String;

            // Request password reset and navigate to screen
            return MaterialPageRoute(
              builder: (context) => FutureBuilder(
                future: ApiService().requestPasswordReset(email),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return Scaffold(
                      backgroundColor: AppTheme.offWhite,
                      appBar: AppBar(title: const Text('IntelliBrief')),
                      body: const Center(
                        child: CircularProgressIndicator(),
                      ),
                    );
                  }

                  if (snapshot.hasError) {
                    // Show error and go back
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Failed to send reset code: ${snapshot.error}'),
                          backgroundColor: Colors.red,
                        ),
                      );
                      Navigator.of(context).pop();
                    });
                    return const SizedBox();
                  }

                  // Success - show forgot password screen
                  return ForgotPasswordScreen(email: email);
                },
              ),
            );
          }
          return null;
        },
      ),
    );
  }
}


