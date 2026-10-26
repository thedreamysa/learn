import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/env.dart';

class AppUser {
  const AppUser({
    required this.id,
    required this.displayName,
    this.email,
    this.isDemo = false,
  });

  final String id;
  final String displayName;
  final String? email;
  final bool isDemo;
}

/// خطأ تسجيل دخول برسالة عربية جاهزة للعرض.
class AuthFailure implements Exception {
  const AuthFailure(this.message);
  final String message;

  @override
  String toString() => message;
}

/// يحفظ حالة الدخول ويُبلغ الواجهة والتنقل عند تغيّرها.
class AuthController extends ChangeNotifier {
  AuthController() {
    if (Env.hasBackend) {
      final auth = Supabase.instance.client.auth;
      _user = _fromSupabase(auth.currentUser);
      _subscription = auth.onAuthStateChange.listen((state) {
        _user = _fromSupabase(state.session?.user);
        notifyListeners();
      });
    }
  }

  StreamSubscription<AuthState>? _subscription;
  AppUser? _user;

  AppUser? get user => _user;
  bool get isSignedIn => _user != null;

  Future<void> signIn({required String email, required String password}) async {
    if (!Env.hasBackend) {
      throw const AuthFailure('الخادم غير مهيأ بعد. استخدم الدخول التجريبي.');
    }
    try {
      await Supabase.instance.client.auth
          .signInWithPassword(email: email.trim(), password: password);
    } on AuthException catch (e) {
      throw AuthFailure(_translate(e));
    }
  }

  void enterDemo() {
    _user = const AppUser(
      id: 'demo',
      displayName: 'أ. معلم تجريبي',
      isDemo: true,
    );
    notifyListeners();
  }

  Future<void> signOut() async {
    if (Env.hasBackend && _user?.isDemo == false) {
      await Supabase.instance.client.auth.signOut();
    }
    _user = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  static AppUser? _fromSupabase(User? user) {
    if (user == null) return null;
    final name = user.userMetadata?['full_name'] as String?;
    return AppUser(
      id: user.id,
      displayName: name ?? user.email ?? 'مستخدم',
      email: user.email,
    );
  }

  static String _translate(AuthException e) {
    final message = e.message.toLowerCase();
    if (message.contains('invalid login credentials')) {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
    }
    if (message.contains('email not confirmed')) {
      return 'يرجى تأكيد بريدك الإلكتروني أولاً.';
    }
    return 'تعذّر تسجيل الدخول، حاول مرة أخرى.';
  }
}
