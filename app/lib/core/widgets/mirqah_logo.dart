import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// الشعار المبدئي: ثلاث درجات متصاعدة تعلوها نقطة ذهبية.
class MirqahLogo extends StatelessWidget {
  const MirqahLogo({super.key, this.size = 56, this.onDark = false});

  final double size;
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    final color = onDark ? Colors.white : Theme.of(context).colorScheme.primary;

    Widget step(double heightFactor) => Container(
          width: size * 0.22,
          height: size * heightFactor,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(size * 0.06),
          ),
        );

    return SizedBox.square(
      dimension: size,
      child: Stack(
        children: [
          Align(
            alignment: Alignment.bottomCenter,
            child: Row(
              // الدرجات تصعد من اليسار إلى اليمين بغض النظر عن اتجاه اللغة.
              textDirection: TextDirection.ltr,
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                step(0.3),
                SizedBox(width: size * 0.06),
                step(0.5),
                SizedBox(width: size * 0.06),
                step(0.7),
              ],
            ),
          ),
          Positioned(
            top: 0,
            right: size * 0.13,
            child: Container(
              width: size * 0.18,
              height: size * 0.18,
              decoration: const BoxDecoration(
                color: AppColors.gold,
                shape: BoxShape.circle,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
