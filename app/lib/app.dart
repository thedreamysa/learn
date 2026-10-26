import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';

import 'core/auth/auth_controller.dart';
import 'core/auth/auth_scope.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

class MirqahApp extends StatefulWidget {
  const MirqahApp({super.key});

  @override
  State<MirqahApp> createState() => _MirqahAppState();
}

class _MirqahAppState extends State<MirqahApp> {
  // يُنشآن مرة واحدة طوال عمر التطبيق.
  late final AuthController _auth = AuthController();
  late final GoRouter _router = createRouter(_auth);

  @override
  void dispose() {
    _router.dispose();
    _auth.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'مرقاة',
      debugShowCheckedModeBanner: false,
      locale: const Locale('ar', 'SA'),
      supportedLocales: const [Locale('ar', 'SA'), Locale('en')],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.system,
      routerConfig: _router,
      builder: (context, child) => AuthScope(controller: _auth, child: child!),
    );
  }
}
