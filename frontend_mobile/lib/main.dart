import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme.dart';
import 'screens/auth_screen.dart';
import 'screens/landing_page.dart';
import 'providers/auth_provider.dart';

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
      ),
    );
  }
}


