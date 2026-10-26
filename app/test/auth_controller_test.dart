import 'package:flutter_test/flutter_test.dart';
import 'package:mirqah/core/auth/auth_controller.dart';

void main() {
  group('AuthController (بدون خادم)', () {
    test('يبدأ دون مستخدم', () {
      expect(AuthController().isSignedIn, isFalse);
    });

    test('الدخول التجريبي ثم الخروج', () async {
      final auth = AuthController();
      var notified = 0;
      auth.addListener(() => notified++);

      auth.enterDemo();
      expect(auth.isSignedIn, isTrue);
      expect(auth.user!.isDemo, isTrue);

      await auth.signOut();
      expect(auth.isSignedIn, isFalse);
      expect(notified, 2);
    });

    test('الدخول الحقيقي يرفض برسالة عربية عند غياب الخادم', () {
      expect(
        AuthController().signIn(email: 'a@b.sa', password: '123456'),
        throwsA(isA<AuthFailure>()),
      );
    });
  });
}
