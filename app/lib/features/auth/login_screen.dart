import 'package:flutter/material.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/auth/auth_scope.dart';
import '../../core/config/env.dart';
import '../../core/widgets/mirqah_logo.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: LayoutBuilder(
        builder: (context, constraints) {
          // على الشاشات العريضة (حاسب، تابلت أفقي) نعرض لوحة الهوية بجانب النموذج.
          if (constraints.maxWidth >= 900) {
            return const Row(
              children: [
                Expanded(child: _BrandPanel()),
                Expanded(child: Center(child: _LoginForm())),
              ],
            );
          }
          return const SafeArea(child: Center(child: _LoginForm()));
        },
      ),
    );
  }
}

class _BrandPanel extends StatelessWidget {
  const _BrandPanel();

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: AlignmentDirectional.topStart,
          end: AlignmentDirectional.bottomEnd,
          colors: [scheme.primary, Color.lerp(scheme.primary, Colors.black, 0.35)!],
        ),
      ),
      padding: const EdgeInsets.all(48),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const MirqahLogo(size: 72, onDark: true),
          const SizedBox(height: 32),
          Text(
            'مِرقاة',
            style: text.displayMedium?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'منصة واحدة يرتقي بها المعلم والمدرسة والطالب.',
            style: text.titleLarge?.copyWith(color: Colors.white70),
          ),
          const SizedBox(height: 40),
          for (final feature in const [
            'الكشوف والحضور والدرجات في مكان واحد',
            'تحضير مدرستي واستيراد نور بضغطة',
            'يعمل على الجوال والحاسب ودون إنترنت',
          ])
            Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.white, size: 22),
                  const SizedBox(width: 12),
                  Text(
                    feature,
                    style: text.titleMedium?.copyWith(color: Colors.white),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _LoginForm extends StatefulWidget {
  const _LoginForm();

  @override
  State<_LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<_LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await AuthScope.read(context)
          .signIn(email: _email.text, password: _password.text);
    } on AuthFailure catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _comingSoon(String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$feature — قريباً')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 420),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Center(child: MirqahLogo()),
              const SizedBox(height: 24),
              Text(
                'أهلاً بك في مِرقاة',
                textAlign: TextAlign.center,
                style: text.headlineMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Text(
                'سجّل دخولك لمتابعة فصولك وطلابك',
                textAlign: TextAlign.center,
                style: text.bodyLarge?.copyWith(color: scheme.onSurfaceVariant),
              ),
              const SizedBox(height: 32),
              TextFormField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                textDirection: TextDirection.ltr,
                autofillHints: const [AutofillHints.email],
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'البريد الإلكتروني',
                  prefixIcon: Icon(Icons.alternate_email),
                ),
                validator: (v) => (v == null || !v.contains('@'))
                    ? 'أدخل بريداً إلكترونياً صحيحاً'
                    : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _password,
                obscureText: _obscure,
                textDirection: TextDirection.ltr,
                autofillHints: const [AutofillHints.password],
                onFieldSubmitted: (_) => _submit(),
                decoration: InputDecoration(
                  labelText: 'كلمة المرور',
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    tooltip: _obscure ? 'إظهار' : 'إخفاء',
                    icon: Icon(_obscure
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                ),
                validator: (v) => (v == null || v.length < 6)
                    ? 'كلمة المرور 6 أحرف على الأقل'
                    : null,
              ),
              Align(
                alignment: AlignmentDirectional.centerEnd,
                child: TextButton(
                  onPressed: () => _comingSoon('استعادة كلمة المرور'),
                  child: const Text('نسيت كلمة المرور؟'),
                ),
              ),
              if (_error != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: scheme.errorContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _error!,
                    style: TextStyle(color: scheme.onErrorContainer),
                  ),
                ),
                const SizedBox(height: 16),
              ],
              FilledButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox.square(
                        dimension: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.5),
                      )
                    : const Text('تسجيل الدخول'),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: AuthScope.read(context).enterDemo,
                icon: const Icon(Icons.play_circle_outline),
                label: const Text('جرّب التطبيق دون حساب'),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('ليس لديك حساب؟', style: text.bodyMedium),
                  TextButton(
                    onPressed: () => _comingSoon('إنشاء حساب'),
                    child: const Text('أنشئ حساباً مجانياً'),
                  ),
                ],
              ),
              if (!Env.hasBackend)
                Text(
                  'وضع التطوير: الخادم غير مربوط',
                  textAlign: TextAlign.center,
                  style: text.labelSmall?.copyWith(color: scheme.outline),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
