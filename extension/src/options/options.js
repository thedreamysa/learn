(function () {
  'use strict';
  const { analyzer } = globalThis.Muin;
  const form = document.getElementById('settings');
  const bandsBox = document.getElementById('bands');
  const NUMERIC = ['passMark', 'riskMark', 'absenceRateAlert', 'absenceCountAlert', 'missingWorkAlert', 'retentionDays'];
  const TEXT = ['educationOffice', 'schoolName', 'teacherName', 'principalName'];

  function renderBands(bands) {
    bandsBox.replaceChildren();
    bands.forEach((b, i) => {
      const label = document.createElement('label');
      label.textContent = `${b.label} — من (٪)`;
      const input = document.createElement('input');
      Object.assign(input, { type: 'number', min: 0, max: 100, step: 'any', value: b.min, name: 'band-' + i });
      if (i === bands.length - 1) input.disabled = true;
      label.append(input);
      bandsBox.append(label);
    });
  }

  function fill(s) {
    for (const k of TEXT) form.elements[k].value = s[k] || '';
    for (const k of NUMERIC) form.elements[k].value = s[k];
    form.elements.showMoeLogo.checked = !!s.showMoeLogo;
    renderBands(s.bands);
  }

  async function current() {
    const { settings } = await chrome.storage.local.get('settings');
    return analyzer.mergeSettings(settings);
  }

  async function usage() {
    const { collections = [] } = await chrome.storage.local.get('collections');
    const bytes = await chrome.storage.local.getBytesInUse(null);
    const rows = collections.reduce((s, c) => s + c.table.rows.length, 0);
    document.getElementById('usage').textContent = `${collections.length} مجموعة (${rows} صف) — ${(bytes / 1024).toFixed(1)} كيلوبايت`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const s = await current();
    for (const k of TEXT) s[k] = form.elements[k].value.trim();
    for (const k of NUMERIC) {
      const v = parseFloat(form.elements[k].value);
      if (!Number.isNaN(v)) s[k] = v;
    }
    s.showMoeLogo = form.elements.showMoeLogo.checked;
    s.bands = s.bands.map((b, i) => {
      const inp = form.elements['band-' + i];
      const v = parseFloat(inp && inp.value);
      return Object.assign({}, b, { min: i === s.bands.length - 1 ? 0 : Number.isNaN(v) ? b.min : v });
    });
    const mins = s.bands.map((b) => b.min);
    const saved = document.getElementById('saved');
    if (mins.some((m, i) => i > 0 && m >= mins[i - 1])) {
      saved.textContent = 'حدود التقديرات يجب أن تكون تنازلية.';
      saved.className = 'saved err';
      return;
    }
    if (s.riskMark < s.passMark) s.riskMark = s.passMark;
    await chrome.storage.local.set({ settings: s });
    fill(s);
    saved.textContent = 'حُفظت الإعدادات ✓';
    saved.className = 'saved';
    setTimeout(() => { saved.textContent = ''; }, 2500);
  });

  document.getElementById('reset').addEventListener('click', async () => {
    const s = await current();
    const keep = {};
    for (const k of TEXT) keep[k] = s[k];
    const fresh = Object.assign({}, analyzer.DEFAULT_SETTINGS, keep);
    await chrome.storage.local.set({ settings: fresh });
    fill(fresh);
  });

  document.getElementById('wipe').addEventListener('click', async () => {
    if (!confirm('سيُحذف كل ما حفظه مُعين على هذا الجهاز (الإعدادات والمجموعات والتقارير المفتوحة). متابعة؟')) return;
    await chrome.storage.local.clear();
    await chrome.storage.session.clear();
    fill(analyzer.mergeSettings({}));
    usage();
  });

  current().then(fill);
  usage();
})();
