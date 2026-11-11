// اختبار شامل: يحمّل الإضافة في Chromium، ويحاكي صفحات مدرستي بملفات محلية
// (لا اتصال بالمنصة الحقيقية)، ثم يتحقق من الاكتشاف والتقرير.
// التشغيل: node tests/e2e.js [مجلد_اللقطات]
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { chromium } = require('playwright');
const assert = require('assert/strict');

const EXT = path.resolve(__dirname, '..');
const FIX = path.join(__dirname, 'fixtures');
const SHOTS = process.argv[2];

(async () => {
  const userDir = fs.mkdtempSync(path.join(os.tmpdir(), 'muin-'));
  const ctx = await chromium.launchPersistentContext(userDir, {
    headless: true,
    channel: 'chromium',
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`],
    viewport: { width: 1280, height: 860 },
    locale: 'ar-SA',
  });
  // كل طلبات المنصة تُخدم من الملفات المحلية؛ أي طلب خارجي آخر يُسجَّل كخطأ خصوصية
  const external = [];
  await ctx.route(/^https?:\/\//, (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === 'schools.madrasati.sa') {
      const file = path.join(FIX, path.basename(url.pathname) || 'grades.html');
      return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: fs.readFileSync(file) });
    }
    external.push(url.href);
    return route.abort();
  });

  let [sw] = ctx.serviceWorkers();
  if (!sw) sw = await ctx.waitForEvent('serviceworker');
  const extId = sw.url().split('/')[2];
  // إغلاق صفحة الترحيب
  await new Promise((r) => setTimeout(r, 500));
  for (const p of ctx.pages()) if (p.url().includes('options.html')) await p.close();

  const page = await ctx.newPage();
  const results = {};

  async function openPanel(file) {
    await page.goto('https://schools.madrasati.sa/' + file);
    await page.waitForSelector('#muin-madrasati-root', { state: 'attached' });
    await page.locator('#muin-madrasati-root').locator('button.fab').click();
    await page.locator('#muin-madrasati-root .card').first().waitFor();
    return page.locator('#muin-madrasati-root .list .card');
  }

  // 1) الدرجات: جدول HTML برؤوس متعددة المستويات وأرقام هندية
  let cards = await openPanel('grades.html');
  assert.equal(await cards.count(), 1, 'جدول درجات واحد');
  const gCard = cards.first();
  assert.match(await gCard.innerText(), /درجات وتقويم/);
  assert.match(await gCard.innerText(), /8 صف/);
  assert.match(await gCard.innerText(), /مقسّم على صفحات/, 'تنبيه الترقيم');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'panel.png') });

  const [report] = await Promise.all([ctx.waitForEvent('page'), gCard.getByText('تقرير ذكي').click()]);
  report.on('pageerror', (e) => console.log('[report err]', e.message));
  await report.waitForSelector('.kpis');
  const text = await report.locator('#report').innerText();
  assert.match(text, /8\s*عدد الطلاب/);
  assert.match(text, /الفترة الأولى - اختبار قصير \(15\)/, 'دمج الرؤوس متعددة المستويات');
  assert.match(text, /فهد سعد القحطاني/);
  assert.match(text, /قائمة المتابعة/);
  assert.doesNotMatch(text, /إجراءات/, 'حذف عمود الأزرار الفارغ');
  results.gradesReport = report.url();
  if (SHOTS) {
    await report.setViewportSize({ width: 900, height: 1200 });
    await report.screenshot({ path: path.join(SHOTS, 'report-grades.png'), fullPage: true });
    await report.pdf({ path: path.join(SHOTS, 'report-grades.pdf'), format: 'A4', printBackground: true });
  }

  // إعدادات الأعمدة: تغيير العظمى يعيد الحساب
  await report.click('#btn-columns');
  const maxInput = report.locator('.col-max').nth(5); // المشاركة (10)
  assert.equal(await maxInput.inputValue(), '10');
  await report.click('#apply-columns');
  await report.close();

  // 2) الحضور: شبكة ARIA مع أيقونات
  cards = await openPanel('attendance.html');
  const aText = await cards.first().innerText();
  assert.match(aText, /حضور وغياب/);
  const [att] = await Promise.all([ctx.waitForEvent('page'), cards.first().getByText('تقرير ذكي').click()]);
  await att.waitForSelector('.kpis');
  const attText = await att.locator('#report').innerText();
  assert.match(attText, /نسبة الغياب/);
  assert.match(attText, /نواف سامي \(3 من 5\)/);
  if (SHOTS) { await att.setViewportSize({ width: 900, height: 1200 }); await att.screenshot({ path: path.join(SHOTS, 'report-attendance.png'), fullPage: true }); }
  await att.close();

  // 3) المعلمين: بطاقات متكررة بلا جدول
  cards = await openPanel('teachers.html');
  const tText = await cards.first().innerText();
  assert.match(tText, /نشاط المعلمين/, tText);
  assert.match(tText, /5 صف/);
  const [tr] = await Promise.all([ctx.waitForEvent('page'), cards.first().getByText('تقرير ذكي').click()]);
  await tr.waitForSelector('.kpis');
  const trText = await tr.locator('#report').innerText();
  assert.match(trText, /أ\. محمد الشمري/);
  assert.match(trText, /لا نشاط مسجّل/);
  if (SHOTS) { await tr.setViewportSize({ width: 900, height: 1200 }); await tr.screenshot({ path: path.join(SHOTS, 'report-teachers.png'), fullPage: true }); }
  await tr.close();

  // 4) المجموعات: صفحتا الدرجات تُدمجان دون تكرار
  cards = await openPanel('grades.html');
  page.once('dialog', (d) => d.accept('درجات ثاني متوسط'));
  await cards.first().getByText('+ مجموعة').click();
  await page.locator('#muin-madrasati-root .collections .card').waitFor();
  page.once('dialog', (d) => d.accept('1'));
  await cards.first().getByText('+ مجموعة').click();
  await page.waitForFunction(() => /أُضيف 0 صف/.test(document.getElementById('muin-madrasati-root').shadowRoot.querySelector('.status').textContent));
  const stored = await sw.evaluate(() => chrome.storage.local.get('collections'));
  assert.equal(stored.collections[0].table.rows.length, 8);

  // 5) الخصوصية: لا طلبات خارجية إطلاقًا
  assert.deepEqual(external, [], 'طلبات خارجية: ' + external.join(', '));

  // 6) صفحة الإعدادات تعمل
  const opt = await ctx.newPage();
  await opt.goto(`chrome-extension://${extId}/src/options/options.html`);
  await opt.fill('input[name=schoolName]', 'متوسطة التجربة');
  await opt.click('button[type=submit]');
  await opt.waitForSelector('#saved:has-text("حُفظت")');
  if (SHOTS) await opt.screenshot({ path: path.join(SHOTS, 'options.png'), fullPage: true });

  await ctx.close();
  console.log('✓ جميع اختبارات المتصفح نجحت');
})().catch((e) => { console.error(e); process.exit(1); });
