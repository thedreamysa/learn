/*
 * مُعين مدرستي — مستخرج الجداول من الصفحة.
 * لا يفترض أي محددات (selectors) خاصة بمنصة مدرستي، لذلك يعمل مع أي مدرسة
 * وأي صفحة ويتحمل تغيّر تصميم المنصة. يدعم:
 *   1) جداول HTML (مع rowspan/colspan والرؤوس متعددة المستويات)
 *   2) الشبكات بأدوار ARIA (role=grid/table)
 *   3) البطاقات المتكررة (قوائم الطلاب أو المعلمين على شكل بطاقات)
 *   4) الاختيار اليدوي لمنطقة من الصفحة
 */
(function (root) {
  'use strict';
  const Muin = (root.Muin = root.Muin || {});
  const N = () => Muin.numbers;

  const UI_ROOT_ID = 'muin-madrasati-root';
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'BUTTON']);

  function isVisible(el) {
    if (!el || !el.getClientRects) return true;
    if (el.closest && el.closest('#' + UI_ROOT_ID)) return false;
    const st = el.ownerDocument.defaultView.getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
    return el.getClientRects().length > 0;
  }

  /** نص الخلية، مع قراءة الأيقونات وخانات الاختيار التي تعبّر عن حالة. */
  function cellText(el) {
    if (!el) return '';
    const n = N();
    let t = n.cleanText(el.innerText != null ? el.innerText : el.textContent);
    if (t) {
      // خلية لا تحوي إلا أزرار إجراءات (تعديل، حذف، عرض) ليست بيانات
      const controls = el.querySelectorAll('button, .btn, [role="button"], .dropdown-menu, .dropdown-toggle');
      if (controls.length) {
        const ctrlText = n.cleanText(Array.from(controls).map((c) => c.innerText || c.textContent).join(' '));
        if (ctrlText.replace(/\s/g, '') === t.replace(/\s/g, '')) return '';
      }
      return t;
    }

    const input = el.querySelector('input, select, textarea');
    if (input) {
      if (input.type === 'checkbox' || input.type === 'radio') return input.checked ? '✓' : '✗';
      if (input.tagName === 'SELECT') return n.cleanText(input.selectedOptions[0] ? input.selectedOptions[0].textContent : '');
      if (input.value) return n.cleanText(input.value);
    }
    const labelled = el.querySelector('[aria-label], [title], img[alt]') || el;
    t = n.cleanText(labelled.getAttribute('aria-label') || labelled.getAttribute('title') || labelled.getAttribute('alt') || '');
    if (t) return t;
    const svgTitle = el.querySelector('svg title');
    if (svgTitle) return n.cleanText(svgTitle.textContent);

    // أيقونات Font Awesome / Material الشائعة
    const icon = el.querySelector('i, span[class*="icon"], svg');
    if (icon) {
      const cls = (icon.getAttribute('class') || '') + ' ' + (icon.textContent || '');
      if (/check|done|success|tick/i.test(cls)) return '✓';
      if (/times|close|cancel|xmark|clear|danger|error|minus-circle/i.test(cls)) return '✗';
      if (/clock|schedule|late|warning|hourglass/i.test(cls)) return 'متأخر';
    }
    return '';
  }

  function nearestTitle(el) {
    const n = N();
    if (el.tagName === 'TABLE' && el.caption) return n.cleanText(el.caption.textContent);
    const aria = el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('title'));
    if (aria) return n.cleanText(aria);
    let node = el;
    for (let depth = 0; node && depth < 8; depth++) {
      let sib = node.previousElementSibling;
      for (let k = 0; sib && k < 6; k++, sib = sib.previousElementSibling) {
        const h = sib.matches('h1,h2,h3,h4,h5,legend,.card-title,.card-header,.title,.page-title,[class*="title"],[class*="header"]')
          ? sib
          : sib.querySelector && sib.querySelector('h1,h2,h3,h4,h5,.card-title,.card-header,[class*="title"]');
        if (h) {
          const t = n.cleanText(h.innerText || h.textContent);
          if (t && t.length < 120) return t;
        }
      }
      node = node.parentElement;
    }
    return '';
  }

  /* ---------- جداول HTML ---------- */

  /** يحوّل جدولًا إلى شبكة مستطيلة مع مراعاة rowspan/colspan. */
  function tableGrid(table) {
    const grid = [];
    const isHead = [];
    const trs = Array.from(table.rows).filter((tr) => tr.closest('table') === table && isVisible(tr));
    trs.forEach((tr, r) => {
      grid[r] = grid[r] || [];
      isHead[r] = tr.parentElement.tagName === 'THEAD' || (tr.cells.length > 0 && Array.from(tr.cells).every((c) => c.tagName === 'TH'));
      let c = 0;
      for (const cell of Array.from(tr.cells)) {
        if (!isVisible(cell) && cell.getClientRects().length === 0 && getComputedStyle(cell).display === 'none') continue;
        while (grid[r][c] !== undefined) c++;
        const text = cellText(cell);
        const rs = Math.max(1, Math.min(parseInt(cell.getAttribute('rowspan') || '1', 10) || 1, 200));
        const cs = Math.max(1, Math.min(parseInt(cell.getAttribute('colspan') || '1', 10) || 1, 50));
        for (let i = 0; i < rs; i++) {
          grid[r + i] = grid[r + i] || [];
          for (let j = 0; j < cs; j++) grid[r + i][c + j] = text;
        }
        c += cs;
      }
    });
    return { grid: grid.map((row) => Array.from(row, (v) => (v == null ? '' : v))), isHead };
  }

  function looksLikeHeaderRow(row, nextRows) {
    const n = N();
    const filled = row.filter(Boolean);
    if (filled.length < Math.max(2, row.length * 0.5)) return false;
    const numericHere = filled.filter((v) => n.parseNumber(v)).length;
    if (numericHere > filled.length * 0.3) return false;
    const numericBelow = nextRows.flat().filter((v) => v && n.parseNumber(v)).length;
    return numericBelow > 0 || new Set(filled).size === filled.length;
  }

  function fromGrid(grid, isHead) {
    let headCount = 0;
    while (headCount < grid.length && isHead[headCount]) headCount++;
    if (headCount === 0 && grid.length > 1 && looksLikeHeaderRow(grid[0], grid.slice(1, 6))) headCount = 1;
    const width = Math.max(0, ...grid.map((r) => r.length));
    const headers = Array.from({ length: width }, (_, c) => {
      const parts = [];
      for (let r = 0; r < headCount; r++) {
        const v = grid[r][c] || '';
        if (v && parts[parts.length - 1] !== v) parts.push(v);
      }
      return parts.join(' - ');
    });
    const rows = grid.slice(headCount).filter((r) => r.some((v) => v));
    // حذف أعمدة الأزرار الفارغة تمامًا (مثل "إجراءات")
    const keep = headers.map((h, c) => rows.some((r) => r[c]) || false);
    return {
      headers: headers.filter((_, c) => keep[c]).map((h, c) => h || `عمود ${c + 1}`),
      rows: rows.map((r) => r.filter((_, c) => keep[c])),
    };
  }

  function extractHtmlTable(table) {
    const { grid, isHead } = tableGrid(table);
    return fromGrid(grid, isHead);
  }

  /* ---------- شبكات ARIA ---------- */

  function extractAriaGrid(el) {
    const rows = Array.from(el.querySelectorAll('[role="row"]')).filter(isVisible);
    const grid = [];
    const isHead = [];
    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll('[role="columnheader"],[role="cell"],[role="gridcell"],[role="rowheader"]')).filter(
        (c) => c.closest('[role="row"]') === row
      );
      if (!cells.length) continue;
      grid.push(cells.map(cellText));
      isHead.push(cells.every((c) => c.getAttribute('role') === 'columnheader'));
    }
    return fromGrid(grid, isHead);
  }

  /* ---------- البطاقات المتكررة ---------- */

  function signature(el) {
    const cls = Array.from(el.classList || []).filter((c) => !/active|selected|odd|even|hover|ng-|show|collapse|\d/.test(c)).sort().join('.');
    return el.tagName + '.' + cls;
  }

  /** الأوراق النصية لعنصر مع مسار بنيوي ثابت لكل منها. */
  function leaves(item) {
    const out = [];
    const walk = (el, path) => {
      if (SKIP_TAGS.has(el.tagName) || !isVisible(el)) return;
      const kids = Array.from(el.children).filter((k) => !SKIP_TAGS.has(k.tagName));
      const ownText = Array.from(el.childNodes).filter((x) => x.nodeType === 3).map((x) => x.textContent).join(' ').trim();
      if (!kids.length || ownText) {
        const t = cellText(el);
        if (t) { out.push({ path, text: t }); return; }
      }
      const counter = {};
      for (const k of kids) {
        const s = signature(k);
        counter[s] = (counter[s] || 0) + 1;
        walk(k, path + '>' + s + ':' + counter[s]);
      }
    };
    walk(item, '');
    return out;
  }

  function extractRepeated(container) {
    const n = N();
    const kids = Array.from(container.children).filter(isVisible);
    const groups = {};
    for (const k of kids) (groups[signature(k)] = groups[signature(k)] || []).push(k);
    const items = Object.values(groups).sort((a, b) => b.length - a.length)[0] || [];
    if (items.length < 2) return null;

    const perItem = items.map(leaves);
    const paths = [];
    for (const lv of perItem) for (const l of lv) if (!paths.includes(l.path)) paths.push(l.path);
    const matrix = perItem.map((lv) => paths.map((p) => (lv.find((l) => l.path === p) || {}).text || ''));

    // المسار الذي نصه ثابت في كل البطاقات = عنوان (label) للحقل الذي يليه
    const headers = [];
    const keepCols = [];
    for (let c = 0; c < paths.length; c++) {
      const col = matrix.map((r) => r[c]);
      const filled = col.filter(Boolean);
      const constant = filled.length >= items.length * 0.8 && new Set(filled.map(n.normalizeArabic)).size === 1;
      if (constant && c + 1 < paths.length) { headers.pendingLabel = filled[0].replace(/[:：]\s*$/, ''); continue; }
      if (!filled.length) continue;
      keepCols.push(c);
      headers.push(headers.pendingLabel || `حقل ${headers.length + 1}`);
      headers.pendingLabel = null;
    }
    if (keepCols.length < 2) return null;
    return { headers: [...headers], rows: matrix.map((r) => keepCols.map((c) => r[c])) };
  }

  function findRepeatedContainers(doc) {
    const found = [];
    const all = doc.body ? doc.body.querySelectorAll('ul, ol, div, section, tbody') : [];
    for (const el of all) {
      if (el.children.length < 4 || el.closest('table') || el.closest('#' + UI_ROOT_ID) || el.closest('nav, header, footer, [role="navigation"], [role="menu"]')) continue;
      const sigs = {};
      for (const k of el.children) sigs[signature(k)] = (sigs[signature(k)] || 0) + 1;
      const top = Math.max(...Object.values(sigs));
      if (top < 4 || top / el.children.length < 0.7) continue;
      if (!isVisible(el)) continue;
      const sample = Array.from(el.children).slice(0, 3).map((k) => leaves(k).length);
      if (Math.min(...sample) < 2 || Math.max(...sample) > 40) continue;
      // تجاهل الحاويات التي تحتوي حاوية أخرى مكتشفة (نأخذ الأعمق)
      found.push(el);
    }
    return found.filter((el) => !found.some((o) => o !== el && el.contains(o)));
  }

  /* ---------- المسح الشامل ---------- */

  function documents(rootDoc) {
    const docs = [rootDoc];
    for (const f of rootDoc.querySelectorAll('iframe, frame')) {
      try { if (f.contentDocument && f.contentDocument.body) docs.push(f.contentDocument); } catch (_) { /* إطار من نطاق آخر */ }
    }
    return docs;
  }

  /**
   * يمسح الصفحة ويعيد قائمة بالجداول المكتشفة مرتبة بالأهمية.
   * @returns {Array<{id,source,title,headers,rows,element}>}
   */
  function scan(rootDoc) {
    const n = N();
    const results = [];
    let counter = 0;
    const push = (el, source, data) => {
      if (!data || data.rows.length < 1 || data.headers.length < 2) return;
      el.dataset.muinId = el.dataset.muinId || 'm' + ++counter + '-' + Date.now().toString(36);
      results.push({
        id: el.dataset.muinId,
        source,
        title: nearestTitle(el) || '',
        headers: data.headers,
        rows: data.rows,
        element: el,
      });
    };

    for (const doc of documents(rootDoc)) {
      for (const t of doc.querySelectorAll('table')) {
        if (!isVisible(t) || t.closest('#' + UI_ROOT_ID)) continue;
        if (t.querySelector('table')) continue; // جداول التخطيط المتداخلة: نأخذ الداخلية
        try { push(t, 'table', extractHtmlTable(t)); } catch (e) { /* تجاهل جدولًا معطوبًا */ }
      }
      for (const g of doc.querySelectorAll('[role="grid"], [role="table"], [role="treegrid"]')) {
        if (g.tagName === 'TABLE' || !isVisible(g)) continue;
        try { push(g, 'grid', extractAriaGrid(g)); } catch (e) { /* */ }
      }
      for (const c of findRepeatedContainers(doc)) {
        if (c.tagName === 'TBODY') continue;
        try { push(c, 'cards', extractRepeated(c)); } catch (e) { /* */ }
      }
    }

    // تجاهل التكرارات (مثل رأس DataTables المنفصل عن جسمه)
    const unique = [];
    const seen = new Set();
    for (const r of results) {
      const fp = r.headers.join('|') + '#' + r.rows.slice(0, 3).map((x) => x.join('|')).join('/');
      if (seen.has(fp)) continue;
      seen.add(fp);
      unique.push(r);
    }
    return unique.sort((a, b) => b.rows.length * b.headers.length - a.rows.length * a.headers.length).map((r) => {
      r.title = r.title || n.cleanText(rootDoc.title) || 'جدول';
      return r;
    });
  }

  /** يستخرج من عنصر يختاره المستخدم يدويًا. */
  function extractFromElement(el) {
    const table = el.tagName === 'TABLE' ? el : el.querySelector('table') || el.closest('table');
    if (table) return Object.assign({ source: 'table', title: nearestTitle(table) }, extractHtmlTable(table));
    const grid = el.closest('[role="grid"],[role="table"]') || el.querySelector('[role="grid"],[role="table"]');
    if (grid) return Object.assign({ source: 'grid', title: nearestTitle(grid) }, extractAriaGrid(grid));
    let node = el;
    for (let i = 0; node && i < 6; i++, node = node.parentElement) {
      const data = extractRepeated(node);
      if (data && data.rows.length >= 2) return Object.assign({ source: 'cards', title: nearestTitle(node) }, data);
    }
    return null;
  }

  function hasPagination(el) {
    const scope = (el && el.closest('.card, .panel, section, .dataTables_wrapper, main')) || document;
    return !!scope.querySelector('.pagination, .dataTables_paginate, [aria-label*="pagination" i], [class*="paginat"], nav[aria-label*="صفح"]');
  }

  Muin.extractor = { scan, extractHtmlTable, extractAriaGrid, extractRepeated, extractFromElement, cellText, hasPagination, UI_ROOT_ID };
})(typeof globalThis !== 'undefined' ? globalThis : this);
