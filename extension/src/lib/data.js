/*
 * مُعين مدرستي — تصدير ودمج الجداول.
 */
(function (root) {
  'use strict';
  const Muin = (root.Muin = root.Muin || {});
  const N = () => Muin.numbers;

  /** يحمي من حقن الصيغ في Excel دون إفساد الأرقام السالبة. */
  function safeCell(v) {
    let s = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?%?$/.test(s)) s = "'" + s;
    if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  /** CSV بترميز UTF-8 مع BOM ليفتحه Excel بالعربية مباشرة. */
  function toCSV(headers, rows) {
    const lines = [headers.map(safeCell).join(',')];
    for (const r of rows) lines.push(r.map(safeCell).join(','));
    return '﻿' + lines.join('\r\n');
  }

  /**
   * يدمج جدولين لقطتين من الصفحة نفسها (مثل صفحات ترقيم مختلفة) أو من صفحتين
   * عن الفصل نفسه (درجات + حضور). يوحّد الأعمدة بالاسم، ويدمج الصفوف بعمود المفتاح.
   */
  function mergeTables(base, add, keyHeader) {
    const n = N();
    const norm = (h) => n.normalizeArabic(h);
    const headers = [...base.headers];
    const map = add.headers.map((h) => {
      let i = headers.findIndex((x) => norm(x) === norm(h));
      if (i === -1) { headers.push(h); i = headers.length - 1; }
      return i;
    });
    const width = headers.length;
    const pad = (r) => Array.from({ length: width }, (_, i) => (r[i] == null ? '' : r[i]));
    const rows = base.rows.map(pad);

    const kb = keyHeader ? base.headers.findIndex((h) => norm(h) === norm(keyHeader)) : -1;
    const ka = keyHeader ? add.headers.findIndex((h) => norm(h) === norm(keyHeader)) : -1;
    const index = new Map();
    if (kb !== -1) rows.forEach((r, i) => { const k = norm(r[kb]); if (k) index.set(k, i); });
    const seen = new Set(rows.map((r) => r.map(norm).join('|')));

    for (const r of add.rows) {
      const k = ka !== -1 ? norm(r[ka]) : '';
      if (k && index.has(k)) {
        const target = rows[index.get(k)];
        r.forEach((v, j) => { if (v && !target[map[j]]) target[map[j]] = v; });
        continue;
      }
      const row = new Array(width).fill('');
      r.forEach((v, j) => { row[map[j]] = v; });
      const fp = row.map(norm).join('|');
      if (seen.has(fp)) continue;
      seen.add(fp);
      rows.push(row);
      if (k) index.set(k, rows.length - 1);
    }
    return Object.assign({}, base, { headers, rows });
  }

  function slug(s) {
    return N().cleanText(s).replace(/[\\/:*?"<>|]+/g, '-').slice(0, 60) || 'تقرير';
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  Muin.data = { toCSV, mergeTables, safeCell, slug, uid };
  if (typeof module !== 'undefined' && module.exports) module.exports = Muin.data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
