/*
 * مُعين مدرستي — محرك الاستنتاجات.
 * يحوّل نتيجة المحلل إلى ملاحظات وتوصيات مكتوبة بالعربية.
 * يعمل بقواعد محلية شفافة (لا نموذج لغوي ولا إرسال بيانات)، وكل رقم فيه
 * محسوب من الجدول نفسه دون تقريب مضلل أو تضخيم.
 */
(function (root) {
  'use strict';
  const Muin = (root.Muin = root.Muin || {});

  function names(list, max = 5) {
    const shown = list.slice(0, max).join('، ');
    return list.length > max ? `${shown}، و${list.length - max} آخرين` : shown;
  }

  function plural(n, one, two, few, many) {
    if (n === 1) return one;
    if (n === 2) return two;
    if (n >= 3 && n <= 10) return `${n} ${few}`;
    return `${n} ${many}`;
  }

  function personWord(kind) {
    return kind === 'teachers'
      ? { one: 'معلم واحد', two: 'معلمان', few: 'معلمين', many: 'معلمًا' }
      : { one: 'طالب واحد', two: 'طالبان', few: 'طلاب', many: 'طالبًا' };
  }

  function count(n, kind) {
    const w = personWord(kind);
    return plural(n, w.one, w.two, w.few, w.many);
  }

  /**
   * @returns {{insights: Array<{tone:string,title:string,text:string,people?:string[]}>, recommendations: string[]}}
   */
  function generate(a) {
    const f = Muin.numbers.fmt;
    const s = a.summary;
    const st = a.settings;
    const out = [];
    const rec = [];
    const kind = a.kind;

    if (!a.results.length) {
      return { insights: [{ tone: 'info', title: 'لا توجد بيانات', text: 'الجدول فارغ أو لم تُقرأ صفوفه.' }], recommendations: [] };
    }

    /* ---- نظرة عامة ---- */
    const parts = [`يضم الجدول ${count(s.rows, kind)}`];
    if (a.scoreCols.length) parts.push(`و${a.scoreCols.length} ${a.scoreCols.length > 2 && a.scoreCols.length < 11 ? 'أعمدة تقويم' : 'عمود تقويم'}`);
    if (a.statusCols.length) parts.push(`و${a.statusCols.length} ${a.statusCols.length > 2 && a.statusCols.length < 11 ? 'أعمدة رصد' : 'عمود رصد'}`);
    let overview = parts.join(' ') + '.';
    if (s.meanPercent != null) overview += ` متوسط الأداء ${f(s.meanPercent)}٪ والوسيط ${f(s.medianPercent)}٪، ونسبة النجاح ${f(s.passRate)}٪.`;
    if (s.completeness != null && s.completeness < 90) overview += ` اكتمال الرصد ${f(s.completeness, 0)}٪ فقط، فبعض النتائج قد تتغير بعد استكمال الرصد.`;
    out.push({ tone: 'info', title: 'نظرة عامة', text: overview });

    /* ---- الدرجات ---- */
    const scored = a.results.filter((r) => r.percent != null).sort((x, y) => y.percent - x.percent);
    if (scored.length) {
      const top = scored.filter((r) => r.percent >= (st.bands[0] ? st.bands[0].min : 90));
      if (top.length) {
        out.push({ tone: 'good', title: `المتميزون (${top.length})`, text: `حصل ${count(top.length, kind)} على تقدير «${st.bands[0].label}»: ${names(top.map((r) => r.key))}.`, people: top.map((r) => r.key) });
        rec.push(`تكريم المتميزين (${top.length}) وإشراكهم في تعلّم الأقران مع زملائهم.`);
      }
      const fail = scored.filter((r) => r.percent < st.passMark);
      const risk = scored.filter((r) => r.percent >= st.passMark && r.percent < st.riskMark);
      if (fail.length) {
        out.push({ tone: 'risk', title: `دون الحد الأدنى (${fail.length})`, text: `${count(fail.length, kind)} تحت ${st.passMark}٪: ${names(fail.slice().reverse().map((r) => `${r.key} (${f(r.percent, 0)}٪)`))}.`, people: fail.map((r) => r.key) });
        rec.push(`إعداد خطة علاجية فردية لمن هم دون الحد الأدنى (${fail.length})، والتواصل مع أولياء أمورهم.`);
      }
      if (risk.length) {
        out.push({ tone: 'warn', title: `بحاجة إلى دعم (${risk.length})`, text: `${count(risk.length, kind)} بين ${st.passMark}٪ و${st.riskMark}٪، وهم الأقرب للتحسن السريع بالمتابعة: ${names(risk.map((r) => r.key))}.`, people: risk.map((r) => r.key) });
      }
      if (s.stdevPercent > 18 && scored.length >= 8) {
        out.push({ tone: 'warn', title: 'تفاوت كبير', text: `الانحراف المعياري ${f(s.stdevPercent)} نقطة، ما يعني فجوة واسعة بين مستويات الفصل. يناسب ذلك التدريس المتمايز أو المجموعات حسب المستوى.` });
        rec.push('تقسيم الفصل إلى مجموعات حسب المستوى وتمييز المهام بينها.');
      }
    }

    /* ---- أعمدة التقويم ---- */
    const evalCols = a.scoreCols.filter((c) => c.stats.meanPercent != null);
    if (evalCols.length >= 2) {
      const sorted = [...evalCols].sort((x, y) => x.stats.meanPercent - y.stats.meanPercent);
      const weak = sorted[0];
      const strong = sorted[sorted.length - 1];
      if (strong.stats.meanPercent - weak.stats.meanPercent >= 8) {
        out.push({
          tone: 'warn',
          title: 'أضعف أداة تقويم',
          text: `أقل متوسط في «${weak.header}» (${f(weak.stats.meanPercent)}٪) مقابل «${strong.header}» (${f(strong.stats.meanPercent)}٪). ${weak.stats.belowPass ? `${count(weak.stats.belowPass, kind)} دون ${st.passMark}٪ فيه.` : ''}`.trim(),
        });
        rec.push(`مراجعة نواتج التعلم المرتبطة بـ«${weak.header}» وإعادة تدريسها أو تنويع أسئلتها.`);
      }
    }
    const guessed = a.scoreCols.filter((c) => c.maxSource === 'guess');
    if (guessed.length) {
      out.push({ tone: 'info', title: 'تنبيه عن الدرجة العظمى', text: `قدّرتُ الدرجة العظمى من أعلى درجة مرصودة في: ${guessed.map((c) => `«${c.header}» (${c.max})`).join('، ')}. عدّلها من «إعدادات الأعمدة» إن كانت مختلفة لتصح النسب.` });
    }
    const missingCols = a.scoreCols.filter((c) => c.stats.missing > 0 && c.stats.missing / a.results.length >= 0.2);
    if (missingCols.length) {
      out.push({ tone: 'warn', title: 'رصد ناقص', text: missingCols.map((c) => `«${c.header}»: ${count(c.stats.missing, kind)} بلا درجة`).join('؛ ') + '.' });
      rec.push('استكمال رصد الدرجات الناقصة قبل اعتماد النتائج.');
    }

    /* ---- الحضور والتسليم ---- */
    if (a.statusCols.length && s.negativeRate != null) {
      const label = kind === 'assignments' ? 'عدم التسليم' : 'الغياب';
      out.push({ tone: s.negativeRate >= st.absenceRateAlert ? 'warn' : 'good', title: `نسبة ${label}`, text: `نسبة ${label} الإجمالية ${f(s.negativeRate)}٪ من ${s.statusFilled} خلية مرصودة.` });
      const flaggedCode = kind === 'assignments' ? 'missing' : 'absence';
      const flagged = a.results.filter((r) => r.flags.some((x) => x.code === flaggedCode)).sort((x, y) => (y.negativeRate || 0) - (x.negativeRate || 0));
      if (flagged.length) {
        out.push({ tone: 'risk', title: kind === 'assignments' ? `متأخرون في التسليم (${flagged.length})` : `غياب متكرر (${flagged.length})`, text: names(flagged.map((r) => `${r.key} (${r.negatives} من ${r.statusTotal})`)) + '.', people: flagged.map((r) => r.key) });
        rec.push(kind === 'assignments'
          ? `متابعة من لم يسلّموا معظم الواجبات (${flagged.length}) وإشعار أولياء أمورهم.`
          : `إحالة حالات الغياب المتكرر (${flagged.length}) إلى الموجّه الطلابي وفق لائحة المواظبة.`);
      }
      // أكثر عمود (يوم/واجب) فيه سلبيات
      const worstCol = [...a.statusCols].sort((x, y) => y.stats.negative - x.stats.negative)[0];
      if (worstCol && worstCol.stats.negative >= Math.max(3, worstCol.stats.filled * 0.3)) {
        out.push({ tone: 'warn', title: kind === 'assignments' ? 'أقل واجب تسليمًا' : 'أعلى يوم غيابًا', text: `«${worstCol.header}»: ${worstCol.stats.negative} من ${worstCol.stats.filled}.` });
      }
    }
    const absentCount = a.results.filter((r) => r.absenceCount != null && r.absenceCount >= st.absenceCountAlert);
    if (absentCount.length && !a.statusCols.length) {
      out.push({ tone: 'risk', title: `غياب متكرر (${absentCount.length})`, text: names(absentCount.sort((x, y) => y.absenceCount - x.absenceCount).map((r) => `${r.key} (${f(r.absenceCount, 0)})`)) + '.', people: absentCount.map((r) => r.key) });
    }

    /* ---- نشاط المعلمين ---- */
    if (kind === 'teachers' && a.countCols.length) {
      const ranked = a.results.filter((r) => r.activityIndex != null).sort((x, y) => y.activityIndex - x.activityIndex);
      const inactive = ranked.filter((r) => r.flags.some((x) => x.code === 'inactive'));
      if (ranked.length) out.push({ tone: 'good', title: 'الأعلى نشاطًا', text: names(ranked.slice(0, 5).map((r) => `${r.key} (${f(r.activityIndex, 0)})`)) + '. المؤشر من 100 نسبةً إلى أعلى معلم في كل عمود.' });
      if (inactive.length) {
        out.push({ tone: 'risk', title: `بلا نشاط مسجّل (${inactive.length})`, text: names(inactive.map((r) => r.key)) + '.', people: inactive.map((r) => r.key) });
        rec.push('التحقق من أسباب انعدام النشاط (إجازة، انتداب، صعوبة تقنية) وتقديم الدعم الفني المناسب.');
      }
      for (const c of a.countCols) {
        if (c.stats.zeros && c.stats.zeros >= a.results.length * 0.4) out.push({ tone: 'warn', title: `ضعف في «${c.header}»`, text: `${count(c.stats.zeros, kind)} من ${a.results.length} لم يُسجَّل لهم أي نشاط في «${c.header}».` });
      }
      rec.push('مشاركة الممارسات المتميزة للأعلى نشاطًا في لقاء مجتمع التعلم المهني.');
    }

    if (!rec.length) rec.push('لا توجد مؤشرات تستدعي تدخلًا عاجلًا. استمر في المتابعة الدورية.');
    return { insights: out, recommendations: rec };
  }

  Muin.insights = { generate };
  if (typeof module !== 'undefined' && module.exports) module.exports = Muin.insights;
})(typeof globalThis !== 'undefined' ? globalThis : this);
