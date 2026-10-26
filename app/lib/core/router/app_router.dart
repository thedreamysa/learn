import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/login_screen.dart';
import '../../features/dashboard/dashboard_screen.dart';
import '../../features/home/coming_soon_screen.dart';
import '../../features/home/home_shell.dart';
import '../auth/auth_controller.dart';

GoRouter createRouter(AuthController auth) {
  return GoRouter(
    initialLocation: '/',
    // يُعاد تقييم التوجيه كلما تغيّرت حالة الدخول.
    refreshListenable: auth,
    redirect: (context, state) {
      final atLogin = state.matchedLocation == '/login';
      if (!auth.isSignedIn) return atLogin ? null : '/login';
      if (atLogin) return '/';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) =>
            HomeShell(location: state.uri.path, child: child),
        routes: [
          _tab('/', const DashboardScreen()),
          _tab(
            '/classes',
            const ComingSoonScreen(
              title: 'فصولي',
              icon: Icons.groups_outlined,
              phase: 2,
            ),
          ),
          _tab(
            '/attendance',
            const ComingSoonScreen(
              title: 'الحضور والرصد',
              icon: Icons.fact_check_outlined,
              phase: 2,
            ),
          ),
          _tab(
            '/tools',
            const ComingSoonScreen(
              title: 'أدوات الصف',
              icon: Icons.auto_awesome_outlined,
              phase: 4,
            ),
          ),
          _tab(
            '/reports',
            const ComingSoonScreen(
              title: 'التقارير',
              icon: Icons.insert_chart_outlined,
              phase: 5,
            ),
          ),
        ],
      ),
    ],
  );
}

GoRoute _tab(String path, Widget screen) => GoRoute(
      path: path,
      pageBuilder: (context, state) => NoTransitionPage(child: screen),
    );
