// EPISODE 3 · «الحاشية» — editorial premium look.
// Near-white paper, Swiss grid (RTL), giant black Tajawal numerals, ONE living turquoise ink line
// that circles, becomes the hype curve, strikes through, ticks, and finally signs the logo.
// Every number carries a footnote slip with its source. Pure function of t; 16:9 and re-staged 9:16.
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { clamp, ease } = U;
  const W = G.W, H = G.H, P = H > W;
  const C = { tq: '#00C1CA', tqD: '#00959C', ink: '#0B0F12', paper: '#F6F5F1', rule: 'rgba(11,15,18,0.14)', gr: '#5B6770', red: '#D7383E', wh: '#FFFFFF' };
  const AR = '"Tajawal", "TajawalL", sans-serif';
  const LA = '"Poppins", "TajawalL", sans-serif';
  const cx = W / 2;
  const TOP = P ? 250 : 40, FOOT = P ? Math.round(H * 0.775) : H - 40;

  // ---------------------------------------------------------------- helpers
  const k01 = (t, a, d) => clamp((t - a) / d);
  const eo = (x) => ease.outCubic(clamp(x));
  const eio = (x) => ease.inOutCubic(clamp(x));
  const eb = (x) => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const local = (t, sc) => t - S.S[sc][0];
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function txt(ctx, s, x, y, o = {}) {
    const { size = 48, w = 700, color = C.ink, align = 'center', fam = AR, alpha = 1, rtl = true, base = 'middle' } = o;
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.font = `${w} ${size}px ${fam}`; ctx.direction = rtl ? 'rtl' : 'ltr'; ctx.textAlign = align; ctx.textBaseline = base;
    ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.restore();
  }
  const measure = (ctx, s, size, w = 700, fam = AR) => { ctx.save(); ctx.font = `${w} ${size}px ${fam}`; const m = ctx.measureText(s).width; ctx.restore(); return m; };
  function kline(ctx, s, x, y, t, t0, o = {}) {
    const p = k01(t, t0, o.dur || 0.45); if (p <= 0) return;
    const size = o.size || 48;
    ctx.save(); ctx.beginPath(); ctx.rect(0, y - size * 0.95, W, size * 1.9); ctx.clip();
    txt(ctx, s, x, y + (1 - eo(p)) * size * 1.1, o); ctx.restore();
  }

  // ---------------------------------------------------------------- paper
  let GRAIN = null;
  function makeGrain() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d'), img = g.createImageData(256, 256), rnd = U.mulberry32(7);
    for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (rnd() - 0.5) * 70; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0);
    g.globalAlpha = 0.18; g.strokeStyle = '#6b6b6b'; g.lineWidth = 0.6;
    for (let i = 0; i < 40; i++) { const x = rnd() * 256, y = rnd() * 256, a = rnd() * 6.28, l = 6 + rnd() * 18; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 3, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    return c;
  }
  function paper(ctx) {
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    const v = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.3, W / 2, H * 0.45, Math.max(W, H) * 0.8);
    v.addColorStop(0, 'rgba(255,255,255,0.35)'); v.addColorStop(1, 'rgba(120,110,95,0.10)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    if (GRAIN) { ctx.save(); ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = ctx.createPattern(GRAIN, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore(); }
    ctx.save(); ctx.strokeStyle = 'rgba(0,149,156,0.05)'; ctx.lineWidth = 1;
    const m = P ? 60 : 96, gw = (W - 2 * m) / 12;
    for (let i = 0; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(m + i * gw, 0); ctx.lineTo(m + i * gw, H); ctx.stroke(); }
    ctx.restore();
  }

  // ---------------------------------------------------------------- the ink line
  function ink(ctx, pts, p, o = {}) {
    const { w = 9, color = C.tq, nib = true } = o;
    if (p <= 0 || pts.length < 2) return;
    const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const tot = L[L.length - 1], goal = tot * clamp(p);
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color;
    let hx = pts[0][0], hy = pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      if (L[i - 1] >= goal) break;
      const f = Math.min(1, (goal - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]));
      const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, y = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f;
      const u = L[i] / tot;
      ctx.lineWidth = w * (0.72 + 0.28 * Math.sin(u * 9.4 + 1.3)) * (u < 0.04 ? 0.6 + u * 10 : 1);
      ctx.beginPath(); ctx.moveTo(pts[i - 1][0], pts[i - 1][1]); ctx.lineTo(x, y); ctx.stroke();
      hx = x; hy = y;
    }
    if (nib && p < 1) {
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, w * 2.6);
      g.addColorStop(0, 'rgba(0,193,202,0.55)'); g.addColorStop(1, 'rgba(0,193,202,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, w * 2.6, 0, 7); ctx.fill();
      ctx.fillStyle = C.tqD; ctx.beginPath(); ctx.arc(hx, hy, w * 0.55, 0, 7); ctx.fill();
    }
    ctx.restore();
  }
  function loopPts(x, y, rx, ry, seed = 1) {
    const pts = [], a0 = -2.5, turns = 0.99;
    for (let i = 0; i <= 90; i++) {
      const a = a0 + (i / 90) * Math.PI * 2 * turns, wob = 1 + 0.03 * Math.sin(i * 0.31 + seed) + (i / 90) * 0.05;
      pts.push([x + Math.cos(a) * rx * wob, y + Math.sin(a) * ry * wob * (1 - 0.04 * Math.cos(a * 2))]);
    }
    return pts;
  }
  const linePts = (x0, y0, x1, y1, bow = 0, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * bow]; });
  const tickPts = (x, y, s) => [[x - s * 0.5, y], [x - s * 0.15, y + s * 0.38], [x + s * 0.55, y - s * 0.5]];

  // ---------------------------------------------------------------- footnotes
  function footMark(ctx, n, x, y, t, t0, size = 40) {
    const p = eb(k01(t, t0, 0.35)); if (p <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
    ctx.fillStyle = C.tq; ctx.beginPath(); ctx.arc(0, 0, size * 0.62, 0, 7); ctx.fill();
    txt(ctx, String(n), 0, 2, { size, w: 800, fam: LA, rtl: false, color: C.wh });
    ctx.restore();
  }
  function slip(ctx, n, line1, line2, x, y, t, t0, o = {}) {
    const p = k01(t, t0, 0.45); if (p <= 0) return;
    const fs = o.size || (P ? 26 : 24), w1 = Math.max(measure(ctx, line1, fs, 700), measure(ctx, line2, fs * 0.85, 500, LA)) + 110, h = fs * 3.2;
    ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(x, y + (1 - eb(p)) * 30); ctx.rotate(-0.015);
    ctx.shadowColor = 'rgba(60,50,30,0.16)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    ctx.fillStyle = C.wh; ctx.fillRect(-w1 / 2, -h / 2, w1, h); ctx.shadowColor = 'transparent';
    ctx.fillStyle = C.tq; ctx.fillRect(w1 / 2 - 8, -h / 2, 8, h);
    txt(ctx, String(n), w1 / 2 - 40, -h * 0.18, { size: fs * 1.1, w: 800, fam: LA, rtl: false, color: C.tq });
    txt(ctx, line1, w1 / 2 - 70, -h * 0.18, { size: fs, w: 700, align: 'right' });
    txt(ctx, line2, w1 / 2 - 70, h * 0.22, { size: fs * 0.85, w: 500, fam: LA, rtl: false, align: 'right', color: C.gr });
    ctx.restore();
  }
  const SRC2 = 'Gartner — AI Hype Cycle, Oct 2026';

  // ---------------------------------------------------------------- logo, masthead, colophon
  function logoMark(ctx, x, y, s, draw = 1) {
    const sw = s * 0.78, sh = s * 0.5, lw = s * 0.045;
    ctx.save(); ctx.translate(x, y);
    const bz = clamp(draw * 1.6);
    if (bz > 0) {
      const per = 2 * (sw + sh);
      ctx.lineWidth = lw; ctx.strokeStyle = C.ink; ctx.lineJoin = 'round';
      ctx.setLineDash([per * bz, per]); rr(ctx, -sw / 2, -sh, sw, sh, s * 0.03); ctx.stroke(); ctx.setLineDash([]);
    }
    const bp = eo(clamp(draw * 2.2 - 0.9));
    if (bp > 0) {
      ctx.fillStyle = C.tq; ctx.beginPath();
      ctx.moveTo(-s / 2 * bp, -s * 0.02); ctx.lineTo(s / 2 * bp, -s * 0.02);
      ctx.quadraticCurveTo(s / 2 * bp, s * 0.07, s * 0.44 * bp, s * 0.07); ctx.lineTo(-s * 0.44 * bp, s * 0.07);
      ctx.quadraticCurveTo(-s / 2 * bp, s * 0.07, -s / 2 * bp, -s * 0.02); ctx.closePath(); ctx.fill();
    }
    const bk = eb(clamp(draw * 2.2 - 1.2));
    if (bk > 0) {
      ctx.save(); ctx.translate(0, -sh * 0.5); ctx.scale(bk, bk);
      const bw = sw * 0.22, bh = sh * 0.62;
      ctx.fillStyle = C.ink;
      ctx.fillRect(-bw - s * 0.012, -bh / 2 + s * 0.02, s * 0.012, bh); ctx.fillRect(bw, -bh / 2 + s * 0.02, s * 0.012, bh); ctx.fillRect(-bw, bh / 2 - s * 0.006, bw * 2, s * 0.018);
      ctx.fillStyle = C.tq;
      for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sg * s * 0.006, -bh / 2 + s * 0.02); ctx.quadraticCurveTo(sg * bw * 0.5, -bh / 2 - s * 0.01, sg * bw, -bh / 2 + s * 0.005); ctx.lineTo(sg * bw, bh / 2 - s * 0.01); ctx.quadraticCurveTo(sg * bw * 0.5, bh / 2 - s * 0.03, sg * s * 0.006, bh / 2); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    ctx.restore();
  }
  function masthead(ctx) {
    const m = P ? 60 : 96, y = TOP + 34;
    logoMark(ctx, W - m - 40, y + 8, 76);
    txt(ctx, 'تقرير في دقائق', W - m - 96, y - 6, { size: P ? 30 : 26, w: 800, align: 'right' });
    txt(ctx, 'العدد 3 · تقنيات التعليم والذكاء الاصطناعي', W - m - 96, y + 26, { size: P ? 21 : 18, w: 500, align: 'right', color: C.gr });
    txt(ctx, 'Gartner · Oct 2026', m, y + 10, { size: P ? 22 : 19, w: 600, fam: LA, rtl: false, align: 'left', color: C.gr });
    ctx.fillStyle = C.ink; ctx.fillRect(m, y + 54, W - 2 * m, 2.5); ctx.fillRect(m, y + 60, W - 2 * m, 0.8);
  }
  function colophon(ctx, t) {
    const m = P ? 60 : 96, y = FOOT - (P ? 40 : 34);
    ctx.fillStyle = C.ink; ctx.fillRect(m, y - 34, W - 2 * m, 1.2);
    const ns = P ? 32 : 28;
    txt(ctx, 'د. يحيى الأمير', W - m, y, { size: ns, w: 800, align: 'right' });
    const per = 3.5, i = Math.floor(t / per) % S.HANDLES.length, ph = (t % per) / per, roll = ph < 0.08 ? 1 - eo(ph / 0.08) : 0;
    const hx = W - m - measure(ctx, 'د. يحيى الأمير', ns, 800) - 30;
    ctx.save(); ctx.beginPath(); ctx.rect(m, y - 24, hx - m, 48); ctx.clip();
    txt(ctx, S.HANDLES[i], hx, y + 2 + roll * 40, { size: P ? 24 : 22, w: 600, fam: LA, rtl: false, align: 'right', color: C.tqD });
    ctx.restore();
    txt(ctx, 'المصدر: ' + S.SOURCE.ar, m, y, { size: P ? 22 : 20, w: 600, align: 'left', color: C.gr });
  }

  // ---------------------------------------------------------------- scenes
  // 1 · HOOK — «؟٪» guess beat, then the number wipes in, ink circles it, footnote drops
  function hook(ctx, t) {
    const l = t;
    paper(ctx); masthead(ctx);
    const ny = P ? H * 0.42 : H * 0.44, size = P ? 300 : 340;
    kline(ctx, 'كم مؤسسة نشرت وكلاء ذكاء اصطناعي فعلاً؟', cx, ny - size * 0.8, l, 0.05, { size: P ? 40 : 40, w: 700, color: C.gr });
    txt(ctx, 'خمّن قبل الكشف…', cx, ny + size * 0.72, { size: P ? 44 : 42, w: 700, color: C.tqD, alpha: k01(l, 0.4, 0.3) * (1 - k01(l, 1.25, 0.2)) });
    const rv = eio(k01(l, 1.3, 0.35));
    ctx.save(); ctx.beginPath(); ctx.rect(0, ny - size * 0.6, W, size * 1.2 * (1 - rv)); ctx.clip();
    txt(ctx, '؟٪', cx, ny, { size, w: 800, color: 'rgba(11,15,18,0.88)' }); ctx.restore();
    if (l < 1.7) { ctx.save(); ctx.globalAlpha = 0.35 * (1 - k01(l, 1.3, 0.3)); ctx.setLineDash([14, 16]); ctx.strokeStyle = C.tq; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(cx, ny + size * 0.04, Math.min(measure(ctx, '17%', size, 800) * 0.68, W / 2 - 90), size * 0.52, 0, 0, 7); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.beginPath(); ctx.rect(0, ny + size * 0.6 - size * 1.2 * rv, W, size * 1.2 * rv); ctx.clip();
    txt(ctx, `${S.FACTS.deployed}%`, cx, ny, { size, w: 800, rtl: false }); ctx.restore();
    const nw = measure(ctx, `${S.FACTS.deployed}%`, size, 800);
    ink(ctx, loopPts(cx, ny + size * 0.04, Math.min(nw * 0.68, W / 2 - 90), size * 0.52, 2), eio(k01(l, 1.7, 0.75)), { w: 10 });
    footMark(ctx, 1, cx - nw * 0.62, ny - size * 0.38, l, 2.35, P ? 34 : 30);
    if (P) {
      kline(ctx, 'فقط من المؤسسات', cx, ny + size * 0.85, l, 2.0, { size: 54, w: 800 });
      kline(ctx, 'نشرت وكلاء ذكاء اصطناعي', cx, ny + size * 0.85 + 70, l, 2.15, { size: 46, w: 700 });
    } else kline(ctx, 'فقط من المؤسسات نشرت وكلاء ذكاء اصطناعي', cx, ny + size * 0.8, l, 2.0, { size: 50, w: 800 });
    slip(ctx, 1, 'جارتنر · أكتوبر 2026', SRC2, P ? cx : W * 0.17, P ? ny + size * 0.85 + 190 : ny + size * 0.45, l, 2.6);
    colophon(ctx, t);
  }

  // 2 · TITLE — magazine cover: issue number, headline, ink underline, byline + logo signed in ink
  function title(ctx, t) {
    const l = local(t, 'title');
    paper(ctx);
    const m = P ? 60 : 96;
    txt(ctx, '03', P ? m : m, P ? TOP + 130 : H * 0.3, { size: P ? 240 : 320, w: 700, fam: LA, rtl: false, align: 'left', color: 'rgba(0,193,202,0.16)', alpha: k01(l, 0, 0.6) });
    const x = W - m, y0 = P ? H * 0.42 : H * 0.38, hs = P ? 92 : 110;
    kline(ctx, 'تقرير في دقائق · العدد 3', x, y0 - (P ? 125 : 120), l, 0.1, { size: P ? 32 : 30, w: 700, align: 'right', color: C.tqD });
    kline(ctx, 'وكلاء الذكاء الاصطناعي', x, y0, l, 0.3, { size: hs, w: 800, align: 'right' });
    kline(ctx, 'بين الضجيج والواقع', x, y0 + hs * 1.25, l, 0.55, { size: hs, w: 800, align: 'right' });
    const uw = measure(ctx, 'الضجيج والواقع', hs, 800), sx = x - measure(ctx, 'بين ', hs, 800);
    ink(ctx, linePts(sx, y0 + hs * 1.25 + hs * 0.62, sx - uw, y0 + hs * 1.25 + hs * 0.66, 6), eio(k01(l, 1.1, 0.7)), { w: 10 });
    kline(ctx, 'قراءة في تقرير جارتنر لدورة الضجيج — أكتوبر 2026', x, y0 + hs * 2.75, l, 1.5, { size: 32, w: 500, align: 'right', color: C.gr });
    const by = P ? FOOT - 120 : H * 0.85;
    logoMark(ctx, x - 50, by, 100, k01(l, 1.9, 1.2));
    txt(ctx, 'بقلم د. يحيى الأمير', x - 120, by - 18, { size: P ? 34 : 32, w: 800, align: 'right', alpha: k01(l, 2.4, 0.5) });
    txt(ctx, 'YAHYA ALAMEER · INSTRUCTIONAL DESIGN', x - 120, by + 22, { size: P ? 20 : 18, w: 600, fam: LA, rtl: false, align: 'right', color: C.gr, alpha: k01(l, 2.6, 0.5) });
  }

  // 3 · CURVE — the ink line becomes the hype curve (time flows right → left); phases typeset in
  function curve(ctx, t) {
    const l = local(t, 'curve');
    paper(ctx); masthead(ctx);
    const m = P ? 80 : 200;
    const x0 = m, x1 = W - m, yb = P ? H * 0.6 : H * 0.79, hgt = P ? 470 : 440;
    const f = (u) => 0.9 * Math.exp(-Math.pow((u - 0.22) / 0.085, 2)) + 0.05 + 0.5 / (1 + Math.exp(-(u - 0.64) / 0.09));
    const pt = (u) => [x1 - (x1 - x0) * u, yb - f(u) * hgt];
    kline(ctx, 'أين تقف الوكلاء على منحنى الضجيج؟', P ? cx : W - m, P ? TOP + 165 : TOP + 140, l, 0.1, { size: P ? 48 : 52, w: 800, align: P ? 'center' : 'right' });
    ctx.fillStyle = C.ink; ctx.fillRect(x0, yb, x1 - x0, 1.5); ctx.fillRect(x1, yb - hgt - 10, 1.5, hgt + 10);
    txt(ctx, P ? 'التوقعات ↑' : 'التوقعات', P ? x1 : x1 + 20, P ? yb + 32 : yb - hgt - 30, { size: 24, w: 700, color: C.gr, align: P ? 'right' : 'center' });
    txt(ctx, '← الزمن', x0, yb + 32, { size: 24, w: 700, color: C.gr, align: 'left' });
    const pts = Array.from({ length: 161 }, (_, i) => pt(i / 160));
    ink(ctx, pts, eio(k01(l, 0.5, 2.6)), { w: 10 });
    const phases = [
      { u: 0.22, ar: 'قمة التوقعات المتضخمة', t0: 2.2, up: 60 },
      { u: 0.4, ar: 'قاع خيبة الأمل', t0: 3.4, up: P ? 110 : 90, dx: P ? -150 : -190 },
      { u: 0.88, ar: 'هضبة الإنتاجية', t0: 4.4, up: 70 },
    ];
    phases.forEach((ph, i) => {
      const [x, y] = pt(ph.u), a = eo(k01(l, ph.t0, 0.4)); if (a <= 0) return;
      const ly = y - ph.up, lx = x + (ph.dx || 0);
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(lx, ly + 22); ctx.lineTo(x, y - 8); ctx.stroke(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.restore();
      txt(ctx, ph.ar, lx, ly, { size: P ? 30 : 30, w: 800, alpha: a });
    });
    // agents: placed only once the source position is verified — never guessed
    if (S.AGENTS_PHASE == null) kline(ctx, 'أين الوكلاء على هذا المنحنى؟ الأرقام تجيب…', P ? cx : W - m, P ? yb + 80 : yb + 62, l, 5.4, { size: P ? 34 : 32, w: 700, color: C.tqD, align: P ? 'center' : 'right' });
    slip(ctx, 2, 'دورة الضجيج — منهجية جارتنر', SRC2, P ? cx : W * 0.36, P ? yb + 172 : yb + 58, l, 1.2);
    colophon(ctx, t);
  }

  // 4 · EXPECT — 10×10 dot matrix, more than 60 fill in sequence
  function expect(ctx, t) {
    const l = local(t, 'expect');
    paper(ctx); masthead(ctx);
    const n = S.FACTS.expect, gap = P ? 52 : 50, r = P ? 17 : 16;
    const gw = gap * 9, gx = P ? cx - gw / 2 : W * 0.3 - gw / 2, gy = P ? TOP + 470 : H * 0.5 - gw / 2 + 20;
    for (let i = 0; i < 100; i++) {
      const row = Math.floor(i / 10), col = i % 10, x = gx + gw - col * gap, y = gy + row * gap;
      const t0 = 0.8 + i * 0.022, on = i < n && l > t0, pop = on ? eb(k01(l, t0, 0.25)) : 1;
      ctx.fillStyle = on ? C.tq : 'rgba(11,15,18,0.12)';
      ctx.beginPath(); ctx.arc(x, y, r * (on ? pop : 0.8), 0, 7); ctx.fill();
    }
    const tx = P ? cx : W * 0.74, ty = P ? TOP + 200 : H * 0.36;
    if (l > 0.8) txt(ctx, `+${Math.round(n * eo(k01(l, 0.8, 2.2)))}%`, tx, ty, { size: P ? 190 : 200, w: 800, rtl: false });
    footMark(ctx, 3, tx - (P ? 225 : 235), ty - 70, l, 3.0, 28);
    kline(ctx, 'من المؤسسات تتوقّع نشر الوكلاء', tx, ty + (P ? 135 : 145), l, 1.4, { size: 46, w: 800 });
    kline(ctx, 'خلال عامين', tx, ty + (P ? 200 : 210), l, 1.7, { size: 46, w: 800, color: C.tqD });
    slip(ctx, 3, 'جارتنر · أكتوبر 2026', SRC2, tx, P ? gy + gw + 88 : ty + 330, l, 3.1);
    colophon(ctx, t);
  }

  // 5 · CANCEL — five project dossiers; two get stamped «أُلغي»
  function stamp(ctx, x, y, s, t, t0) {
    const p = k01(t, t0, 0.18); if (p <= 0) return;
    const k = 1 + 0.6 * (1 - eo(p));
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.16); ctx.scale(k, k); ctx.globalAlpha = 0.9 * clamp(p * 3);
    ctx.strokeStyle = C.ink; ctx.lineWidth = s * 0.05; rr(ctx, -s * 0.62, -s * 0.24, s * 1.24, s * 0.48, s * 0.06); ctx.stroke();
    ctx.lineWidth = s * 0.015; rr(ctx, -s * 0.56, -s * 0.18, s * 1.12, s * 0.36, s * 0.04); ctx.stroke();
    txt(ctx, 'أُلغي', 0, s * 0.06, { size: s * 0.29, w: 800, color: C.ink });
    ctx.globalCompositeOperation = 'destination-out';
    const rnd = U.mulberry32(Math.round(x * 7 + y));
    for (let i = 0; i < 26; i++) { ctx.beginPath(); ctx.arc((rnd() - 0.5) * s * 1.2, (rnd() - 0.5) * s * 0.46, rnd() * s * 0.01, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  function cancel(ctx, t) {
    const l = local(t, 'cancel');
    paper(ctx); masthead(ctx);
    const cw = P ? 330 : 220, ch = P ? 190 : 290, cut = [1, 3];
    for (let i = 0; i < 5; i++) {
      let x, y;
      if (P) { const row = Math.floor(i / 2); x = i === 4 ? cx : cx + (i % 2 ? -1 : 1) * 175; y = H * 0.43 + row * (ch + 24); }
      else { x = cx + (2 - i) * (cw + 24); y = H * 0.66; }
      const p = k01(l, 0.2 + i * 0.12, 0.45); if (p <= 0) continue;
      ctx.save(); ctx.translate(x, y + (1 - eb(p)) * 60); ctx.rotate((i % 2 ? 1 : -1) * 0.012);
      ctx.shadowColor = 'rgba(60,50,30,0.16)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#FCFBF8'; rr(ctx, cw / 2 - 120, -ch / 2 - 22, 100, 30, 8); ctx.fill();
      rr(ctx, -cw / 2, -ch / 2, cw, ch, 10); ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.fillStyle = C.ink; ctx.fillRect(-cw / 2 + 24, -ch / 2 + 22, cw - 48, 1.2);
      txt(ctx, `مشروع وكيل ${String(i + 1)}`, cw / 2 - 26, -ch / 2 + 54, { size: P ? 30 : 24, w: 800, align: 'right' });
      for (let k = 0; k < (P ? 2 : 5); k++) { ctx.fillStyle = 'rgba(11,15,18,0.12)'; ctx.fillRect(-cw / 2 + 26, -ch / 2 + 95 + k * 36, (cw - 52) * (k % 2 ? 0.7 : 0.92), 9); }
      ctx.restore();
      if (cut.includes(i)) stamp(ctx, x, y + (P ? 45 : 35), P ? 200 : 170, l, 2.3 + cut.indexOf(i) * 0.45);
    }
    const ty = P ? TOP + 240 : H * 0.25;
    if (l > 2.2) txt(ctx, `+${Math.round(S.FACTS.cancel * eo(k01(l, 2.2, 1.4)))}%`, P ? cx : W - 96, ty, { size: P ? 170 : 150, w: 800, rtl: false, align: P ? 'center' : 'right' });
    { const nw = measure(ctx, '+40%', P ? 170 : 150, 800), ux = P ? cx + nw / 2 : W - 96, uy = ty + (P ? 82 : 72); ink(ctx, linePts(ux, uy, ux - nw, uy + 4, 5), eio(k01(l, 2.6, 0.6)), { w: 10 }); }
    footMark(ctx, 4, P ? cx - 200 : W - 96 - 380, ty - 60, l, 3.6, 28);
    if (!P) {
      kline(ctx, 'من مشاريع الوكلاء متوقّع إلغاؤها', W - 96, ty + 115, l, 2.6, { size: 44, w: 800, align: 'right' });
      kline(ctx, 'بنهاية 2027 · ≈ مشروعان من كل خمسة', W - 96, ty + 175, l, 3.0, { size: 34, w: 700, color: C.gr, align: 'right' });
      slip(ctx, 4, 'جارتنر · أكتوبر 2026', SRC2, W * 0.27, ty + 175, l, 3.7);
    } else {
      kline(ctx, 'من مشاريع الوكلاء متوقّع إلغاؤها بنهاية 2027', cx, ty + 120, l, 2.6, { size: 40, w: 800 });
      kline(ctx, '≈ مشروعان من كل خمسة', cx, ty + 178, l, 3.0, { size: 34, w: 700, color: C.gr });
    }
    colophon(ctx, t);
  }

  // 6 · SHIFT — the wrong question is struck through in ink; the right one slams in
  function shift(ctx, t) {
    const l = local(t, 'shift');
    paper(ctx); masthead(ctx);
    const y1 = P ? H * 0.34 : H * 0.33, s1 = P ? 70 : 80;
    txt(ctx, 'كيف نبني الوكيل؟', cx, y1, { size: s1, w: 800, color: l > 1.2 ? 'rgba(11,15,18,0.4)' : C.ink, alpha: k01(l, 0.1, 0.4) });
    const w1 = measure(ctx, 'كيف نبني الوكيل؟', s1, 800);
    ink(ctx, linePts(cx + w1 / 2 + 20, y1 + 6, cx - w1 / 2 - 20, y1 - 4, -8), eio(k01(l, 0.8, 0.5)), { w: 10 });
    const sp = k01(l, 1.5, 0.25);
    if (sp > 0) {
      const k = 1 + 0.5 * (1 - eo(sp)), s2 = P ? 140 : 170;
      ctx.save(); ctx.translate(cx, P ? H * 0.47 : H * 0.54); ctx.scale(k, k);
      txt(ctx, 'مَن المسؤول؟', 0, 0, { size: s2, w: 800, alpha: clamp(sp * 3) }); ctx.restore();
    }
    kline(ctx, 'مَن يمسك الحبل إذا الوكيل غلط؟', cx, P ? H * 0.57 : H * 0.7, l, 2.2, { size: 44, w: 700, color: C.tqD });
    kline(ctx, 'القيمة اليوم في التحكّم والحوكمة، لا في البناء وحده', cx, P ? H * 0.63 : H * 0.78, l, 2.7, { size: P ? 30 : 32, w: 500, color: C.gr });
    colophon(ctx, t);
  }

  // 7 · CHECK — journal sidebar: three questions, ink ticks each
  function check(ctx, t) {
    const l = local(t, 'check');
    paper(ctx); masthead(ctx);
    const m = P ? 60 : 96, bx = P ? m : W * 0.24, bw = P ? W - 2 * m : W * 0.52, by = P ? TOP + 140 : TOP + 125, bh = P ? 780 : 720;
    const a = k01(l, 0, 0.4);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,193,202,0.07)'; ctx.fillRect(bx, by, bw, bh); ctx.fillStyle = C.tq; ctx.fillRect(bx + bw - 10, by, 10, bh); ctx.restore();
    if (P) { kline(ctx, 'قبل أن تُطلق وكيلاً', bx + bw - 50, by + 55, l, 0.2, { size: 42, w: 800, align: 'right' }); kline(ctx, 'في مؤسستك التعليمية', bx + bw - 50, by + 105, l, 0.3, { size: 42, w: 800, align: 'right' }); }
    else kline(ctx, 'قبل أن تُطلق وكيلاً في مؤسستك التعليمية', bx + bw - 50, by + 70, l, 0.2, { size: 44, w: 800, align: 'right' });
    txt(ctx, 'رأي تطبيقي — د. يحيى الأمير', bx + bw - 50, by + (P ? 150 : 125), { size: 24, w: 600, align: 'right', color: C.gr, alpha: k01(l, 0.6, 0.4) });
    ['ما المهمة بالضبط؟', 'مَن يراجع قراراته؟', 'كيف نوقفه إذا أخطأ؟'].forEach((it, i) => {
      const iy = by + (P ? 250 : 250) + i * (P ? 150 : 135), t0 = 1.0 + i * 1.3;
      txt(ctx, String(i + 1), bx + bw - 60, iy, { size: P ? 60 : 56, w: 800, color: C.tq, alpha: k01(l, t0, 0.3) });
      kline(ctx, it, bx + bw - 125, iy, l, t0, { size: P ? 48 : 50, w: 800, align: 'right' });
      const tx = bx + (P ? 80 : 110);
      ctx.save(); ctx.globalAlpha = k01(l, t0, 0.3); ctx.strokeStyle = 'rgba(11,15,18,0.3)'; ctx.lineWidth = 2; ctx.strokeRect(tx - 32, iy - 32, 64, 64); ctx.restore();
      ink(ctx, tickPts(tx, iy, 44), eo(k01(l, t0 + 0.7, 0.35)), { w: 10 });
    });
    kline(ctx, 'الحوكمة قبل التوسّع', bx + bw / 2, by + bh - 60, l, 5.0, { size: 44, w: 800, color: C.tqD });
    colophon(ctx, t);
  }

  // 8 · END — the ink signs the logo; the margin is yours
  function end(ctx, t) {
    const l = local(t, 'end');
    paper(ctx);
    const ly = P ? TOP + 170 : H * 0.25;
    logoMark(ctx, cx, ly, P ? 260 : 230, k01(l, 0, 1.4));
    txt(ctx, 'YAHYA ALAMEER', cx, ly + (P ? 80 : 72), { size: P ? 40 : 36, w: 700, fam: LA, rtl: false, alpha: k01(l, 1.0, 0.5) });
    { const nw = measure(ctx, 'YAHYA ALAMEER', P ? 40 : 36, 700, LA); ink(ctx, linePts(cx + nw / 2, ly + (P ? 140 : 128), cx - nw / 2, ly + (P ? 144 : 132), 5), eio(k01(l, 1.3, 0.6)), { w: 10 }); }
    txt(ctx, 'INSTRUCTIONAL DESIGN', cx, ly + (P ? 118 : 106), { size: P ? 20 : 18, w: 500, fam: LA, rtl: false, color: C.gr, alpha: k01(l, 1.1, 0.5) });
    const qy = P ? H * 0.43 : H * 0.52;
    kline(ctx, 'هل جرّبت وكيلاً في عملك؟', cx, qy, l, 1.2, { size: P ? 56 : 60, w: 800 });
    kline(ctx, 'اكتب حاشيتك في التعليقات', cx, qy + 78, l, 1.5, { size: 40, w: 700, color: C.tqD });
    const cy2 = qy + 150, lw = P ? 600 : 720;
    ctx.fillStyle = C.rule; ctx.fillRect(cx - lw / 2, cy2 + 26, lw, 1.5);
    if (l > 1.8 && Math.floor(l * 2.2) % 2 === 0) { ctx.fillStyle = C.tq; ctx.fillRect(cx + lw / 2 - 10, cy2 - 18, 5, 40); }
    const hy = P ? cy2 + 120 : H * 0.8, items = ['X  @y7yr_', 'TikTok  @i.y7y', 'LinkedIn  in/yahya-alameer', 'linktr.ee/yalameer'];
    items.forEach((v, i) => {
      const x = P ? cx : cx + (1.5 - i) * 400, y = P ? hy + i * 56 : hy;
      txt(ctx, v, x, y, { size: P ? 30 : 27, w: 600, fam: LA, rtl: false, alpha: k01(l, 2.0 + i * 0.12, 0.4) });
    });
    const ry = P ? hy + 4 * 56 : hy + 56;
    ctx.fillStyle = C.ink; ctx.fillRect(P ? 60 : 96, ry, W - (P ? 120 : 192), 1.2);
    txt(ctx, 'المصادر 1 · 2 · 3 · 4 — جارتنر، دورة الضجيج للذكاء الاصطناعي (أكتوبر 2026)', cx, ry + 38, { size: P ? 22 : 22, w: 600, color: C.gr, alpha: k01(l, 2.4, 0.5) });
  }

  // ---------------------------------------------------------------- transitions: page slides in from the left (RTL page turn)
  const SCENES = { hook, title, curve, expect, cancel, shift, check, end };
  const ORDER = Object.keys(S.S);
  const TR = 0.5;
  function draw(ctx, t) {
    let idx = ORDER.findIndex((k) => t >= S.S[k][0] && t < S.S[k][1]); if (idx < 0) idx = ORDER.length - 1;
    const cur = ORDER[idx], start = S.S[cur][0];
    if (idx > 0 && t < start + TR) {
      SCENES[ORDER[idx - 1]](ctx, Math.min(t, start - 1e-3));
      const edge = W * eio((t - start) / TR);
      ctx.save(); ctx.shadowColor = 'rgba(60,50,30,0.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetX = 12;
      ctx.fillStyle = C.paper; ctx.fillRect(0, 0, edge, H); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, edge, H); ctx.clip(); ctx.translate(edge - W, 0); SCENES[cur](ctx, t); ctx.restore();
    } else SCENES[cur](ctx, t);
  }

  Studio.film({
    duration: S.DURATION,
    fadeOut: 0.8,
    post: { vignette: 0.05, grain: 0.01, paper: 0 },
    async init() {
      GRAIN = makeGrain();
      const F = 'assets/fonts/';
      for (const w of [500, 700, 800]) {
        await Studio.loadFont('Tajawal', F + `tajawal-arabic-${w}-normal.woff2`, w);
        await Studio.loadFont('TajawalL', F + `tajawal-latin-${w}-normal.woff2`, w);
      }
      for (const w of [500, 600, 700]) await Studio.loadFont('Poppins', F + `poppins-latin-${w}-normal.woff2`, w);
    },
    draw,
  });
})();
