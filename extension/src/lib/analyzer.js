/*
 * مُعين مدرستي — محلل البيانات.
 * يأخذ جدولًا خامًا { headers, rows } ويعيد فهمًا كاملًا له:
 * نوع الجدول، أنواع الأعمدة، إحصاءات كل عمود، ونتيجة كل صف (طالب/معلم).
 * لا يعتمد على DOM ولا على أي اتصال خارجي.
 */
(function (root) {
  'use strict';
  const Muin = (root.Muin = root.Muin || {});
  const N = () => Muin.numbers;

  /* ---------- الإعدادات الافتراضية ---------- */

  const DEFAULT_SETTINGS = {
    schoolName: '',
    educationOffice: '',
    teacherName: '',
    principalName: '',
    // حدود التقديرات (نسبة مئوية، الحد الأدنى لكل تقدير). قابلة للتعديل من الإعدادات.
    bands: [
      { label: 'ممتاز', min: 90, tone: 'excellent' },
      { label: 'جيد جدًا', min: 80, tone: 'vgood' },
      { label: 'جيد', min: 70, tone: 'good' },
      { label: 'مقبول', min: 50, tone: 'pass' },
      { label: 'دون الحد الأدنى', min: 0, tone: 'fail' },
    ],
    passMark: 50, // الحد الأدنى للنجاح (٪)
    riskMark: 60, // تحت هذه النسبة يُعد الطالب بحاجة إلى دعم
    absenceRateAlert: 10, // ٪ من الأيام/الحصص المرصودة
    absenceCountAlert: 5, // عدد مرات الغياب
    missingWorkAlert: 30, // ٪ من الواجبات غير المسلّمة
    showMoeLogo: false,
    retentionDays: 30,
  };

  /* ---------- القواميس ---------- */

  // كلمات مطبّعة (بلا همزات ولا تاء مربوطة) — انظر normalizeArabic
  const KEY_HEADERS = ['اسم الطالب', 'اسم الطالبه', 'الطالب', 'الطالبه', 'اسم المعلم', 'اسم المعلمه', 'المعلم', 'المعلمه', 'الاسم', 'اسم المستخدم', 'name', 'student'];
  const ID_HEADERS = ['رقم الهويه', 'الهويه', 'السجل المدني', 'رقم السجل', 'رقم الاقامه', 'الجوال', 'رقم الجوال', 'national id', 'id'];
  const SERIAL_HEADERS = ['م', '#', 'ت', 'الرقم', 'التسلسل', 'رقم', 'no', 'no.'];
  const TOTAL_HEADERS = ['المجموع', 'المجموع الكلي', 'النسبه', 'النسبه المئويه', 'المعدل', 'النهائي', 'الاجمالي', 'الدرجه النهائيه', 'المحصله', 'total', 'average'];

  const KIND_KEYWORDS = {
    grades: ['درجه', 'الدرجات', 'المجموع', 'التقدير', 'اختبار', 'فتره', 'نهائي', 'اعمال', 'مشاركه', 'مهام ادائيه', 'شفهي', 'تحريري', 'المحصله', 'النسبه'],
    attendance: ['حضور', 'غياب', 'غايب', 'حاضر', 'متاخر', 'تاخر', 'استيذان', 'استئذان', 'الحصه', 'اليوم'],
    assignments: ['واجب', 'الواجبات', 'تسليم', 'مسلم', 'سلم', 'مصحح', 'التصحيح', 'موعد التسليم'],
    teachers: ['المعلم', 'المعلمه', 'المعلمين', 'عدد الدروس', 'الدروس', 'الاثراءات', 'الواجبات المنشاه', 'الاختبارات المنشاه', 'نشاط', 'التحضير', 'الفصول الافتراضيه', 'البث المباشر'],
    exams: ['الاختبارات', 'اختبار قصير', 'محاولات', 'المحاوله', 'زمن الاختبار', 'بنك الاسيله'],
  };

  const KIND_LABELS = {
    grades: 'درجات وتقويم',
    attendance: 'حضور وغياب',
    assignments: 'واجبات وتسليم',
    teachers: 'نشاط المعلمين',
    exams: 'اختبارات',
    generic: 'بيانات عامة',
  };

  // حالات الخلايا. الترتيب مهم: السلبي قبل الإيجابي لأن "لم يسلم" تحتوي "سلم".
  const STATUS_NEGATIVE = ['لم يسلم', 'لم يتم التسليم', 'لم يتم', 'لم يحل', 'لم يدخل', 'لم يحضر', 'لم يشاهد', 'لم يبدا', 'غير مسلم', 'غير مكتمل', 'غير مجتاز', 'غايب', 'غياب', 'راسب', 'منقطع', 'متغيب'];
  const STATUS_PARTIAL = ['متاخر', 'تاخر', 'تسليم متاخر', 'مستاذن', 'استيذان', 'استئذان', 'معذور', 'بعذر', 'عذر', 'جزيي', 'قيد التصحيح', 'قيد المراجعه'];
  const STATUS_POSITIVE = ['حاضر', 'حاضره', 'سلم', 'مسلم', 'تم التسليم', 'تم', 'مكتمل', 'مكتمله', 'ناجح', 'مجتاز', 'شاهد', 'مصحح', 'منجز', 'نعم', 'yes', 'done'];
  const STATUS_EXACT = {
    'غ': 'negative', 'x': 'negative', '×': 'negative', '✗': 'negative', '✘': 'negative', 'لا': 'negative', 'no': 'negative', '0/1': 'negative',
    'ح': 'positive', '✓': 'positive', '✔': 'positive', '√': 'positive', '1/1': 'positive',
    'م': 'partial', 'ت': 'partial', 'ع': 'partial', 'ا': 'partial',
  };

  /* ---------- أدوات ---------- */

  function headerMatches(header, list) {
    const h = N().normalizeArabic(header).replace(/[:\-_()]/g, ' ').replace(/\s+/g, ' ').trim();
    return list.some((k) => h === k || h.startsWith(k + ' ') || h.endsWith(' ' + k) || (k.length > 3 && h.includes(k)));
  }

  function statusOf(raw) {
    const v = N().normalizeArabic(raw);
    if (!v) return null;
    if (STATUS_EXACT[v]) return STATUS_EXACT[v];
    if (v.length > 40) return null;
    if (STATUS_NEGATIVE.some((k) => v.includes(k))) return 'negative';
    if (STATUS_PARTIAL.some((k) => v.includes(k))) return 'partial';
    if (STATUS_POSITIVE.some((k) => v === k || v.startsWith(k + ' ') || (k.length > 2 && v.includes(k)))) return 'positive';
    return null;
  }

  function mean(a) { return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null; }
  function median(a) {
    if (!a.length) return null;
    const s = [...a].sort((x, y) => x - y);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  function stdev(a) {
    if (a.length < 2) return 0;
    const mu = mean(a);
    return Math.sqrt(a.reduce((s, x) => s + (x - mu) * (x - mu), 0) / (a.length - 1));
  }

  function bandFor(percent, settings) {
    if (percent == null) return null;
    const bands = [...settings.bands].sort((a, b) => b.min - a.min);
    return bands.find((b) => percent >= b.min) || bands[bands.length - 1];
  }

  function mergeSettings(s) {
    const out = Object.assign({}, DEFAULT_SETTINGS, s || {});
    if (!Array.isArray(out.bands) || !out.bands.length) out.bands = DEFAULT_SETTINGS.bands;
    return out;
  }

  /* ---------- تصنيف الأعمدة ---------- */

  function profileColumn(header, values, index) {
    const n = N();
    const nonEmpty = values.filter((v) => !n.isEmptyValue(v));
    const col = { index, header: header || `عمود ${index + 1}`, type: 'text', filled: nonEmpty.length, total: values.length };
    if (!nonEmpty.length) { col.type = 'empty'; return col; }

    const distinct = new Set(nonEmpty.map((v) => n.normalizeArabic(v)));
    col.distinct = distinct.size;

    const digitsOnly = nonEmpty.map((v) => n.toLatinDigits(n.cleanText(v)));
    const longIds = digitsOnly.filter((v) => /^\+?\d{8,}$/.test(v.replace(/\s/g, ''))).length;
    if (headerMatches(header, ID_HEADERS) || longIds / nonEmpty.length > 0.8) { col.type = 'id'; return col; }

    const parsed = nonEmpty.map(n.parseNumber);
    const numeric = parsed.filter(Boolean);
    const ints = numeric.map((p) => p.value);
    const isSequence = ints.length === nonEmpty.length && ints.every((v, i) => i === 0 || v === ints[i - 1] + 1) && ints[0] <= 1;
    if (isSequence && (headerMatches(header, SERIAL_HEADERS) || !header)) { col.type = 'serial'; return col; }
    if (isSequence && ints.length > 3) { col.type = 'serial'; return col; }

    const dates = nonEmpty.filter(n.looksLikeDate).length;
    if (dates / nonEmpty.length > 0.7) { col.type = 'date'; return col; }

    if (numeric.length / nonEmpty.length >= 0.6) {
      col.type = 'numeric';
      col.parsed = parsed;
      return col;
    }

    const statuses = nonEmpty.map(statusOf);
    const known = statuses.filter(Boolean).length;
    if (known / nonEmpty.length >= 0.6 || (distinct.size <= 6 && nonEmpty.length >= 6 && distinct.size / nonEmpty.length <= 0.5 && !headerMatches(header, KEY_HEADERS))) {
      col.type = 'status';
      return col;
    }

    if (headerMatches(header, KEY_HEADERS)) col.type = 'key';
    return col;
  }

  function chooseKeyColumn(columns, rows) {
    const named = columns.find((c) => c.type === 'key');
    if (named) return named.index;
    // أطول عمود نصي عربي بقيم شبه فريدة
    let best = null;
    for (const c of columns) {
      if (c.type !== 'text') continue;
      const vals = rows.map((r) => r[c.index] || '');
      const arabic = vals.filter((v) => /[؀-ۿ]{2,}/.test(v)).length / Math.max(1, vals.length);
      const uniq = (c.distinct || 0) / Math.max(1, c.filled);
      const words = mean(vals.map((v) => v.trim().split(/\s+/).length)) || 0;
      const score = arabic * 2 + uniq * 2 + Math.min(words, 4) / 2;
      if (!best || score > best.score) best = { index: c.index, score };
    }
    if (best) { columns[best.index].type = 'key'; return best.index; }
    const id = columns.find((c) => c.type === 'id');
    return id ? id.index : null;
  }

  function classifyKind(headers, columns, title) {
    const text = [title || '', ...headers].join(' | ');
    const scores = {};
    for (const [kind, words] of Object.entries(KIND_KEYWORDS)) {
      const t = N().normalizeArabic(text);
      scores[kind] = words.reduce((s, w) => s + (t.includes(w) ? 1 : 0), 0);
    }
    const statusCols = columns.filter((c) => c.type === 'status').length;
    const numericCols = columns.filter((c) => c.type === 'numeric').length;
    const keyHeader = columns.find((c) => c.type === 'key');
    const teacherKey = keyHeader && /معلم/.test(N().normalizeArabic(keyHeader.header));
    if (teacherKey) scores.teachers += 3;
    if (statusCols >= 3 && statusCols > numericCols) scores.attendance += 1;
    if (numericCols >= 2) scores.grades += 0.5;

    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return ranked[0][1] > 0 ? ranked[0][0] : 'generic';
  }

  /* ---------- التحليل الرئيس ---------- */

  /**
   * @param {{headers:string[], rows:string[][], title?:string, overrides?:object}} table
   * @param {object} settingsIn
   */
  function analyze(table, settingsIn) {
    const n = N();
    const settings = mergeSettings(settingsIn);
    const overrides = table.overrides || {};
    const width = Math.max(table.headers.length, ...table.rows.map((r) => r.length), 0);
    const headers = Array.from({ length: width }, (_, i) => n.cleanText(table.headers[i] || ''));
    const rows = table.rows
      .map((r) => Array.from({ length: width }, (_, i) => n.cleanText(r[i] == null ? '' : r[i])))
      .filter((r) => r.some((c) => c && !n.isEmptyValue(c)));

    const columns = headers.map((h, i) => profileColumn(h, rows.map((r) => r[i]), i));

    // تجاوزات المستخدم لنوع العمود من صفحة التقرير
    for (const [idx, t] of Object.entries(overrides.types || {})) {
      if (columns[idx]) {
        columns[idx].type = t;
        if (t === 'numeric' && !columns[idx].parsed) columns[idx].parsed = rows.map((r) => r[idx]).filter((v) => !n.isEmptyValue(v)).map(n.parseNumber);
      }
    }

    const keyIndex = overrides.keyIndex != null ? Number(overrides.keyIndex) : chooseKeyColumn(columns, rows);
    if (keyIndex != null && columns[keyIndex]) columns[keyIndex].type = 'key';

    const kind = overrides.kind || classifyKind(headers, columns, table.title);
    // عناوين البطاقات المولّدة («حقل 1») تُستبدل باسم مفهوم لعمود المفتاح
    if (keyIndex != null && /^(حقل|عمود) \d+$/.test(headers[keyIndex])) {
      headers[keyIndex] = kind === 'teachers' ? 'المعلم/ة' : 'الاسم';
      columns[keyIndex].header = headers[keyIndex];
    }
    const isCountKind = kind === 'teachers';

    // ---- إحصاءات الأعمدة الرقمية ----
    for (const c of columns) {
      if (c.type !== 'numeric') continue;
      const cells = rows.map((r) => (n.isEmptyValue(r[c.index]) ? null : n.parseNumber(r[c.index])));
      c.cells = cells;
      const vals = cells.filter(Boolean).map((p) => p.value);
      c.isTotal = headerMatches(c.header, TOTAL_HEADERS);
      c.isCount = isCountKind || /عدد|count/.test(n.normalizeArabic(c.header));
      c.isAbsence = /غياب|غايب|absen/.test(n.normalizeArabic(c.header));
      c.isPercentCol = cells.some((p) => p && p.isPercent) || /نسبه|%|٪/.test(n.normalizeArabic(c.header));

      const fractionMax = cells.find((p) => p && p.max && !p.isPercent);
      const userMax = overrides.max && overrides.max[c.index];
      if (userMax) { c.max = Number(userMax); c.maxSource = 'user'; }
      else if (c.isPercentCol) { c.max = 100; c.maxSource = 'percent'; }
      else if (fractionMax) { c.max = fractionMax.max; c.maxSource = 'cell'; }
      else if (n.maxFromHeader(c.header)) { c.max = n.maxFromHeader(c.header); c.maxSource = 'header'; }
      else if (!c.isCount && !c.isAbsence) { c.max = n.guessMax(Math.max(...vals)); c.maxSource = 'guess'; }
      else { c.max = null; c.maxSource = null; }

      const percents = cells.map((p) => (p == null ? null : p.percent != null ? p.percent : c.max ? (p.value / c.max) * 100 : null));
      c.percents = percents;
      const pv = percents.filter((x) => x != null);

      c.stats = {
        count: vals.length,
        missing: rows.length - vals.length,
        mean: mean(vals),
        median: median(vals),
        stdev: stdev(vals),
        min: vals.length ? Math.min(...vals) : null,
        max: vals.length ? Math.max(...vals) : null,
        sum: vals.reduce((s, x) => s + x, 0),
        zeros: vals.filter((v) => v === 0).length,
        meanPercent: pv.length ? mean(pv) : null,
        belowPass: pv.filter((x) => x < settings.passMark).length,
      };
    }

    // ---- إحصاءات أعمدة الحالة ----
    for (const c of columns) {
      if (c.type !== 'status') continue;
      const counts = {};
      let pos = 0, neg = 0, part = 0;
      c.statuses = rows.map((r) => {
        const v = r[c.index];
        if (n.isEmptyValue(v)) return null;
        counts[v] = (counts[v] || 0) + 1;
        const st = statusOf(v);
        if (st === 'positive') pos++; else if (st === 'negative') neg++; else if (st === 'partial') part++;
        return st;
      });
      c.stats = { counts, positive: pos, negative: neg, partial: part, filled: pos + neg + part };
    }

    const numericCols = columns.filter((c) => c.type === 'numeric');
    const statusCols = columns.filter((c) => c.type === 'status');
    const totalCol = numericCols.find((c) => c.isTotal && c.percents.some((p) => p != null));
    const scoreCols = numericCols.filter((c) => !c.isTotal && !c.isCount && !c.isAbsence && c.max);
    const countCols = numericCols.filter((c) => c.isCount && !c.isAbsence);
    const absenceCols = numericCols.filter((c) => c.isAbsence);

    // ---- نتائج الصفوف ----
    const results = rows.map((r, ri) => {
      const res = { index: ri, key: keyIndex != null ? r[keyIndex] || `صف ${ri + 1}` : `صف ${ri + 1}`, cells: r, flags: [] };

      if (kind !== 'teachers') {
        if (totalCol && totalCol.percents[ri] != null) {
          res.percent = totalCol.percents[ri];
          res.percentSource = totalCol.header;
        } else {
          const ps = scoreCols.map((c) => c.percents[ri]).filter((p) => p != null);
          if (ps.length) {
            // متوسط موزون بالدرجة العظمى (مجموع الدرجات / مجموع العظمى)
            let got = 0, of = 0;
            for (const c of scoreCols) {
              const p = c.cells[ri];
              if (p == null) continue;
              got += p.percent != null && p.isPercent ? (p.value / 100) * c.max : p.value;
              of += c.max;
            }
            res.percent = of ? (got / of) * 100 : mean(ps);
            res.percentSource = 'محسوبة';
          }
          res.missingScores = scoreCols.filter((c) => c.cells[ri] == null).length;
        }
        if (res.percent != null) res.band = bandFor(res.percent, settings);
      }

      // الحالات (حضور / تسليم)
      const sts = statusCols.map((c) => c.statuses[ri]).filter(Boolean);
      if (sts.length) {
        res.statusTotal = sts.length;
        res.negatives = sts.filter((s) => s === 'negative').length;
        res.partials = sts.filter((s) => s === 'partial').length;
        res.negativeRate = (res.negatives / sts.length) * 100;
      }
      const absCount = absenceCols.map((c) => c.cells[ri] && c.cells[ri].value).filter((v) => v != null);
      if (absCount.length) res.absenceCount = absCount.reduce((s, x) => s + x, 0);

      // مؤشر النشاط (للمعلمين ولأي أعمدة عدّية): متوسط (القيمة ÷ أعلى قيمة في العمود)
      if (countCols.length) {
        const ratios = countCols.map((c) => {
          const p = c.cells[ri];
          return p == null ? 0 : c.stats.max ? p.value / c.stats.max : 0;
        });
        res.activityIndex = mean(ratios) * 100;
        res.zeroCounts = countCols.filter((c) => !c.cells[ri] || c.cells[ri].value === 0).map((c) => c.header);
      }

      // الأعلام
      if (res.percent != null && res.percent < settings.passMark) res.flags.push({ code: 'fail', label: 'دون الحد الأدنى للنجاح', severity: 3 });
      else if (res.percent != null && res.percent < settings.riskMark) res.flags.push({ code: 'risk', label: 'بحاجة إلى دعم', severity: 2 });
      if (res.negativeRate != null) {
        const negLabel = kind === 'assignments' ? 'واجبات غير مسلّمة' : 'غياب مرتفع';
        const limit = kind === 'assignments' ? settings.missingWorkAlert : settings.absenceRateAlert;
        if (res.negativeRate >= limit && res.negatives > 0) res.flags.push({ code: kind === 'assignments' ? 'missing' : 'absence', label: `${negLabel} (${n.fmt(res.negativeRate, 0)}٪)`, severity: 2 });
      }
      if (res.absenceCount != null && res.absenceCount >= settings.absenceCountAlert) res.flags.push({ code: 'absence', label: `غياب ${n.fmt(res.absenceCount, 0)} مرات`, severity: 2 });
      if (res.missingScores && scoreCols.length && res.missingScores / scoreCols.length >= 0.5) res.flags.push({ code: 'incomplete', label: 'رصد غير مكتمل', severity: 1 });
      if (kind === 'teachers' && res.zeroCounts && res.zeroCounts.length === countCols.length) res.flags.push({ code: 'inactive', label: 'لا نشاط مسجّل', severity: 3 });
      else if (kind === 'teachers' && res.zeroCounts && res.zeroCounts.length) res.flags.push({ code: 'partial-activity', label: `بلا نشاط في: ${res.zeroCounts.join('، ')}`, severity: 1 });
      return res;
    });

    // ---- الملخص ----
    const percents = results.map((r) => r.percent).filter((p) => p != null);
    const distribution = settings.bands.map((b) => ({ label: b.label, tone: b.tone, min: b.min, count: 0 }));
    for (const r of results) {
      if (!r.band) continue;
      const d = distribution.find((x) => x.label === r.band.label);
      if (d) d.count++;
    }
    const summary = {
      rows: results.length,
      scored: percents.length,
      meanPercent: mean(percents),
      medianPercent: median(percents),
      stdevPercent: stdev(percents),
      passRate: percents.length ? (percents.filter((p) => p >= settings.passMark).length / percents.length) * 100 : null,
      distribution,
      flagged: results.filter((r) => r.flags.some((f) => f.severity >= 2)).length,
      statusColumns: statusCols.length,
      negativeTotal: statusCols.reduce((s, c) => s + c.stats.negative, 0),
      statusFilled: statusCols.reduce((s, c) => s + c.stats.filled, 0),
      completeness: rows.length * columns.length
        ? (columns.reduce((s, c) => s + (c.type === 'empty' ? 0 : c.filled || 0), 0) / (rows.length * columns.filter((c) => c.type !== 'empty').length || 1)) * 100
        : null,
    };
    if (summary.statusFilled) summary.negativeRate = (summary.negativeTotal / summary.statusFilled) * 100;

    return {
      kind,
      kindLabel: KIND_LABELS[kind],
      title: table.title || '',
      keyIndex,
      headers,
      columns,
      numericCols,
      scoreCols,
      statusCols,
      countCols,
      totalCol: totalCol || null,
      results,
      summary,
      settings,
    };
  }

  Muin.analyzer = { analyze, statusOf, bandFor, mergeSettings, DEFAULT_SETTINGS, KIND_LABELS, mean, median, stdev };
  if (typeof module !== 'undefined' && module.exports) module.exports = Muin.analyzer;
})(typeof globalThis !== 'undefined' ? globalThis : this);
