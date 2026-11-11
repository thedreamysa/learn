/*
 * مُعين مدرستي — عامل الخلفية.
 * يفتح صفحة التقرير ويمرر لها البيانات عبر chrome.storage.session
 * (ذاكرة مؤقتة لا تُكتب على القرص وتُمسح بإغلاق المتصفح، ولا تصل إليها صفحات الويب).
 */
'use strict';

const MADRASATI = /^https:\/\/([a-z0-9-]+\.)*madrasati\.sa\//i;

chrome.action.onClicked.addListener(async (tab) => {
  if (tab && tab.id && MADRASATI.test(tab.url || '')) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'toggle-panel' });
      return;
    } catch (e) {
      // الصفحة فُتحت قبل تثبيت الإضافة: نطلب من المستخدم تحديثها
    }
  }
  chrome.tabs.create({ url: chrome.runtime.getURL('src/options/options.html#help') });
});

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (!msg || !msg.type) return false;
  if (sender.id !== chrome.runtime.id) return false;

  if (msg.type === 'open-report') {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    chrome.storage.session
      .set({ ['report:' + id]: msg.payload })
      .then(() => chrome.tabs.create({ url: chrome.runtime.getURL('src/report/report.html#' + id), index: sender.tab ? sender.tab.index + 1 : undefined }))
      .then(() => reply({ ok: true, id }))
      .catch((e) => reply({ ok: false, error: String(e) }));
    return true;
  }

  if (msg.type === 'open-options') {
    chrome.runtime.openOptionsPage();
    reply({ ok: true });
    return false;
  }
  return false;
});

chrome.runtime.onInstalled.addListener((d) => {
  if (d.reason === 'install') chrome.tabs.create({ url: chrome.runtime.getURL('src/options/options.html#welcome') });
});
