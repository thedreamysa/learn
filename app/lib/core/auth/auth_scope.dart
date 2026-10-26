import 'package:flutter/widgets.dart';

import 'auth_controller.dart';

/// يتيح الوصول إلى [AuthController] من أي شاشة.
class AuthScope extends InheritedNotifier<AuthController> {
  const AuthScope({
    super.key,
    required AuthController controller,
    required super.child,
  }) : super(notifier: controller);

  /// للاستخدام داخل `build`: تُعاد رسم الشاشة عند تغيّر حالة الدخول.
  static AuthController of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<AuthScope>()!.notifier!;

  /// للاستخدام داخل الأحداث (الضغط على زر مثلاً).
  static AuthController read(BuildContext context) =>
      context.getInheritedWidgetOfExactType<AuthScope>()!.notifier!;
}
