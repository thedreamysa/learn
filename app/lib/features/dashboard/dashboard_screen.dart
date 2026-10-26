import 'package:flutter/material.dart';

import '../../core/auth/auth_scope.dart';
import '../../core/theme/app_colors.dart';
import 'demo_data.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final user = AuthScope.of(context).user;
    final today = MaterialLocalizations.of(context).formatFullDate(DateTime.now());
    final prepared = demoSchedule.where((l) => l.prepared).length;

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          'مرحباً، ${user?.displayName ?? ''}',
          style: text.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 4),
        Text(today, style: text.bodyMedium?.copyWith(color: scheme.onSurfaceVariant)),
        const SizedBox(height: 20),
        _ResponsiveGrid(
          minItemWidth: 160,
          children: [
            const _StatCard(label: 'فصولي', value: '4', icon: Icons.groups, color: AppColors.primary),
            const _StatCard(label: 'الطلاب', value: '128', icon: Icons.person, color: AppColors.gold),
            const _StatCard(label: 'حضور اليوم', value: '96%', icon: Icons.how_to_reg, color: AppColors.success),
            _StatCard(
              label: 'التحضير',
              value: '$prepared/${demoSchedule.length}',
              icon: Icons.menu_book,
              color: prepared == demoSchedule.length ? AppColors.success : AppColors.warning,
            ),
          ],
        ),
        const SizedBox(height: 28),
        Text('إجراءات سريعة', style: text.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        const _ResponsiveGrid(
          minItemWidth: 150,
          children: [
            _QuickAction(label: 'رصد الحضور', icon: Icons.fact_check),
            _QuickAction(label: 'إدخال الدرجات', icon: Icons.grading),
            _QuickAction(label: 'اختيار عشوائي', icon: Icons.casino),
            _QuickAction(label: 'استيراد من نور', icon: Icons.cloud_download),
          ],
        ),
        const SizedBox(height: 28),
        Text('حصص اليوم', style: text.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        for (final lesson in demoSchedule) _LessonTile(lesson: lesson),
      ],
    );
  }
}

/// شبكة تتكيف مع عرض الشاشة: عمودان على الجوال وأكثر على الحاسب.
class _ResponsiveGrid extends StatelessWidget {
  const _ResponsiveGrid({required this.minItemWidth, required this.children});

  final double minItemWidth;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    const spacing = 12.0;
    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = (constraints.maxWidth / (minItemWidth + spacing))
            .floor()
            .clamp(2, children.length);
        final itemWidth = (constraints.maxWidth - spacing * (columns - 1)) / columns;
        return Wrap(
          spacing: spacing,
          runSpacing: spacing,
          children: [
            for (final child in children) SizedBox(width: itemWidth, child: child),
          ],
        );
      },
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Card(
      elevation: 0,
      color: color.withValues(alpha: 0.08),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color),
            const SizedBox(height: 12),
            Text(value, style: text.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
            Text(label, style: text.bodyMedium),
          ],
        ),
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({required this.label, required this.icon});

  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Material(
      color: scheme.surfaceContainerHigh,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: () => ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('«$label» — يُبنى في المرحلة القادمة')),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
          child: Column(
            children: [
              Icon(icon, size: 30, color: scheme.primary),
              const SizedBox(height: 8),
              Text(label, textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}

class _LessonTile extends StatelessWidget {
  const _LessonTile({required this.lesson});

  final LessonSlot lesson;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final statusColor = lesson.prepared ? AppColors.success : AppColors.warning;

    return Card(
      elevation: 0,
      color: scheme.surfaceContainerLow,
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: scheme.primaryContainer,
          child: Text('${lesson.period}'),
        ),
        title: Text('${lesson.subject} — ${lesson.className}'),
        subtitle: Text('الحصة ${lesson.period} • ${lesson.time}'),
        trailing: Chip(
          label: Text(lesson.prepared ? 'محضَّر' : 'غير محضَّر'),
          labelStyle: TextStyle(color: statusColor, fontWeight: FontWeight.w600),
          backgroundColor: statusColor.withValues(alpha: 0.1),
          side: BorderSide.none,
        ),
      ),
    );
  }
}
