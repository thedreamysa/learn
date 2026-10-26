/// بيانات توضيحية للوضع التجريبي. تُستبدل ببيانات الخادم في المرحلة الثانية.
class LessonSlot {
  const LessonSlot({
    required this.period,
    required this.time,
    required this.subject,
    required this.className,
    required this.prepared,
  });

  final int period;
  final String time;
  final String subject;
  final String className;

  /// هل حضّر المعلم هذا الدرس على منصة مدرستي؟
  final bool prepared;
}

const demoSchedule = [
  LessonSlot(period: 1, time: '7:00', subject: 'الرياضيات', className: 'الأول متوسط / 1', prepared: true),
  LessonSlot(period: 2, time: '7:45', subject: 'الرياضيات', className: 'الأول متوسط / 2', prepared: true),
  LessonSlot(period: 4, time: '9:30', subject: 'العلوم', className: 'الثاني متوسط / 1', prepared: false),
  LessonSlot(period: 6, time: '11:15', subject: 'الرياضيات', className: 'الثالث متوسط / 3', prepared: true),
];
