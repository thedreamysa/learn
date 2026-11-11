// اختبارات الوحدات للمكتبات النقية: node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
require('../src/lib/numbers.js');
require('../src/lib/analyzer.js');
require('../src/lib/insights.js');
require('../src/lib/data.js');
const { numbers: n, analyzer, insights, data } = globalThis.Muin;

test('الأرقام الهندية والكسور والنسب', () => {
  assert.equal(n.toLatinDigits('١٤٫٥'), '14.5');
  assert.deepEqual(n.parseNumber('١٤'), { value: 14, max: null, percent: null, isPercent: false });
  assert.equal(n.parseNumber('17/20').percent, 85);
  assert.equal(n.parseNumber('17 من 20').max, 20);
  assert.equal(n.parseNumber('85٪').percent, 85);
  assert.equal(n.parseNumber('درجة 9').value, 9);
  assert.equal(n.parseNumber('عبدالله محمد'), null);
  assert.equal(n.parseNumber('2026-11-10'), null);
  assert.equal(n.maxFromHeader('اختبار قصير (15)'), 15);
  assert.equal(n.maxFromHeader('الواجبات من ١٠'), 10);
  assert.equal(n.guessMax(17), 20);
  assert.equal(n.normalizeArabic('الطالبة إيمان'), 'الطالبه ايمان');
});

test('حالات الحضور والتسليم: السلبي قبل الإيجابي', () => {
  assert.equal(analyzer.statusOf('لم يسلّم'), 'negative');
  assert.equal(analyzer.statusOf('تم التسليم'), 'positive');
  assert.equal(analyzer.statusOf('غائب'), 'negative');
  assert.equal(analyzer.statusOf('حاضر'), 'positive');
  assert.equal(analyzer.statusOf('متأخر'), 'partial');
  assert.equal(analyzer.statusOf('✗'), 'negative');
  assert.equal(analyzer.statusOf('غ'), 'negative');
});

const grades = {
  title: 'دفتر درجات الرياضيات',
  headers: ['م', 'اسم الطالب', 'رقم الهوية', 'اختبار قصير (15)', 'الواجبات (10)', 'المشاركة', 'المجموع'],
  rows: [
    ['1', 'عبدالله محمد', '1098765432', '14', '10', '9', '33/35'],
    ['2', 'فهد سعد', '1087654321', '6', '4', '5', '15/35'],
    ['3', 'خالد علي', '1076543210', '12.5', '8', '8', '28.5/35'],
    ['4', 'سلطان ناصر', '1065432109', '9', '-', '7', '16/35'],
    ['5', 'يوسف إبراهيم', '1054321098', '15', '10', '10', '35/35'],
  ],
};

test('تحليل الدرجات: أنواع الأعمدة والعظمى والنسب', () => {
  const a = analyzer.analyze(grades);
  assert.equal(a.kind, 'grades');
  assert.equal(a.columns[0].type, 'serial');
  assert.equal(a.columns[1].type, 'key');
  assert.equal(a.columns[2].type, 'id', 'رقم الهوية لا يُعامل كدرجة');
  assert.equal(a.columns[3].max, 15);
  assert.equal(a.columns[3].maxSource, 'header');
  assert.equal(a.columns[5].maxSource, 'guess');
  assert.equal(a.columns[5].max, 10);
  assert.ok(a.totalCol, 'يكتشف عمود المجموع');
  const yousef = a.results.find((r) => r.key === 'يوسف إبراهيم');
  assert.equal(yousef.percent, 100);
  assert.equal(yousef.band.label, 'ممتاز');
  const fahd = a.results.find((r) => r.key === 'فهد سعد');
  assert.ok(Math.abs(fahd.percent - 42.857) < 0.01);
  assert.ok(fahd.flags.some((f) => f.code === 'fail'));
  assert.equal(a.summary.passRate, 60);
});

test('المتوسط الموزون عند غياب عمود المجموع', () => {
  const t = { headers: ['الطالب', 'اختبار (20)', 'واجب (10)'], rows: [['أحمد', '20', '0'], ['سالم', '10', '10']] };
  const a = analyzer.analyze(t);
  assert.ok(Math.abs(a.results[0].percent - 66.667) < 0.01); // 20/30
  assert.ok(Math.abs(a.results[1].percent - 66.667) < 0.01);
});

test('تجاوزات المستخدم للعظمى والنوع', () => {
  const a = analyzer.analyze(Object.assign({}, grades, { overrides: { max: { 5: 20 }, kind: 'grades' } }));
  assert.equal(a.columns[5].max, 20);
  assert.equal(a.columns[5].maxSource, 'user');
});

test('تحليل الحضور', () => {
  const t = {
    headers: ['الطالب', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء'],
    rows: [['ريان', '✓', '✓', '✓', '✓'], ['نواف', 'غائب', 'غائب', 'حاضر', 'غائب'], ['بدر', 'حاضر', 'حاضر', 'حاضر', '✗']],
  };
  const a = analyzer.analyze(t);
  assert.equal(a.kind, 'attendance');
  assert.equal(a.statusCols.length, 4);
  const nawaf = a.results.find((r) => r.key === 'نواف');
  assert.equal(nawaf.negatives, 3);
  assert.equal(nawaf.negativeRate, 75);
  assert.ok(nawaf.flags.some((f) => f.code === 'absence'));
  assert.ok(Math.abs(a.summary.negativeRate - (4 / 12) * 100) < 0.001);
});

test('نشاط المعلمين', () => {
  const t = {
    title: 'نشاط المعلمين',
    headers: ['اسم المعلم', 'عدد الدروس', 'الواجبات المنشأة'],
    rows: [['أ. سعيد', '12', '5'], ['أ. محمد', '0', '0'], ['أ. علي', '6', '0']],
  };
  const a = analyzer.analyze(t);
  assert.equal(a.kind, 'teachers');
  assert.equal(a.countCols.length, 2);
  assert.equal(a.results[0].activityIndex, 100);
  assert.ok(a.results[1].flags.some((f) => f.code === 'inactive'));
  assert.ok(a.results[2].flags.some((f) => f.code === 'partial-activity'));
  const ins = insights.generate(a);
  assert.ok(ins.insights.some((i) => i.title.startsWith('بلا نشاط')));
});

test('الاستنتاجات لا تخترع أرقامًا', () => {
  const a = analyzer.analyze(grades);
  const ins = insights.generate(a);
  const overview = ins.insights[0].text;
  assert.match(overview, /نسبة النجاح 60٪/);
  assert.ok(ins.insights.some((i) => i.title.startsWith('المتميزون (2)')));
  assert.ok(ins.insights.some((i) => i.title.includes('دون الحد الأدنى (2)')));
  assert.ok(ins.insights.some((i) => i.title === 'تنبيه عن الدرجة العظمى'));
  assert.ok(ins.recommendations.length >= 2);
});

test('جدول فارغ لا يكسر شيئًا', () => {
  const a = analyzer.analyze({ headers: ['الاسم', 'الدرجة'], rows: [] });
  assert.equal(a.results.length, 0);
  assert.equal(insights.generate(a).insights[0].title, 'لا توجد بيانات');
});

test('CSV: BOM والحماية من حقن الصيغ', () => {
  const csv = data.toCSV(['الاسم', 'ملاحظة'], [['أحمد, علي', '=HYPERLINK("x")'], ['سالم', '-5']]);
  assert.ok(csv.startsWith('﻿'));
  assert.ok(csv.includes('"أحمد, علي"'));
  assert.ok(csv.includes(`"'=HYPERLINK(""x"")"`));
  assert.ok(csv.endsWith('سالم,-5'));
});

test('دمج صفحات الترقيم دون تكرار، ودمج أعمدة جديدة بالمفتاح', () => {
  const p1 = { headers: ['الطالب', 'الدرجة'], rows: [['أحمد', '10'], ['سالم', '8']] };
  const p2 = { headers: ['الطالب', 'الدرجة'], rows: [['سالم', '8'], ['ماجد', '7']] };
  const m = data.mergeTables(p1, p2, 'الطالب');
  assert.equal(m.rows.length, 3);
  const att = { headers: ['الطالب', 'الغياب'], rows: [['أحمد', '2'], ['ماجد', '0']] };
  const m2 = data.mergeTables(m, att, 'الطالب');
  assert.deepEqual(m2.headers, ['الطالب', 'الدرجة', 'الغياب']);
  assert.deepEqual(m2.rows.find((r) => r[0] === 'أحمد'), ['أحمد', '10', '2']);
  assert.deepEqual(m2.rows.find((r) => r[0] === 'سالم'), ['سالم', '8', '']);
});
