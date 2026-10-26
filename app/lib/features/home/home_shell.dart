import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/auth/auth_scope.dart';
import '../../core/widgets/mirqah_logo.dart';

class _Destination {
  const _Destination(this.path, this.label, this.icon, this.selectedIcon);

  final String path;
  final String label;
  final IconData icon;
  final IconData selectedIcon;
}

const _destinations = [
  _Destination('/', 'الرئيسية', Icons.home_outlined, Icons.home),
  _Destination('/classes', 'فصولي', Icons.groups_outlined, Icons.groups),
  _Destination('/attendance', 'الرصد', Icons.fact_check_outlined, Icons.fact_check),
  _Destination('/tools', 'أدوات الصف', Icons.auto_awesome_outlined, Icons.auto_awesome),
  _Destination('/reports', 'التقارير', Icons.insert_chart_outlined, Icons.insert_chart),
];

/// الهيكل الثابت حول كل الشاشات: قائمة جانبية على الحاسب، وشريط سفلي على الجوال.
class HomeShell extends StatelessWidget {
  const HomeShell({super.key, required this.location, required this.child});

  final String location;
  final Widget child;

  int get _index {
    final i = _destinations.indexWhere((d) => d.path == location);
    return i < 0 ? 0 : i;
  }

  @override
  Widget build(BuildContext context) {
    final wide = MediaQuery.sizeOf(context).width >= 840;
    void go(int i) => context.go(_destinations[i].path);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const MirqahLogo(size: 28),
            const SizedBox(width: 10),
            Text(
              'مِرقاة',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
          ],
        ),
        actions: const [_AccountMenu(), SizedBox(width: 8)],
      ),
      body: Column(
        children: [
          if (AuthScope.of(context).user?.isDemo ?? false) const _DemoBanner(),
          Expanded(
            child: wide
                ? Row(
                    children: [
                      NavigationRail(
                        selectedIndex: _index,
                        onDestinationSelected: go,
                        labelType: NavigationRailLabelType.all,
                        destinations: [
                          for (final d in _destinations)
                            NavigationRailDestination(
                              icon: Icon(d.icon),
                              selectedIcon: Icon(d.selectedIcon),
                              label: Text(d.label),
                            ),
                        ],
                      ),
                      const VerticalDivider(width: 1),
                      Expanded(child: child),
                    ],
                  )
                : child,
          ),
        ],
      ),
      bottomNavigationBar: wide
          ? null
          : NavigationBar(
              selectedIndex: _index,
              onDestinationSelected: go,
              destinations: [
                for (final d in _destinations)
                  NavigationDestination(
                    icon: Icon(d.icon),
                    selectedIcon: Icon(d.selectedIcon),
                    label: d.label,
                  ),
              ],
            ),
    );
  }
}

class _DemoBanner extends StatelessWidget {
  const _DemoBanner();

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      width: double.infinity,
      color: scheme.secondaryContainer,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Text(
        'أنت في الوضع التجريبي — البيانات المعروضة للتوضيح فقط.',
        style: TextStyle(color: scheme.onSecondaryContainer),
      ),
    );
  }
}

class _AccountMenu extends StatelessWidget {
  const _AccountMenu();

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);
    final name = auth.user?.displayName ?? '';

    return PopupMenuButton<String>(
      tooltip: 'الحساب',
      onSelected: (value) {
        if (value == 'logout') auth.signOut();
      },
      itemBuilder: (context) => [
        PopupMenuItem(enabled: false, child: Text(name)),
        const PopupMenuDivider(),
        const PopupMenuItem(
          value: 'logout',
          child: ListTile(
            leading: Icon(Icons.logout),
            title: Text('تسجيل الخروج'),
            contentPadding: EdgeInsets.zero,
          ),
        ),
      ],
      child: CircleAvatar(
        child: Text(name.isEmpty ? '؟' : name.characters.first),
      ),
    );
  }
}
