/*
 * مُعين مدرستي — أدوات النصوص والأرقام.
 * كل الدوال نقية (بلا DOM) لتعمل في صفحة المحتوى وصفحة التقرير واختبارات Node.
 */
(function (root) {
  'use strict';
  const Muin = (root.Muin = root.Muin || {});

  const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';
  const PERSIAN = '۰۱۲۳۴۵۶۷۸۹';

  /** يحوّل الأرقام الهندية والفارسية إلى لاتينية ويوحّد الفواصل. */
  function toLatinDigits(input) {
    if (input == null) return '';
    let s = String(input);
    s = s.replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC.indexOf(d)));
    s = s.replace(/[۰-۹]/g, (d) => String(PERSIAN.indexOf(d)));
    return s.replace(/٫/g, '.').replace(/٬/g, ',').replace(/٪/g, '%');
  }

  /** ينظّف النص: مسافات، محارف اتجاه، تطويل. */
  function cleanText(input) {
    if (input == null) return '';
    return String(input)
      .replace(/[​-‏‪-‮⁦-⁩﻿]/g, '')
      .replace(/ـ/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** تطبيع عربي للمقارنة والبحث عن الكلمات المفتاحية (لا للعرض). */
  function normalizeArabic(input) {
    return cleanText(toLatinDigits(input))
      .replace(/[ً-ْٰ]/g, '') // التشكيل
      .replace(/[إأآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .toLowerCase();
  }

  const EMPTY_TOKENS = new Set(['', '-', '—', '–', '--', 'n/a', 'na', 'null', 'لا يوجد', 'غير متوفر', '...']);

  function isEmptyValue(raw) {
    return EMPTY_TOKENS.has(normalizeArabic(raw));
  }

  /**
   * يحلل خلية رقمية. يدعم: 15، 15.5، ١٥٫٥، 85%، 17/20، "17 من 20".
   * يعيد { value, max, percent, isPercent } أو null.
   */
  function parseNumber(raw) {
    const s = cleanText(toLatinDigits(raw)).replace(/,/g, '');
    if (!s) return null;

    let m = s.match(/^(-?\d+(?:\.\d+)?)\s*(?:\/|من)\s*(\d+(?:\.\d+)?)$/);
    if (m) {
      const value = parseFloat(m[1]);
      const max = parseFloat(m[2]);
      if (!(max > 0)) return null;
      return { value, max, percent: (value / max) * 100, isPercent: false };
    }

    m = s.match(/^%?\s*(-?\d+(?:\.\d+)?)\s*%?$/);
    if (m) {
      const value = parseFloat(m[1]);
      const isPercent = s.includes('%');
      return { value, max: isPercent ? 100 : null, percent: isPercent ? value : null, isPercent };
    }

    // "15 درجة" أو "درجة 15" — رقم واحد مع كلمة قصيرة
    m = s.match(/^(?:[^\d\s]{1,8}\s+)?(-?\d+(?:\.\d+)?)(?:\s+[^\d\s]{1,8})?$/);
    if (m && !/\d{4}[-/]\d{1,2}/.test(s)) {
      return { value: parseFloat(m[1]), max: null, percent: null, isPercent: false };
    }
    return null;
  }

  /** يتعرف على التواريخ الشائعة (ميلادي أو هجري) دون محاولة تحويلها. */
  function looksLikeDate(raw) {
    const s = cleanText(toLatinDigits(raw));
    return (
      /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(s) ||
      /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/.test(s) ||
      /\d{1,2}:\d{2}/.test(s)
    );
  }

  /** يستخرج الدرجة العظمى من عنوان العمود مثل "اختبار 1 (20)" أو "الواجبات من 10". */
  function maxFromHeader(header) {
    const s = cleanText(toLatinDigits(header));
    const m =
      s.match(/\((\d+(?:\.\d+)?)\)/) ||
      s.match(/(?:من|\/)\s*(\d+(?:\.\d+)?)\s*$/) ||
      s.match(/\[(\d+(?:\.\d+)?)\]/);
    if (!m) return null;
    const v = parseFloat(m[1]);
    return v > 0 && v <= 1000 ? v : null;
  }

  const COMMON_MAXES = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 75, 80, 90, 100];

  /** يقدّر الدرجة العظمى من أعلى قيمة مرصودة: أصغر سقف شائع لا يقل عنها. */
  function guessMax(observedMax) {
    if (!(observedMax > 0)) return null;
    for (const m of COMMON_MAXES) if (observedMax <= m) return m;
    return Math.ceil(observedMax / 10) * 10;
  }

  function round(n, digits = 1) {
    if (n == null || Number.isNaN(n)) return null;
    const f = Math.pow(10, digits);
    return Math.round(n * f) / f;
  }

  /** تنسيق رقم للعرض بأرقام لاتينية (كما في دليل الهوية). */
  function fmt(n, digits = 1) {
    if (n == null || Number.isNaN(n)) return '—';
    const r = round(n, digits);
    return Number.isInteger(r) ? String(r) : r.toFixed(digits);
  }

  Muin.numbers = {
    toLatinDigits,
    cleanText,
    normalizeArabic,
    isEmptyValue,
    parseNumber,
    looksLikeDate,
    maxFromHeader,
    guessMax,
    round,
    fmt,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Muin.numbers;
})(typeof globalThis !== 'undefined' ? globalThis : this);
