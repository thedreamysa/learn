// هذا الملف موجود عمداً: يمنع `flutter create .` من إنشاء اختبار افتراضي لا يتوافق مع التطبيق.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mirqah/core/widgets/mirqah_logo.dart';

void main() {
  testWidgets('الشعار يرسم ثلاث درجات ونقطة', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: Center(child: MirqahLogo(size: 100)))),
    );

    expect(find.byType(MirqahLogo), findsOneWidget);
    expect(tester.getSize(find.byType(MirqahLogo)), const Size(100, 100));
    expect(
      find.descendant(of: find.byType(MirqahLogo), matching: find.byType(Container)),
      findsNWidgets(4),
    );
  });
}
