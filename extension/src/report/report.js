/*
 * مُعين مدرستي — صفحة التقرير.
 * تُبنى كل العناصر بـ DOM (لا innerHTML لبيانات الصفحة) لمنع أي حقن.
 */
(function () {
  'use strict';
  const { analyzer, insights, data, numbers } = globalThis.Muin;
  const f = numbers.fmt;

  const state = { id: null, payload: null, settings: null, analysis: null };

  /* ---------- أدوات ---------- */

  function h(tag, attrs, ...children) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat(Infinity)) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
    return e;
  }

  function title(text) {
    // نمط الدليل: الكلمة الأولى عريضة والباقي عادي
    const [first, ...rest] = String(text).split(' ');
    return [h('b', {}, first), rest.length ? ' ' + rest.join(' ') : ''];
  }

  function dates(d) {
    const opts = { day: 'numeric', month: 'long', year: 'numeric' };
    let hijri = '';
    try { hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', opts).format(d); } catch (e) { /* */ }
    const greg = new Intl.DateTimeFormat('ar-u-ca-gregory-nu-latn', opts).format(d);
    return { hijri, greg };
  }

  const TONE_CLASS = { excellent: 't-excellent', vgood: 't-vgood', good: 't-good', pass: 't-pass', fail: 't-fail' };

  /* ---------- التحميل ---------- */

  async function load() {
    state.id = location.hash.slice(1);
    const key = 'report:' + state.id;
    const [sess, local] = await Promise.all([chrome.storage.session.get(key), chrome.storage.local.get('settings')]);
    state.payload = sess[key];
    state.settings = analyzer.mergeSettings(local.settings);
    if (!state.payload) {
      document.getElementById('report').replaceChildren(h('div', { class: 'empty-state' },
        h('h1', {}, title('انتهت صلاحية التقرير')),
        h('p', {}, 'بيانات التقارير تُحفظ مؤقتًا في ذاكرة المتصفح فقط وتُمسح عند إغلاقه حفاظًا على الخصوصية. ارجع إلى منصة مدرستي وافتح التقرير من جديد.')));
      document.querySelector('.toolbar').hidden = true;
      return;
    }
    state.payload.overrides = state.payload.overrides || {};
    document.getElementById('kind').value = state.payload.overrides.kind || '';
    render();
  }

  function persist() {
    return chrome.storage.session.set({ ['report:' + state.id]: state.payload });
  }

  /* ---------- البناء ---------- */

  function render() {
    const a = analyzer.analyze(state.payload, state.settings);
    state.analysis = a;
    const ins = insights.generate(a);
    const s = state.settings;
    const now = new Date();
    const d = dates(now);
    const src = state.payload.source || {};
    const docTitle = state.payload.customTitle || `تقرير ${a.kindLabel}${a.title ? ' — ' + a.title : ''}`;
    document.title = docTitle;

    const sections = [];

    /* ترويسة */
    sections.push(h('header', { class: 'doc-head' },
      h('div', { class: 'grad-bar' }),
      h('div', { class: 'head-grid' },
        h('div', { class: 'head-side' },
          h('div', { class: 'org', contenteditable: 'true', spellcheck: 'false', 'data-field': 'educationOffice', title: 'انقر للتعديل' }, s.educationOffice || 'الإدارة العامة للتعليم'),
          h('div', { class: 'org strong', contenteditable: 'true', spellcheck: 'false', 'data-field': 'schoolName', title: 'انقر للتعديل' }, s.schoolName || 'اسم المدرسة')),
        h('div', { class: 'head-center' },
          s.showMoeLogo ? h('img', { class: 'moe-logo', src: '../../assets/moe-logo-color.png', alt: 'شعار وزارة التعليم' }) : null),
        h('div', { class: 'head-side end' },
          h('div', {}, 'التاريخ: ', h('bdi', {}, d.hijri)),
          h('div', { class: 'muted' }, h('bdi', {}, d.greg)),
          s.teacherName ? h('div', {}, 'المعلم/ة: ', s.teacherName) : null)),
      h('h1', { class: 'doc-title', contenteditable: 'true', spellcheck: 'false', 'data-field': 'customTitle', title: 'انقر لتعديل العنوان' }, docTitle),
      h('p', { class: 'doc-sub' }, `المصدر: ${src.pageTitle || 'منصة مدرستي'} · تاريخ الالتقاط: ${src.capturedAt ? new Date(src.capturedAt).toLocaleString('ar-SA-u-nu-latn') : '—'}${state.payload.sources && state.payload.sources.length > 1 ? ` · مجمّع من ${state.payload.sources.length} لقطات` : ''}`)));

    /* المؤشرات */
    const kpis = [];
    const sum = a.summary;
    kpis.push(kpi(a.kind === 'teachers' ? 'عدد المعلمين' : 'عدد الطلاب', sum.rows));
    if (sum.meanPercent != null) {
      kpis.push(kpi('متوسط الأداء', f(sum.meanPercent) + '٪'));
      kpis.push(kpi('نسبة النجاح', f(sum.passRate) + '٪', sum.passRate >= 90 ? 'good' : sum.passRate < 70 ? 'risk' : ''));
      kpis.push(kpi('الوسيط', f(sum.medianPercent) + '٪'));
    }
    if (sum.negativeRate != null) kpis.push(kpi(a.kind === 'assignments' ? 'نسبة عدم التسليم' : 'نسبة الغياب', f(sum.negativeRate) + '٪', sum.negativeRate >= s.absenceRateAlert ? 'risk' : 'good'));
    if (a.kind === 'teachers') {
      for (const c of a.countCols.slice(0, 3)) kpis.push(kpi('إجمالي ' + c.header, f(c.stats.sum, 0)));
    }
    kpis.push(kpi('بحاجة إلى متابعة', sum.flagged, sum.flagged ? 'risk' : 'good'));
    sections.push(section('المؤشرات الرئيسة', h('div', { class: 'kpis' }, kpis)));

    /* الرسوم */
    const charts = [];
    if (sum.scored) charts.push(distributionChart(a));
    if (a.scoreCols.length >= 2) charts.push(columnsChart(a.scoreCols.filter((c) => c.stats.meanPercent != null), 'متوسط كل أداة تقويم', (c) => c.stats.meanPercent, '٪', 100));
    if (a.kind === 'teachers' && a.countCols.length) charts.push(columnsChart(a.results.filter((r) => r.activityIndex != null).sort((x, y) => y.activityIndex - x.activityIndex).slice(0, 12).map((r) => ({ header: r.key, v: r.activityIndex })), 'مؤشر النشاط (أعلى 12)', (c) => c.v, '', 100));
    if (a.statusCols.length >= 2) charts.push(columnsChart(a.statusCols.map((c) => ({ header: c.header, v: c.stats.filled ? (c.stats.negative / c.stats.filled) * 100 : 0 })), a.kind === 'assignments' ? 'عدم التسليم لكل واجب' : 'الغياب لكل يوم/حصة', (c) => c.v, '٪', 100, 'neg'));
    if (charts.length) sections.push(section('التمثيل البياني', h('div', { class: 'charts' }, charts)));

    /* الاستنتاجات */
    sections.push(section('القراءة التحليلية',
      h('ul', { class: 'insights' }, ins.insights.map((i) => h('li', { class: 'ins ins-' + i.tone }, h('span', { class: 'ins-dot', 'aria-hidden': 'true' }), h('div', {}, h('strong', {}, i.title), h('p', {}, i.text))))),
      h('h3', { class: 'sub' }, 'التوصيات'),
      h('ol', { class: 'recs' }, ins.recommendations.map((r) => h('li', {}, r)))));

    /* من يحتاج متابعة */
    const flagged = a.results.filter((r) => r.flags.length).sort((x, y) => Math.max(...y.flags.map((q) => q.severity)) - Math.max(...x.flags.map((q) => q.severity)) || (x.percent ?? 999) - (y.percent ?? 999));
    if (flagged.length) {
      sections.push(section('قائمة المتابعة', h('div', { class: 'table-wrap' }, h('table', { class: 'data' },
        h('thead', {}, h('tr', {}, h('th', {}, 'م'), h('th', {}, a.kind === 'teachers' ? 'المعلم/ة' : 'الاسم'), sum.scored ? h('th', {}, 'النسبة') : null, h('th', {}, 'الملاحظات'), h('th', { class: 'print-only-col' }, 'الإجراء المتخذ'))),
        h('tbody', {}, flagged.map((r, i) => h('tr', {},
          h('td', {}, i + 1), h('td', {}, r.key),
          sum.scored ? h('td', {}, r.percent != null ? f(r.percent) + '٪' : '—') : null,
          h('td', {}, r.flags.map((fl) => h('span', { class: 'flag sev' + fl.severity }, fl.label))),
          h('td', { class: 'print-only-col' }, ''))))))));
    }

    /* النتائج المرتبة */
    if (sum.scored) {
      const ranked = a.results.filter((r) => r.percent != null).sort((x, y) => y.percent - x.percent);
      sections.push(section('ترتيب النتائج', h('div', { class: 'table-wrap' }, h('table', { class: 'data compact' },
        h('thead', {}, h('tr', {}, h('th', {}, 'الترتيب'), h('th', {}, 'الاسم'), h('th', {}, 'النسبة'), h('th', {}, 'التقدير'), h('th', { class: 'bar-col' }, ''))),
        h('tbody', {}, ranked.map((r, i) => h('tr', {},
          h('td', {}, i + 1), h('td', {}, r.key), h('td', {}, f(r.percent) + '٪'),
          h('td', {}, h('span', { class: 'band ' + (TONE_CLASS[r.band.tone] || '') }, r.band.label)),
          h('td', { class: 'bar-col' }, h('span', { class: 'mini-bar ' + (TONE_CLASS[r.band.tone] || ''), style: { width: Math.max(0, Math.min(100, r.percent)) + '%' } })))))))));
    }

    /* البيانات الكاملة */
    if (document.getElementById('show-data').checked) sections.push(fullData(a));

    /* التوقيعات */
    sections.push(h('section', { class: 'signatures' },
      sig(a.kind === 'teachers' ? 'وكيل الشؤون التعليمية' : 'المعلم/ة', a.kind === 'teachers' ? '' : s.teacherName),
      sig('مدير/ة المدرسة', s.principalName)));

    /* بطاقات فردية */
    if (document.getElementById('show-cards').checked) sections.push(personCards(a));

    sections.push(h('footer', { class: 'doc-foot' },
      h('span', {}, 'أُعدّ بواسطة ', h('b', {}, 'مُعين مدرستي'), ' — أداة مستقلة تعمل على جهاز المستخدم، والبيانات من منصة مدرستي كما ظهرت وقت الالتقاط.'),
      h('div', { class: 'grad-bar thin' })));

    const root = document.getElementById('report');
    root.replaceChildren(...sections);
    bindEditable();
  }

  function section(name, ...body) {
    return h('section', { class: 'sec' }, h('h2', { class: 'sec-title' }, title(name)), body);
  }

  function kpi(label, value, tone) {
    return h('div', { class: 'kpi ' + (tone ? 'kpi-' + tone : '') }, h('div', { class: 'kpi-v' }, h('bdi', {}, value)), h('div', { class: 'kpi-l' }, label));
  }

  function sig(role, name) {
    return h('div', { class: 'sig' }, h('div', { class: 'sig-role' }, role), h('div', { class: 'sig-name' }, name || '…………………………'), h('div', { class: 'sig-line' }, 'التوقيع: ……………………'));
  }

  function distributionChart(a) {
    const dist = a.summary.distribution;
    const max = Math.max(1, ...dist.map((d) => d.count));
    const total = dist.reduce((s, d) => s + d.count, 0) || 1;
    return h('figure', { class: 'chart' },
      h('figcaption', {}, 'توزيع التقديرات'),
      h('div', { class: 'hbars' }, dist.map((d) => h('div', { class: 'hbar' },
        h('span', { class: 'hbar-l' }, d.label),
        h('span', { class: 'hbar-track' }, h('span', { class: 'hbar-fill ' + (TONE_CLASS[d.tone] || ''), style: { width: (d.count / max) * 100 + '%' } })),
        h('span', { class: 'hbar-v' }, h('bdi', {}, `${d.count} (${f((d.count / total) * 100, 0)}٪)`))))));
  }

  function columnsChart(items, caption, get, unit, scaleMax, tone) {
    const max = scaleMax || Math.max(1, ...items.map(get));
    return h('figure', { class: 'chart' },
      h('figcaption', {}, caption),
      h('div', { class: 'hbars' }, items.slice(0, 16).map((c) => h('div', { class: 'hbar' },
        h('span', { class: 'hbar-l', title: c.header }, c.header),
        h('span', { class: 'hbar-track' }, h('span', { class: 'hbar-fill ' + (tone === 'neg' ? 't-neg' : 't-good'), style: { width: Math.max(0, Math.min(100, (get(c) / max) * 100)) + '%' } })),
        h('span', { class: 'hbar-v' }, h('bdi', {}, f(get(c)) + unit))))));
  }

  function fullData(a) {
    const visible = a.columns.filter((c) => c.type !== 'empty' && c.type !== 'serial');
    const sortState = { col: null, dir: 1 };
    const tbody = h('tbody');
    const fill = () => {
      let rows = a.results.slice();
      if (sortState.col != null) {
        const i = sortState.col;
        rows.sort((x, y) => {
          const px = numbers.parseNumber(x.cells[i]); const py = numbers.parseNumber(y.cells[i]);
          if (px && py) return (px.value - py.value) * sortState.dir;
          return String(x.cells[i]).localeCompare(String(y.cells[i]), 'ar') * sortState.dir;
        });
      }
      tbody.replaceChildren(...rows.map((r, idx) => h('tr', {}, h('td', {}, idx + 1), visible.map((c) => {
        const st = c.type === 'status' ? analyzer.statusOf(r.cells[c.index]) : null;
        const pc = c.type === 'numeric' && c.percents ? c.percents[r.index] : null;
        const low = pc != null && pc < a.settings.passMark;
        return h('td', { class: [st ? 'st-' + st : '', low ? 'low' : ''].join(' ').trim() || null }, r.cells[c.index]);
      }))));
    };
    fill();
    const head = h('tr', {}, h('th', {}, 'م'), visible.map((c) => h('th', {
      class: 'sortable', tabindex: '0', title: 'انقر للترتيب', 'aria-sort': 'none',
      onclick: (e) => { sortState.dir = sortState.col === c.index ? -sortState.dir : 1; sortState.col = c.index; for (const th of head.children) th.setAttribute('aria-sort', 'none'); e.currentTarget.setAttribute('aria-sort', sortState.dir > 0 ? 'ascending' : 'descending'); fill(); },
      onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } },
    }, c.header, c.type === 'numeric' && c.max ? h('small', {}, ` /${f(c.max, 2)}${c.maxSource === 'guess' ? '؟' : ''}`) : null)));
    return section('البيانات الكاملة', h('div', { class: 'table-wrap' }, h('table', { class: 'data full' }, h('thead', {}, head), tbody)));
  }

  function personCards(a) {
    const s = a.settings;
    const items = a.results.map((r) => h('article', { class: 'person-card' },
      h('div', { class: 'grad-bar thin' }),
      h('header', {}, h('div', {}, h('div', { class: 'muted' }, s.schoolName || ''), h('h3', {}, r.key)), r.band ? h('span', { class: 'band big ' + (TONE_CLASS[r.band.tone] || '') }, r.band.label) : null),
      h('table', { class: 'data compact' }, h('tbody', {},
        a.columns.filter((c) => (c.type === 'numeric' || c.type === 'status') && r.cells[c.index]).map((c) => h('tr', {}, h('th', {}, c.header), h('td', {}, r.cells[c.index], c.type === 'numeric' && c.max ? ` من ${f(c.max, 2)}` : ''))),
        r.percent != null ? h('tr', { class: 'total' }, h('th', {}, 'النسبة'), h('td', {}, f(r.percent) + '٪')) : null)),
      r.flags.length ? h('p', { class: 'person-notes' }, 'ملاحظات: ', r.flags.map((x) => x.label).join('، ')) : h('p', { class: 'person-notes good' }, 'أداء مستقر، نشكر متابعتكم.'),
      h('div', { class: 'person-sign' }, h('span', {}, 'المعلم/ة: ', s.teacherName || '……………'), h('span', {}, 'توقيع ولي الأمر: ……………'))));
    return h('section', { class: 'cards-section' }, h('h2', { class: 'sec-title no-print' }, title('البطاقات الفردية')), items);
  }

  /* ---------- التحرير المباشر ---------- */

  function bindEditable() {
    for (const e of document.querySelectorAll('[contenteditable][data-field]')) {
      e.addEventListener('blur', async () => {
        const field = e.dataset.field;
        const value = numbers.cleanText(e.textContent);
        if (field === 'customTitle') { state.payload.customTitle = value; await persist(); document.title = value; return; }
        const { settings: saved = {} } = await chrome.storage.local.get('settings');
        saved[field] = value;
        state.settings[field] = value;
        await chrome.storage.local.set({ settings: saved });
      });
      e.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); e.blur(); } });
    }
  }

  /* ---------- إعدادات الأعمدة ---------- */

  const TYPE_LABELS = { key: 'الاسم (مفتاح)', numeric: 'درجة / رقم', status: 'حالة (حضور/تسليم)', text: 'نص', date: 'تاريخ', id: 'رقم هوية', serial: 'تسلسل', empty: 'تجاهل' };

  function openColumns() {
    const a = state.analysis;
    const ov = state.payload.overrides;
    const table = document.getElementById('cols-table');
    table.replaceChildren(
      h('thead', {}, h('tr', {}, h('th', {}, 'العمود'), h('th', {}, 'النوع'), h('th', {}, 'الدرجة العظمى'), h('th', {}, 'عينة'))),
      h('tbody', {}, a.columns.map((c) => h('tr', {},
        h('td', {}, c.header),
        h('td', {}, h('select', { 'data-col': c.index, class: 'col-type', 'aria-label': 'نوع ' + c.header },
          Object.entries(TYPE_LABELS).map(([v, l]) => { const o = h('option', { value: v }, l); if (v === c.type) o.selected = true; return o; }))),
        h('td', {}, h('input', { type: 'number', min: '1', step: 'any', class: 'col-max', 'data-col': c.index, value: (ov.max && ov.max[c.index]) || (c.type === 'numeric' && c.max) || '', placeholder: '—', 'aria-label': 'الدرجة العظمى لـ ' + c.header })),
        h('td', { class: 'muted' }, (a.results.slice(0, 3).map((r) => r.cells[c.index]).filter(Boolean).join('، ') || '—').slice(0, 40))))));
    document.getElementById('columns-dialog').showModal();
  }

  function applyColumns() {
    const a = state.analysis;
    const ov = state.payload.overrides;
    ov.types = {}; ov.max = {};
    for (const sel of document.querySelectorAll('.col-type')) {
      const i = Number(sel.dataset.col);
      if (sel.value === 'key') ov.keyIndex = i;
      else if (sel.value !== a.columns[i].type) ov.types[i] = sel.value;
    }
    for (const inp of document.querySelectorAll('.col-max')) {
      const i = Number(inp.dataset.col);
      const v = parseFloat(inp.value);
      const c = a.columns[i];
      if (v > 0 && !(c.maxSource !== 'user' && c.max === v)) ov.max[i] = v;
    }
    persist();
    render();
  }

  /* ---------- الأحداث ---------- */

  document.getElementById('btn-print').addEventListener('click', () => window.print());
  document.getElementById('btn-csv').addEventListener('click', () => {
    const a = state.analysis;
    const headers = [...a.headers];
    const extra = [];
    if (a.summary.scored) extra.push('النسبة المحسوبة', 'التقدير');
    extra.push('ملاحظات مُعين');
    const rows = a.results.map((r) => [...r.cells, ...(a.summary.scored ? [r.percent != null ? f(r.percent) : '', r.band ? r.band.label : ''] : []), r.flags.map((x) => x.label).join('؛ ')]);
    const blob = new Blob([data.toCSV([...headers, ...extra], rows)], { type: 'text/csv;charset=utf-8' });
    const link = h('a', { href: URL.createObjectURL(blob), download: data.slug(document.title) + '.csv' });
    document.body.append(link); link.click(); setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 500);
  });
  document.getElementById('kind').addEventListener('change', (e) => { state.payload.overrides.kind = e.target.value || undefined; persist(); render(); });
  document.getElementById('show-data').addEventListener('change', render);
  document.getElementById('show-cards').addEventListener('change', render);
  document.getElementById('btn-columns').addEventListener('click', openColumns);
  document.getElementById('apply-columns').addEventListener('click', applyColumns);

  load().catch((e) => {
    document.getElementById('report').replaceChildren(h('p', { class: 'error' }, 'تعذّر إنشاء التقرير: ' + e.message));
  });
})();
