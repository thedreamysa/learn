# مِرقاة — Mirqah

> **مِرقاة** (بكسر الميم): الدَّرَج والسُّلَّم الذي يُرتقى به. منصة واحدة يرتقي بها المعلم والمدرسة والطالب.

منصة سعودية شاملة للمدرسة الرقمية تجمع:

- **أدوات المعلم**: الكشوف، الحضور، الدرجات، السلوك، التحضير.
- **أدوات الصف**: التحفيز بالنقاط، الاختيار العشوائي، المؤقت، المجموعات.
- **إدارة المدرسة**: الجداول، التحضير الإلكتروني، المتابعة، التقارير.
- **التكامل** مع نظام نور ومنصة مدرستي عبر إضافة للمتصفح، بموافقة المعلم وداخل جلسته.

تعمل من كود واحد على: Android، iOS، الويب، Windows، macOS، Linux، بالإضافة إلى إضافة Chrome وEdge.

## هيكل المستودع

```
app/        تطبيق Flutter (جميع أنظمة التشغيل)
supabase/   قاعدة البيانات وسياسات الأمان (PostgreSQL)
extension/  إضافة المتصفح (تبدأ في المرحلة الثالثة)
docs/       الرؤية، المعمارية، خارطة الطريق، الهوية
```

## التشغيل لأول مرة

1. ثبّت [Git](https://git-scm.com/download/win) و[Flutter](https://docs.flutter.dev/get-started/install) (الإصدار 3.27 أو أحدث) وتأكد بالأمر `flutter doctor`.
2. انسخ المشروع. نفّذ كل سطر وحده (في PowerShell على ويندوز لا تستخدم `&&`):
   ```bash
   git clone https://github.com/thedreamysa/learn.git
   cd learn
   git checkout ccr-18793e70-uvlk0z
   cd app
   ```
3. أنشئ ملفات المنصات (مرة واحدة فقط):
   ```bash
   flutter create . --org sa.mirqah --project-name mirqah --platforms=android,ios,web,windows,macos,linux
   flutter pub get
   ```
4. شغّل التطبيق:
   ```bash
   flutter run -d chrome        # الويب
   flutter run -d windows       # ويندوز (أو macos / linux)
   flutter run                  # جهاز أندرويد أو آيفون متصل
   ```
5. يعمل التطبيق في **وضع التجربة** دون خادم. لربطه بـ Supabase:
   ```bash
   flutter run --dart-define=SUPABASE_URL=https://xxxx.supabase.co --dart-define=SUPABASE_ANON_KEY=xxxx
   ```

الشرح التفصيلي لكل مرحلة في [docs/ROADMAP.md](docs/ROADMAP.md) و[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
