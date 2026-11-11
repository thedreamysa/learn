/*
 * مُعين مدرستي — سكربت المحتوى.
 * يضيف زرًا عائمًا ولوحة جانبية داخل منصة مدرستي (داخل Shadow DOM حتى لا
 * تتأثر المنصة ولا تتأثر اللوحة بأنماطها). لا يرسل أي بيانات خارج الجهاز.
 */
(function () {
  'use strict';
  if (window.top !== window) return; // اللوحة في الإطار الرئيس فقط؛ المستخرج يقرأ الإطارات بنفسه
  if (window.__muinLoaded) return;
  window.__muinLoaded = true;

  const { extractor, analyzer, data, numbers } = globalThis.Muin;
  const ROOT_ID = extractor.UI_ROOT_ID;
  let found = [];
  let settings = analyzer.DEFAULT_SETTINGS;
  let shadow, panel, list, collectionsBox, statusLine;

  /* ---------- التخزين ---------- */

  const store = {
    async get(key, fallback) {
      const r = await chrome.storage.local.get(key);
      return r[key] == null ? fallback : r[key];
    },
    set(key, value) { return chrome.storage.local.set({ [key]: value }); },
  };

  async function loadSettings() {
    settings = analyzer.mergeSettings(await store.get('settings', {}));
  }

  async function getCollections() {
    const all = await store.get('collections', []);
    const limit = Date.now() - (settings.retentionDays || 30) * 86400000;
    const fresh = all.filter((c) => (c.updatedAt || 0) >= limit);
    if (fresh.length !== all.length) await store.set('collections', fresh);
    return fresh;
  }

  /* ---------- الواجهة ---------- */

  function el(tag, attrs, ...children) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') e.className = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v != null && v !== false) e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(String(c)));
    return e;
  }

  function mount() {
    if (document.getElementById(ROOT_ID)) return;
    const host = el('div', { id: ROOT_ID });
    host.style.all = 'initial';
    document.documentElement.append(host);
    shadow = host.attachShadow({ mode: 'open' });
    const style = el('link', { rel: 'stylesheet', href: chrome.runtime.getURL('src/content/panel.css') });
    shadow.append(style);

    const fab = el('button', { class: 'fab', title: 'مُعين مدرستي — التقارير', 'aria-label': 'فتح مُعين مدرستي', onclick: togglePanel },
      el('img', { src: chrome.runtime.getURL('icons/icon-48.png'), alt: '' }));
    shadow.append(fab);

    statusLine = el('div', { class: 'status', role: 'status', 'aria-live': 'polite' });
    list = el('div', { class: 'list' });
    collectionsBox = el('div', { class: 'collections' });

    panel = el('aside', { class: 'panel', dir: 'rtl', hidden: true, 'aria-label': 'مُعين مدرستي' },
      el('header', { class: 'head' },
        el('div', { class: 'brand' }, el('b', {}, 'مُعين'), ' مدرستي'),
        el('button', { class: 'icon-btn', title: 'إغلاق', 'aria-label': 'إغلاق', onclick: togglePanel }, '✕')),
      el('div', { class: 'bar' }),
      el('div', { class: 'actions' },
        el('button', { class: 'btn primary', onclick: rescan }, 'مسح الصفحة'),
        el('button', { class: 'btn', onclick: startPicker, title: 'اختر جدولًا أو قائمة بالنقر عليها' }, 'اختيار يدوي'),
        el('button', { class: 'btn ghost', onclick: () => chrome.runtime.sendMessage({ type: 'open-options' }) }, 'الإعدادات')),
      statusLine,
      el('h3', {}, 'الجداول في هذه الصفحة'),
      list,
      el('h3', {}, 'المجموعات المحفوظة'),
      el('p', { class: 'hint' }, 'اجمع جداول من عدة صفحات (صفحات الترقيم أو فصول مختلفة) في تقرير واحد.'),
      collectionsBox,
      el('footer', { class: 'foot' }, 'تعمل محليًا على جهازك فقط — لا تُرسل أي بيانات. أداة مستقلة غير تابعة لوزارة التعليم.'));
    shadow.append(panel);
  }

  function togglePanel(force) {
    mount();
    const open = typeof force === 'boolean' ? force : panel.hidden;
    panel.hidden = !open;
    if (open) { rescan(); renderCollections(); }
  }

  function setStatus(msg, tone) {
    statusLine.textContent = msg || '';
    statusLine.className = 'status ' + (tone || '');
  }

  /* ---------- المسح والعرض ---------- */

  async function rescan() {
    await loadSettings();
    found = extractor.scan(document);
    renderList();
    setStatus(found.length ? `وجدتُ ${found.length} ${found.length > 2 && found.length < 11 ? 'جداول' : 'جدول'}.` : 'لم أجد جداول بعد. افتح صفحة فيها بيانات (الدرجات، الحضور، الواجبات…) أو استخدم «اختيار يدوي».', found.length ? 'ok' : 'warn');
  }

  function describe(t) {
    try { return analyzer.analyze(t, settings); } catch (e) { return null; }
  }

  function renderList() {
    list.textContent = '';
    for (const t of found) {
      const a = describe(t);
      const pag = t.element && extractor.hasPagination(t.element);
      const card = el('div', { class: 'card' },
        el('div', { class: 'card-title' }, t.title),
        el('div', { class: 'meta' },
          el('span', { class: 'tag' }, a ? a.kindLabel : 'جدول'),
          `${t.rows.length} صف × ${t.headers.length} عمود`,
          t.source === 'cards' ? el('span', { class: 'tag muted' }, 'بطاقات') : null),
        el('div', { class: 'cols' }, t.headers.slice(0, 6).join(' · ') + (t.headers.length > 6 ? ' …' : '')),
        pag ? el('div', { class: 'hint warn' }, 'الجدول مقسّم على صفحات: اعرض «الكل» إن أمكن، أو أضف كل صفحة إلى مجموعة.') : null,
        el('div', { class: 'row-actions' },
          el('button', { class: 'btn primary sm', onclick: () => openReport(t) }, 'تقرير ذكي'),
          el('button', { class: 'btn sm', onclick: () => downloadCSV(t) }, 'CSV'),
          el('button', { class: 'btn sm', onclick: () => addToCollection(t) }, '+ مجموعة'),
          el('button', { class: 'btn ghost sm', title: 'تمييز الجدول في الصفحة', onclick: () => highlight(t.element) }, 'أين؟')));
      list.append(card);
    }
  }

  function highlight(target) {
    if (!target || !target.isConnected) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const prev = target.style.outline;
    target.style.outline = '3px solid #0da9a6';
    target.style.outlineOffset = '2px';
    setTimeout(() => { target.style.outline = prev; }, 2200);
  }

  function snapshot(t) {
    return {
      title: t.title,
      headers: t.headers,
      rows: t.rows,
      source: { url: location.href, pageTitle: numbers.cleanText(document.title), capturedAt: new Date().toISOString(), kind: t.source },
    };
  }

  function openReport(t) {
    chrome.runtime.sendMessage({ type: 'open-report', payload: snapshot(t) });
  }

  function downloadCSV(t) {
    const blob = new Blob([data.toCSV(t.headers, t.rows)], { type: 'text/csv;charset=utf-8' });
    const a = el('a', { href: URL.createObjectURL(blob), download: data.slug(t.title) + '.csv' });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- المجموعات ---------- */

  async function addToCollection(t) {
    const cols = await getCollections();
    const a = describe(t);
    const keyHeader = a && a.keyIndex != null ? a.headers[a.keyIndex] : null;
    const options = cols.map((c, i) => `${i + 1}) ${c.title} (${c.table.rows.length} صف)`).join('\n');
    const answer = prompt(
      (cols.length ? `أضف إلى مجموعة موجودة بكتابة رقمها، أو اكتب اسمًا جديدًا:\n${options}` : 'اكتب اسمًا للمجموعة الجديدة:'),
      cols.length ? '1' : t.title
    );
    if (answer == null || !answer.trim()) return;
    const idx = /^\d+$/.test(answer.trim()) ? parseInt(answer, 10) - 1 : -1;
    const snap = snapshot(t);
    if (idx >= 0 && cols[idx]) {
      const c = cols[idx];
      const before = c.table.rows.length;
      c.table = data.mergeTables(c.table, snap, c.keyHeader || keyHeader);
      c.sources.push(snap.source);
      c.updatedAt = Date.now();
      setStatus(`أُضيف ${c.table.rows.length - before} صف جديد إلى «${c.title}» (الإجمالي ${c.table.rows.length}).`, 'ok');
    } else {
      cols.push({ id: data.uid(), title: answer.trim(), keyHeader, table: { title: answer.trim(), headers: snap.headers, rows: snap.rows }, sources: [snap.source], createdAt: Date.now(), updatedAt: Date.now() });
      setStatus(`أُنشئت المجموعة «${answer.trim()}».`, 'ok');
    }
    await store.set('collections', cols);
    renderCollections();
  }

  async function renderCollections() {
    const cols = await getCollections();
    collectionsBox.textContent = '';
    if (!cols.length) { collectionsBox.append(el('p', { class: 'empty' }, 'لا توجد مجموعات بعد.')); return; }
    for (const c of cols) {
      collectionsBox.append(el('div', { class: 'card compact' },
        el('div', { class: 'card-title' }, c.title),
        el('div', { class: 'meta' }, `${c.table.rows.length} صف · ${c.sources.length} لقطة · ${new Date(c.updatedAt).toLocaleDateString('ar-SA-u-nu-latn')}`),
        el('div', { class: 'row-actions' },
          el('button', { class: 'btn primary sm', onclick: () => chrome.runtime.sendMessage({ type: 'open-report', payload: Object.assign({}, c.table, { title: c.title, source: c.sources[c.sources.length - 1], sources: c.sources }) }) }, 'تقرير'),
          el('button', { class: 'btn sm', onclick: () => downloadCSV({ title: c.title, headers: c.table.headers, rows: c.table.rows }) }, 'CSV'),
          el('button', { class: 'btn danger sm', onclick: async () => {
            if (!confirm(`حذف المجموعة «${c.title}» نهائيًا؟`)) return;
            await store.set('collections', (await getCollections()).filter((x) => x.id !== c.id));
            renderCollections();
          } }, 'حذف'))));
    }
  }

  /* ---------- الاختيار اليدوي ---------- */

  function startPicker() {
    panel.hidden = true;
    const box = el('div', { class: 'pick-box' });
    const tip = el('div', { class: 'pick-tip' }, 'انقر على الجدول أو القائمة المطلوبة — Esc للإلغاء');
    shadow.append(box, tip);
    let current = null;
    const move = (e) => {
      const t = e.composedPath()[0];
      if (!t || t === document.documentElement || t.id === ROOT_ID) return;
      current = t;
      const r = t.getBoundingClientRect();
      Object.assign(box.style, { top: r.top + 'px', left: r.left + 'px', width: r.width + 'px', height: r.height + 'px' });
    };
    const stop = () => {
      document.removeEventListener('mousemove', move, true);
      document.removeEventListener('click', click, true);
      document.removeEventListener('keydown', key, true);
      box.remove(); tip.remove();
      panel.hidden = false;
    };
    const click = (e) => {
      e.preventDefault(); e.stopPropagation();
      const target = current;
      stop();
      if (!target) return;
      const res = extractor.extractFromElement(target);
      if (!res || !res.rows.length) { setStatus('لم أستطع قراءة بيانات منظمة من هذا العنصر. جرّب النقر على حاوية أكبر.', 'warn'); return; }
      target.dataset.muinId = target.dataset.muinId || 'pick-' + Date.now();
      found.unshift(Object.assign({ id: target.dataset.muinId, element: target }, res, { title: res.title || numbers.cleanText(document.title) }));
      renderList();
      setStatus(`قرأتُ ${res.rows.length} صفًا من العنصر المختار.`, 'ok');
    };
    const key = (e) => { if (e.key === 'Escape') { e.preventDefault(); stop(); } };
    document.addEventListener('mousemove', move, true);
    document.addEventListener('click', click, true);
    document.addEventListener('keydown', key, true);
  }

  /* ---------- الرسائل ---------- */

  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    if (msg && msg.type === 'toggle-panel') { togglePanel(); reply({ ok: true }); }
    if (msg && msg.type === 'scan') { reply({ tables: extractor.scan(document).map(({ element, ...t }) => t) }); }
    return false;
  });

  loadSettings().then(mount);
})();
