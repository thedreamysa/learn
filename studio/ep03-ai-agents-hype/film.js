// EPISODE 3 · وكلاء الذكاء الاصطناعي بين الضجيج والواقع
// Look: clean "3D icons + hand" motion graphics in the Yahya Alameer identity.
// Every visual is a pure function of t. Layout adapts: 16:9 (landscape) and 9:16 (re-staged, not cropped).
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { clamp, ease } = U;
  const W = G.W, H = G.H, P = H > W; // P = portrait
  const C = { tq: '#00C1CA', tqD: '#00959C', tqL: '#7FE6EA', bk: '#0B0F12', bg: '#F4F8F9', wh: '#FFFFFF', gr: '#5B6770', red: '#FF5A5F', redD: '#C93E43', amb: '#FFB547' };
  const AR = '"Tajawal", "TajawalL", "Noto Naskh Arabic", sans-serif';
  const LA = '"Poppins", "TajawalL", sans-serif';
  // bottom band kept free for platform buttons in 9:16
  const FREE_BOTTOM = P ? 260 : 0;

  // ---------------------------------------------------------------- helpers
  const k01 = (t, a, d) => clamp((t - a) / d);
  const eo = (x) => ease.outCubic(clamp(x));
  const eb = (x) => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }; // outBack
  const eio = (x) => ease.inOutCubic ? ease.inOutCubic(clamp(x)) : (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const local = (t, sc) => t - S.S[sc][0];
  const float = (t, seed, amp = 8) => Math.sin(t * 1.6 + seed) * amp;

  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

  // text: ar = Arabic RTL, align is visual ('center' | 'right' | 'left')
  function txt(ctx, s, x, y, o = {}) {
    const { size = 48, w = 700, color = C.bk, align = 'center', fam = AR, alpha = 1, rtl = true, base = 'middle', shadow = false } = o;
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.font = `${w} ${size}px ${fam}`;
    ctx.direction = rtl ? 'rtl' : 'ltr';
    ctx.textAlign = align;
    ctx.textBaseline = base;
    if (shadow) { ctx.shadowColor = 'rgba(0,40,45,0.18)'; ctx.shadowBlur = size * 0.25; ctx.shadowOffsetY = size * 0.08; }
    ctx.fillStyle = color;
    ctx.fillText(s, x, y);
    ctx.restore();
  }
  // kinetic line: rises from a mask with a slight overshoot
  function kline(ctx, s, x, y, t, t0, o = {}) {
    const p = k01(t, t0, o.dur || 0.45);
    if (p <= 0) return;
    const size = o.size || 48;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, y - size * 0.95, W, size * 1.9); ctx.clip();
    txt(ctx, s, x, y + (1 - eb(p)) * size * 1.2, o);
    ctx.restore();
  }
  // highlighted word: turquoise marker swipe behind text (RTL: grows right→left)
  function marker(ctx, x, y, w, h, t, t0, color = C.tq) {
    const p = eo(k01(t, t0, 0.35));
    if (p <= 0) return;
    ctx.save(); ctx.fillStyle = color; ctx.globalAlpha = 0.28;
    rr(ctx, x + w * (1 - p), y - h / 2, w * p, h, h * 0.25); ctx.fill(); ctx.restore();
  }

  // ---------------------------------------------------------------- background
  function bg(ctx, t, dark = false) {
    // soft studio backdrop (clay look): light blue-grey, gentle vignette, faint turquoise glow
    const g = ctx.createLinearGradient(0, 0, 0, H);
    if (dark) { g.addColorStop(0, '#12333A'); g.addColorStop(1, '#0B0F12'); }
    else { g.addColorStop(0, '#EEF3F6'); g.addColorStop(1, '#D9E3E8'); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const g1 = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, Math.max(W, H) * 0.7);
    g1.addColorStop(0, dark ? 'rgba(0,193,202,0.20)' : 'rgba(255,255,255,0.75)'); g1.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
    const g2 = ctx.createRadialGradient(W * 0.85, H * 0.12, 0, W * 0.85, H * 0.12, Math.max(W, H) * 0.45);
    g2.addColorStop(0, 'rgba(0,193,202,0.10)'); g2.addColorStop(1, 'rgba(0,193,202,0)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
  }

  // ---------------------------------------------------------------- the logo (vector, from the brand mark)
  // laptop with black bezel, turquoise base, open book on screen. s = width of the laptop.
  function logoMark(ctx, x, y, s, o = {}) {
    const { dark = false, draw = 1 } = o;
    const bez = dark ? C.wh : C.bk;
    const sw = s * 0.78, sh = s * 0.5, lw = s * 0.045;
    ctx.save(); ctx.translate(x, y);
    // screen bezel
    ctx.lineWidth = lw; ctx.strokeStyle = bez; ctx.lineJoin = 'round';
    rr(ctx, -sw / 2, -sh, sw, sh, s * 0.03);
    if (draw < 1) { ctx.setLineDash([sw * 3 * draw, sw * 4]); }
    ctx.stroke(); ctx.setLineDash([]);
    // base
    const bp = clamp(draw * 1.4 - 0.2);
    if (bp > 0) {
      ctx.fillStyle = C.tq;
      ctx.beginPath();
      ctx.moveTo(-s / 2 * bp, -s * 0.02); ctx.lineTo(s / 2 * bp, -s * 0.02);
      ctx.quadraticCurveTo(s / 2 * bp, s * 0.07, s * 0.44 * bp, s * 0.07); ctx.lineTo(-s * 0.44 * bp, s * 0.07);
      ctx.quadraticCurveTo(-s / 2 * bp, s * 0.07, -s / 2 * bp, -s * 0.02); ctx.closePath(); ctx.fill();
    }
    // open book
    const bk = eb(clamp(draw * 1.6 - 0.6));
    if (bk > 0) {
      ctx.save(); ctx.translate(0, -sh * 0.5); ctx.scale(bk, bk);
      const bw = sw * 0.22, bh = sh * 0.62;
      ctx.fillStyle = bez; // back shadow pages
      ctx.fillRect(-bw - s * 0.012, -bh / 2 + s * 0.02, s * 0.012, bh); ctx.fillRect(bw, -bh / 2 + s * 0.02, s * 0.012, bh);
      ctx.fillRect(-bw, bh / 2 - s * 0.006, bw * 2, s * 0.018);
      ctx.fillStyle = C.tq;
      ctx.beginPath(); ctx.moveTo(-s * 0.006, -bh / 2 + s * 0.02); ctx.quadraticCurveTo(-bw * 0.5, -bh / 2 - s * 0.01, -bw, -bh / 2 + s * 0.005); ctx.lineTo(-bw, bh / 2 - s * 0.01); ctx.quadraticCurveTo(-bw * 0.5, bh / 2 - s * 0.03, -s * 0.006, bh / 2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s * 0.006, -bh / 2 + s * 0.02); ctx.quadraticCurveTo(bw * 0.5, -bh / 2 - s * 0.01, bw, -bh / 2 + s * 0.005); ctx.lineTo(bw, bh / 2 - s * 0.01); ctx.quadraticCurveTo(bw * 0.5, bh / 2 - s * 0.03, s * 0.006, bh / 2); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  function logoFull(ctx, x, y, s, o = {}) {
    const { dark = false, alpha = 1, draw = 1 } = o;
    ctx.save(); ctx.globalAlpha *= alpha;
    logoMark(ctx, x, y, s, { dark, draw });
    const ta = clamp(draw * 2 - 1);
    txt(ctx, 'YAHYA ALAMEER', x, y + s * 0.28, { size: s * 0.155, w: 700, fam: LA, rtl: false, color: dark ? C.wh : C.bk, alpha: ta });
    txt(ctx, 'INSTRUCTIONAL DESIGN', x, y + s * 0.44, { size: s * 0.072, w: 500, fam: LA, rtl: false, color: dark ? '#C9D3D8' : C.bk, alpha: ta });
    ctx.restore();
  }

  // ---------------------------------------------------------------- 3D icons
  // an extruded, glossy rounded tile with a white glyph. pop = 0..1 entrance.
  function icon3d(ctx, kind, x, y, s, o = {}) {
    // clay pillow button: white base slab + domed coloured cap that sinks when pressed
    const { pop = 1, tilt = 0, color = C.tq, dark = C.tqD, glyph = C.wh, press = 0 } = o;
    if (pop <= 0) return;
    const sc = eb(pop);
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(sc, sc);
    const r = s * 0.26, bw = s * 1.08, bh = s * 1.08, by = s * 0.08;
    // contact shadow
    ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#3A5560'; ctx.filter = `blur(${Math.max(3, s * 0.07)}px)`;
    ctx.beginPath(); ctx.ellipse(s * 0.04, s * 0.66, s * 0.56, s * 0.1, 0, 0, 7); ctx.fill(); ctx.restore();
    // white base: side then top
    ctx.fillStyle = '#C9D4DA'; rr(ctx, -bw / 2, -bh / 2 + by + s * 0.1, bw, bh, r * 1.1); ctx.fill();
    const gb = ctx.createLinearGradient(0, -bh / 2, 0, bh / 2);
    gb.addColorStop(0, '#FFFFFF'); gb.addColorStop(1, '#E7EEF1');
    ctx.fillStyle = gb; rr(ctx, -bw / 2, -bh / 2 + by, bw, bh, r * 1.1); ctx.fill();
    // cap: side (extrusion) shrinks when pressed
    const ext = s * 0.13 * (1 - press * 0.75), cs = s * 0.86, cy0 = -cs / 2 + by - ext + s * 0.02;
    ctx.fillStyle = dark; rr(ctx, -cs / 2, cy0 + ext, cs, cs, r); ctx.fill();
    // cap top with soft dome shading
    const gc = ctx.createRadialGradient(-cs * 0.2, cy0 + cs * 0.15, cs * 0.05, 0, cy0 + cs * 0.55, cs * 0.85);
    gc.addColorStop(0, shade(color, 0.45)); gc.addColorStop(0.55, color); gc.addColorStop(1, dark);
    ctx.fillStyle = gc; rr(ctx, -cs / 2, cy0, cs, cs, r); ctx.fill();
    // specular sheen
    ctx.save(); rr(ctx, -cs / 2, cy0, cs, cs, r); ctx.clip();
    const sh = ctx.createLinearGradient(0, cy0, 0, cy0 + cs * 0.45);
    sh.addColorStop(0, 'rgba(255,255,255,0.55)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sh; rr(ctx, -cs * 0.42, cy0 + cs * 0.05, cs * 0.84, cs * 0.34, r * 0.8); ctx.fill();
    ctx.restore();
    // embossed glyph
    ctx.save(); ctx.translate(0, cy0 + cs / 2);
    ctx.shadowColor = 'rgba(0,50,55,0.35)'; ctx.shadowBlur = s * 0.03; ctx.shadowOffsetY = s * 0.025;
    drawGlyph(ctx, kind, cs * 0.62, glyph, o);
    ctx.restore();
    ctx.restore();
  }
  function clayButton(ctx, label, x, y, w, h, o = {}) {
    const { pop = 1, press = 0, color = C.tq, dark = C.tqD } = o;
    if (pop <= 0) return;
    const sc = eb(pop);
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    const r = h * 0.38, pad = h * 0.14, ext = h * 0.16 * (1 - press * 0.75);
    ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#3A5560'; ctx.filter = 'blur(10px)';
    ctx.beginPath(); ctx.ellipse(0, h * 0.75, w * 0.55, h * 0.16, 0, 0, 7); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#C9D4DA'; rr(ctx, -w / 2 - pad, -h / 2 - pad + h * 0.12, w + 2 * pad, h + 2 * pad, r + pad); ctx.fill();
    const gb = ctx.createLinearGradient(0, -h, 0, h); gb.addColorStop(0, '#FFFFFF'); gb.addColorStop(1, '#E7EEF1');
    ctx.fillStyle = gb; rr(ctx, -w / 2 - pad, -h / 2 - pad, w + 2 * pad, h + 2 * pad, r + pad); ctx.fill();
    ctx.fillStyle = dark; rr(ctx, -w / 2, -h / 2, w, h, r); ctx.fill();
    const top = -h / 2 - ext;
    const gc = ctx.createLinearGradient(0, top, 0, top + h); gc.addColorStop(0, shade(color, 0.4)); gc.addColorStop(1, color);
    ctx.fillStyle = gc; rr(ctx, -w / 2, top, w, h, r); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; rr(ctx, -w * 0.42, top + h * 0.08, w * 0.84, h * 0.28, h * 0.14); ctx.fill();
    ctx.save(); ctx.shadowColor = 'rgba(0,50,55,0.35)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 3;
    txt(ctx, label, 0, top + h / 2 + 3, { size: h * 0.46, w: 800, color: C.wh }); ctx.restore();
    ctx.restore();
  }
  function shade(hex, amt) { // lighten (amt>0) toward white
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(r + (255 - r) * amt); g = Math.round(g + (255 - g) * amt); b = Math.round(b + (255 - b) * amt);
    return `rgb(${r},${g},${b})`;
  }
  function drawGlyph(ctx, kind, s, col, o) {
    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = s * 0.1;
    const h = s / 2;
    switch (kind) {
      case 'agent': { // robot head
        rr(ctx, -h * 0.85, -h * 0.55, h * 1.7, h * 1.3, h * 0.35); ctx.fill();
        ctx.fillRect(-h * 0.06, -h * 0.95, h * 0.12, h * 0.4); ctx.beginPath(); ctx.arc(0, -h * 0.98, h * 0.15, 0, 7); ctx.fill();
        ctx.fillStyle = o.color || C.tq; ctx.beginPath(); ctx.arc(-h * 0.36, h * 0.05, h * 0.17, 0, 7); ctx.arc(h * 0.36, h * 0.05, h * 0.17, 0, 7); ctx.fill();
        rr(ctx, -h * 0.3, h * 0.38, h * 0.6, h * 0.1, h * 0.05); ctx.fill();
        ctx.fillStyle = col; ctx.fillRect(-h * 1.05, -h * 0.15, h * 0.2, h * 0.5); ctx.fillRect(h * 0.85, -h * 0.15, h * 0.2, h * 0.5);
        break;
      }
      case 'chart': {
        ctx.beginPath(); ctx.moveTo(-h, h * 0.9); ctx.lineTo(h, h * 0.9); ctx.stroke();
        [[-0.7, 0.5], [-0.2, 0.9], [0.3, 1.3], [0.78, 1.7]].forEach(([bx, bh]) => { rr(ctx, h * bx - h * 0.17, h * 0.75 - h * bh, h * 0.34, h * bh, h * 0.08); ctx.fill(); });
        break;
      }
      case 'x': { ctx.lineWidth = s * 0.16; ctx.beginPath(); ctx.moveTo(-h * 0.6, -h * 0.6); ctx.lineTo(h * 0.6, h * 0.6); ctx.moveTo(h * 0.6, -h * 0.6); ctx.lineTo(-h * 0.6, h * 0.6); ctx.stroke(); break; }
      case 'check': { ctx.lineWidth = s * 0.16; ctx.beginPath(); ctx.moveTo(-h * 0.7, 0); ctx.lineTo(-h * 0.2, h * 0.5); ctx.lineTo(h * 0.75, -h * 0.55); ctx.stroke(); break; }
      case 'shield': {
        ctx.beginPath(); ctx.moveTo(0, -h); ctx.quadraticCurveTo(h * 0.5, -h * 0.7, h * 0.9, -h * 0.7); ctx.quadraticCurveTo(h * 0.95, h * 0.5, 0, h); ctx.quadraticCurveTo(-h * 0.95, h * 0.5, -h * 0.9, -h * 0.7); ctx.quadraticCurveTo(-h * 0.5, -h * 0.7, 0, -h); ctx.fill();
        ctx.strokeStyle = o.color || C.tq; ctx.lineWidth = s * 0.11; ctx.beginPath(); ctx.moveTo(-h * 0.38, 0); ctx.lineTo(-h * 0.08, h * 0.3); ctx.lineTo(h * 0.42, -h * 0.3); ctx.stroke();
        break;
      }
      case 'building': {
        ctx.fillRect(-h * 0.75, -h * 0.6, h * 1.5, h * 1.5); ctx.beginPath(); ctx.moveTo(-h * 0.95, -h * 0.55); ctx.lineTo(0, -h * 1.05); ctx.lineTo(h * 0.95, -h * 0.55); ctx.closePath(); ctx.fill();
        ctx.fillStyle = o.color || C.tq; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) ctx.fillRect(-h * 0.5 + i * h * 0.38, -h * 0.3 + j * h * 0.5, h * 0.22, h * 0.3);
        break;
      }
      case 'scale': { // balance = accountability
        ctx.fillRect(-h * 0.06, -h * 0.8, h * 0.12, h * 1.6); ctx.fillRect(-h * 0.5, h * 0.75, h, h * 0.15);
        ctx.beginPath(); ctx.moveTo(-h * 0.9, -h * 0.55); ctx.lineTo(h * 0.9, -h * 0.55); ctx.stroke();
        ctx.beginPath(); ctx.arc(-h * 0.7, -h * 0.05, h * 0.32, 0, Math.PI); ctx.fill(); ctx.beginPath(); ctx.arc(h * 0.7, -h * 0.05, h * 0.32, 0, Math.PI); ctx.fill();
        ctx.lineWidth = s * 0.04; ctx.beginPath(); ctx.moveTo(-h * 0.7, -h * 0.55); ctx.lineTo(-h * 0.98, -h * 0.05); ctx.moveTo(-h * 0.7, -h * 0.55); ctx.lineTo(-h * 0.42, -h * 0.05); ctx.moveTo(h * 0.7, -h * 0.55); ctx.lineTo(h * 0.42, -h * 0.05); ctx.moveTo(h * 0.7, -h * 0.55); ctx.lineTo(h * 0.98, -h * 0.05); ctx.stroke();
        break;
      }
      case 'rocket': {
        ctx.beginPath(); ctx.moveTo(0, -h); ctx.quadraticCurveTo(h * 0.55, -h * 0.4, h * 0.35, h * 0.45); ctx.lineTo(-h * 0.35, h * 0.45); ctx.quadraticCurveTo(-h * 0.55, -h * 0.4, 0, -h); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-h * 0.35, h * 0.1); ctx.lineTo(-h * 0.7, h * 0.6); ctx.lineTo(-h * 0.3, h * 0.45); ctx.fill(); ctx.beginPath(); ctx.moveTo(h * 0.35, h * 0.1); ctx.lineTo(h * 0.7, h * 0.6); ctx.lineTo(h * 0.3, h * 0.45); ctx.fill();
        ctx.fillStyle = o.color || C.tq; ctx.beginPath(); ctx.arc(0, -h * 0.3, h * 0.17, 0, 7); ctx.fill();
        ctx.fillStyle = C.amb; ctx.beginPath(); ctx.moveTo(-h * 0.2, h * 0.5); ctx.quadraticCurveTo(0, h * 1.1, h * 0.2, h * 0.5); ctx.fill();
        break;
      }
      case 'calendar': {
        rr(ctx, -h * 0.85, -h * 0.65, h * 1.7, h * 1.5, h * 0.2); ctx.fill();
        ctx.fillStyle = o.color || C.tq; ctx.fillRect(-h * 0.85, -h * 0.25, h * 1.7, h * 0.08);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { ctx.beginPath(); ctx.arc(-h * 0.5 + i * h * 0.33, h * 0.12 + j * h * 0.35, h * 0.08, 0, 7); ctx.fill(); }
        ctx.fillStyle = col; ctx.fillRect(-h * 0.5, -h * 0.9, h * 0.13, h * 0.4); ctx.fillRect(h * 0.37, -h * 0.9, h * 0.13, h * 0.4);
        break;
      }
    }
  }
  // glossy 3D sphere (decor)
  function orb(ctx, x, y, r, color = C.tq, a = 1) {
    ctx.save(); ctx.globalAlpha *= a;
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
    g.addColorStop(0, shade(color, 0.7)); g.addColorStop(0.55, color); g.addColorStop(1, shade('#004E52', 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore();
  }

  // ---------------------------------------------------------------- the hand
  // soft clay 3D hand (no outlines). Index finger along -y; (x,y) = fingertip.
  const SKIN = { hi: '#FFE6D8', mid: '#F6C3A6', lo: '#DE9A79', ao: 'rgba(150,80,50,0.35)' };
  // 3D-rendered hand (Canva render, background keyed). (x,y) = fingertip; ang as before
  // (finger along -y rotated by ang), so the finger points along dir = ang - 90°.
  const HAND = { point: { img: null, tipX: 1837, tipY: 49, a0: -0.5, k: 3.6 }, press: { img: null, tipX: 1407, tipY: 1787, a0: 1.42, k: 2.9 } };
  function hand(ctx, x, y, s, o = {}) {
    const { ang = 0, press = 0, alpha = 1 } = o;
    const dir0 = ang - Math.PI / 2, P0 = Math.sin(dir0) > 0.75 && HAND.press.img ? HAND.press : HAND.point;
    const im = P0.img; if (!im || alpha <= 0) return;
    const dir = dir0, k = (s * P0.k) / im.width, w = im.width * k, h = im.height * k;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.translate(x + Math.cos(dir) * press * 14, y + Math.sin(dir) * press * 14);
    const mirror = Math.cos(dir) < 0;
    if (mirror) { ctx.rotate(dir - (Math.PI - P0.a0)); ctx.scale(-1, 1); } else ctx.rotate(dir - P0.a0);
    const ox = -P0.tipX * k, oy = -P0.tipY * k, L = 4000;
    ctx.shadowColor = 'rgba(30,60,70,0.28)'; ctx.shadowBlur = s * 0.28; ctx.shadowOffsetY = s * 0.16;
    ctx.drawImage(im, 0, 0, 40, im.height, ox - L, oy, L + 4, h); // sleeve continues off-frame
    ctx.drawImage(im, ox, oy, w, h);
    ctx.restore();
  }
  // a tap ripple at (x,y) started at t0
  function ripple(ctx, x, y, t, t0, r = 60) {
    const p = k01(t, t0, 0.6); if (p <= 0.04 || p >= 1) return;
    ctx.save(); ctx.strokeStyle = C.tq; ctx.globalAlpha = 1 - p; ctx.lineWidth = 6 * (1 - p) + 1;
    ctx.beginPath(); ctx.arc(x, y, r * eo(p), 0, 7); ctx.stroke();
    ctx.globalAlpha = (1 - p) * 0.5; ctx.beginPath(); ctx.arc(x, y, r * 0.55 * eo(p), 0, 7); ctx.stroke(); ctx.restore();
  }
  // hand path helper: moves along keyframes [[t, x, y, ang, press]]
  function handAt(keys, t) {
    if (t <= keys[0][0]) return keys[0];
    for (let i = 1; i < keys.length; i++) {
      const a = keys[i - 1], b = keys[i];
      if (t <= b[0]) { const p = eio((t - a[0]) / (b[0] - a[0])); return a.map((v, j) => (j === 0 ? t : v + (b[j] - v) * p)); }
    }
    return keys[keys.length - 1];
  }

  // ---------------------------------------------------------------- persistent chrome
  function chrome(ctx, t, o = {}) {
    const dark = !!o.dark;
    // top: logo mark + series tag (right side in RTL), source badge (left)
    const m = P ? 60 : 56, top = P ? 230 : 52;
    logoMark(ctx, W - m - 46, top + 28, 92, { dark });
    txt(ctx, 'تقرير في دقائق · 3', W - m - 110, top + 6, { size: P ? 30 : 26, w: 800, align: 'right', color: dark ? C.wh : C.bk });
    txt(ctx, 'تقنيات التعليم والذكاء الاصطناعي', W - m - 110, top + 40, { size: P ? 22 : 19, w: 500, align: 'right', color: dark ? '#9FB0B8' : C.gr });
    // source pill
    const sp = 'المصدر: ' + S.SOURCE.ar;
    ctx.save(); ctx.font = `700 ${P ? 24 : 22}px ${AR}`; const sw = ctx.measureText(sp).width + 64; ctx.restore();
    const sx = P ? (W - sw) / 2 : m, sy = P ? top + 80 : top - 4;
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.08)' : C.wh; rr(ctx, sx, sy, sw, 46, 23); ctx.fill();
    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.15)' : 'rgba(11,15,18,0.08)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.tq; ctx.beginPath(); ctx.arc(sx + sw - 24, sy + 23, 7, 0, 7); ctx.fill();
    txt(ctx, sp, sx + sw - 42, sy + 24, { size: P ? 24 : 22, w: 700, align: 'right', color: dark ? '#DDE6EA' : C.bk });
    // bottom name bar
    const bh = P ? 84 : 72, by = H - FREE_BOTTOM - bh - (P ? 40 : 34), bw = P ? W - 120 : 760, bx = P ? 60 : W - m - bw;
    ctx.save(); ctx.shadowColor = 'rgba(0,40,45,0.18)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    ctx.fillStyle = C.bk; rr(ctx, bx, by, bw, bh, bh / 2); ctx.fill(); ctx.restore();
    ctx.fillStyle = C.tq; rr(ctx, bx + bw - 250, by, 250, bh, bh / 2); ctx.fill();
    txt(ctx, 'د. يحيى الأمير', bx + bw - 125, by + bh / 2 + 2, { size: P ? 34 : 30, w: 800, color: C.bk });
    // rotating handle (changes every 3.5 s with a vertical roll)
    const per = 3.5, i = Math.floor(t / per) % S.HANDLES.length, ph = (t % per) / per;
    const roll = ph < 0.08 ? 1 - eo(ph / 0.08) : 0;
    ctx.save(); rr(ctx, bx + 24, by, bw - 290, bh, bh / 2); ctx.clip();
    txt(ctx, S.HANDLES[i], bx + 24 + (bw - 290) / 2, by + bh / 2 + 2 + roll * bh, { size: P ? 28 : 26, w: 600, fam: LA, rtl: false, color: C.wh });
    ctx.restore();
  }

  // ---------------------------------------------------------------- scenes
  const cx = W / 2;

  // 1 · HOOK — the big number, the agent icon pops, the hand taps it
  function hook(ctx, t) {
    const l = t;
    bg(ctx, t);
    const cy = P ? H * 0.47 : H * 0.47;
    // floating decor
    // agent icon on the side (top in portrait)
    const ix = P ? cx : W * 0.72, iy = P ? cy - 330 : cy - 10, is = P ? 230 : 300;
    icon3d(ctx, 'agent', ix, iy + float(t, 0, 6), is, { pop: k01(l, 0.15, 0.55), tilt: -0.06 });
    // counter 0 → N
    const N = S.FACTS.deployed, cp = eo(k01(l, 0.6, 1.3)), v = Math.round(N * cp);
    const nx = P ? cx : W * 0.36, ny = P ? cy + 30 : cy - 60;
    if (l > 0.5) {
      const pulse = 1 + 0.06 * Math.max(0, 1 - Math.abs(l - 1.9) / 0.15);
      ctx.save(); ctx.translate(nx, ny); ctx.scale(pulse, pulse);
      txt(ctx, `${v}%`, 0, 0, { size: P ? 300 : 280, w: 800, fam: LA, rtl: false, color: C.bk, shadow: true });
      ctx.restore();
    }
    kline(ctx, 'فقط من المؤسسات', nx, ny + (P ? 190 : 175), l, 1.6, { size: P ? 64 : 58, w: 800 });
    kline(ctx, 'نشرت وكلاء ذكاء اصطناعي فعلاً', nx, ny + (P ? 275 : 255), l, 1.85, { size: P ? 50 : 46, w: 500, color: C.gr });
    marker(ctx, nx - (P ? 230 : 210), ny + (P ? 190 : 175), P ? 460 : 420, P ? 62 : 56, l, 2.2);
    // the hand comes in and taps the number
    const tx0 = nx + (P ? 200 : 210), ty0 = ny - (P ? 70 : 60);
    const hk = handAt([[0.6, W + 300, -400, -2.4, 0], [1.7, tx0, ty0, -2.4, 0], [1.85, tx0 - 8, ty0 + 8, -2.4, 1], [2.05, tx0, ty0, -2.4, 0], [2.5, tx0 + 10, ty0 - 10, -2.4, 0], [3.3, W + 300, -400, -2.4, 0]], l);
    ripple(ctx, tx0, ty0, l, 1.85, 90);
    hand(ctx, hk[1], hk[2], P ? 170 : 160, { ang: hk[3], press: hk[4] });
    chrome(ctx, t);
  }

  // 2 · TITLE — the logo builds, the episode title types in, icons orbit
  function title(ctx, t) {
    const l = local(t, 'title');
    bg(ctx, t);
    const cy = P ? H * 0.38 : H * 0.36;
    logoFull(ctx, cx, cy, P ? 320 : 300, { draw: k01(l, 0, 1.2) });
    // orbiting icons
    const kinds = ['agent', 'chart', 'rocket', 'shield'];
    const spots = P ? [[-340, -170], [340, -150], [-330, 130], [340, 150]] : [[-470, -150], [470, -130], [-520, 110], [520, 120]];
    kinds.forEach((kd, i) => {
      const [dx, dy] = spots[i];
      icon3d(ctx, kd, cx + dx, cy - 40 + dy + float(t, i * 1.7, 10), (P ? 110 : 120) * (i % 2 ? 0.85 : 1), { pop: k01(l, 0.6 + i * 0.12, 0.5), tilt: (i % 2 ? 0.08 : -0.08) });
    });
    const ty = P ? H * 0.6 : H * 0.7;
    kline(ctx, 'وكلاء الذكاء الاصطناعي', cx, ty, l, 1.2, { size: P ? 92 : 96, w: 800, color: C.bk });
    kline(ctx, 'بين الضجيج والواقع', cx, ty + (P ? 120 : 115), l, 1.5, { size: P ? 80 : 80, w: 800, color: C.tq });
    kline(ctx, 'AI Agents: Hype vs. Reality', cx, ty + (P ? 210 : 195), l, 1.8, { size: P ? 36 : 34, w: 500, fam: LA, rtl: false, color: C.gr });
    chrome(ctx, t);
  }

  // 3 · CURVE — the hype curve draws itself; a glowing dot rides it; the hand points at the phases
  function curve(ctx, t) {
    const l = local(t, 'curve');
    bg(ctx, t);
    const x0 = P ? 90 : 230, x1 = P ? W - 90 : W - 230, yb = P ? H * 0.72 : H * 0.78, hgt = P ? 720 : 470;
    // generic hype-cycle shape (normalised)
    const f = (u) => { // u 0..1 → height 0..1
      const peak = Math.exp(-Math.pow((u - 0.22) / 0.085, 2));
      const slope = clamp((u - 0.42) / 0.58);
      return 0.92 * peak + 0.06 + 0.48 * (1 - Math.pow(1 - slope, 2.2)) * (u > 0.42 ? 1 : 0);
    };
    const pt = (u) => [x1 - (x1 - x0) * u, yb - f(u) * hgt]; // RTL: time flows right → left
    // axes
    ctx.strokeStyle = 'rgba(11,15,18,0.18)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x1, yb - hgt - 30); ctx.lineTo(x1, yb); ctx.lineTo(x0 - 10, yb); ctx.stroke();
    txt(ctx, 'التوقعات', x1 + (P ? -10 : 30), yb - hgt - 50, { size: 28, w: 700, color: C.gr, align: P ? 'right' : 'center' });
    txt(ctx, 'الزمن', x0 + 20, yb + 36, { size: 28, w: 700, color: C.gr, align: 'left' });
    // the curve draws
    const dp = eio(k01(l, 0.3, 2.2));
    if (dp > 0) {
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const N = 160, path = () => { ctx.beginPath(); for (let i = 0; i <= N * dp; i++) { const [x, y] = pt(i / N); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } };
      ctx.strokeStyle = 'rgba(0,193,202,0.22)'; ctx.lineWidth = 26; path(); ctx.stroke();
      ctx.strokeStyle = C.tq; ctx.lineWidth = 10; path(); ctx.stroke();
      // area fill under the drawn part
      ctx.globalAlpha = 0.08; ctx.fillStyle = C.tq; path(); const [ex] = pt(dp); ctx.lineTo(ex, yb); ctx.lineTo(x1, yb); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    // phase labels (generic Hype Cycle phases)
    const phases = [
      { u: 0.22, ar: 'قمة التوقعات المتضخمة', t0: 3.0, dy: -1 },
      { u: 0.44, ar: 'قاع خيبة الأمل', t0: 4.6, dy: -1 },
      { u: 0.86, ar: 'هضبة الإنتاجية', t0: 6.2, dy: -1 },
    ];
    phases.forEach((ph) => {
      const [x, y] = pt(ph.u), a = eo(k01(l, ph.t0, 0.4));
      if (a <= 0) return;
      const ly = y + ph.dy * (P ? 120 : 100);
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.bk; ctx.lineWidth = 2.5; ctx.setLineDash([6, 8]);
      ctx.beginPath(); ctx.moveTo(x, y + ph.dy * 16); ctx.lineTo(x, ly - ph.dy * 30); ctx.stroke(); ctx.restore();
      const fs = P ? 36 : 34;
      ctx.save(); ctx.font = `800 ${fs}px ${AR}`; const tw = ctx.measureText(ph.ar).width; ctx.restore();
      ctx.save(); ctx.globalAlpha = a; ctx.translate(x, ly); ctx.scale(eb(a) , eb(a));
      ctx.fillStyle = C.bk; rr(ctx, -tw / 2 - 26, -32, tw + 52, 64, 32); ctx.fill();
      txt(ctx, ph.ar, 0, 2, { size: fs, w: 800, color: C.wh });
      ctx.restore();
    });
    // the riding dot ("الوكلاء"): rides to the peak, then slides toward the trough
    const ru = l < 2.5 ? 0 : l < 4.4 ? 0.22 * eio((l - 2.5) / 1.9) : 0.22 + 0.2 * eio((l - 4.4) / 2.2);
    if (l > 2.4) {
      const [dx, dy] = pt(ru);
      const g = ctx.createRadialGradient(dx, dy, 0, dx, dy, 70); g.addColorStop(0, 'rgba(0,193,202,0.45)'); g.addColorStop(1, 'rgba(0,193,202,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(dx, dy, 70, 0, 7); ctx.fill();
      icon3d(ctx, 'agent', dx, dy - 4, P ? 86 : 80, { pop: k01(l, 2.4, 0.4) });
    }
    // headline
    const hy = P ? H * 0.235 : 190;
    kline(ctx, 'أين تقف الوكلاء على منحنى الضجيج؟', P ? cx : W - 230, hy, l, 0.1, { size: P ? 54 : 56, w: 800, align: P ? 'center' : 'right' });
    // the hand points at the active phase
        const at = (u, dx = 30, dy = 44) => { const [x, y] = pt(u); return [x + dx, y + dy]; };
    const A = at(0.22), B = at(0.44), Cc = at(0.86);
    const hk = handAt([[2.6, W + 220, H + 260, -0.55, 0], [3.4, A[0], A[1], -0.45, 0], [4.4, A[0], A[1], -0.45, 0], [5.0, B[0], B[1], -0.45, 0], [6.2, B[0], B[1], -0.45, 0], [6.9, Cc[0], Cc[1], -0.45, 0], [8.0, Cc[0], Cc[1], -0.45, 0], [9.0, W + 220, H + 260, -0.55, 0]], l);
    hand(ctx, hk[1], hk[2], P ? 105 : 100, { ang: hk[3] });
    chrome(ctx, t);
  }

  // 4 · CANCEL — a grid of project cards; 4 in 10 flip to "cancelled" by 2027
  function cancel(ctx, t) {
    const l = local(t, 'cancel');
    bg(ctx, t);
    const cols = 5, rows = P ? 4 : 2, n = cols * rows;
    const cw = P ? 168 : 200, ch = P ? 130 : 165, gx = P ? 22 : 32, gy = P ? 24 : 36;
    const gw = cols * cw + (cols - 1) * gx, gh = rows * ch + (rows - 1) * gy;
    const ox = P ? (W - gw) / 2 : 70, oy = P ? 900 : (H - gh) / 2 + 40;
    const cut = Math.round(n * S.FACTS.cancel / 100);
    // deterministic choice of which cards get cancelled
    const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => U.hash(a, 7) - U.hash(b, 7));
    const isCut = new Set(order.slice(0, cut));
    let ci = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c, x = ox + gw - (c + 1) * cw - c * gx, y = oy + r * (ch + gy); // RTL order
      const pop = k01(l, 0.2 + i * 0.05, 0.4);
      if (pop <= 0) continue;
      const cutIdx = isCut.has(i) ? ci++ : -1;
      const flip = cutIdx >= 0 ? k01(l, 2.4 + cutIdx * 0.18, 0.35) : 0;
      ctx.save(); ctx.translate(x + cw / 2, y + ch / 2 + (1 - eb(pop)) * 30); ctx.globalAlpha = clamp(pop * 2);
      const sx = Math.abs(Math.cos(flip * Math.PI)); ctx.scale(Math.max(0.02, sx), 1);
      const back = flip > 0.5;
      ctx.save(); ctx.shadowColor = 'rgba(0,40,45,0.14)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
      ctx.fillStyle = back ? '#FFECEC' : C.wh; rr(ctx, -cw / 2, -ch / 2, cw, ch, 22); ctx.fill(); ctx.restore();
      ctx.strokeStyle = back ? C.red : 'rgba(11,15,18,0.08)'; ctx.lineWidth = 3; rr(ctx, -cw / 2, -ch / 2, cw, ch, 22); ctx.stroke();
      icon3d(ctx, back ? 'x' : 'agent', 0, -ch * 0.08, ch * 0.48, back ? { color: C.red, dark: C.redD } : {});
      ctx.fillStyle = back ? 'rgba(255,90,95,0.35)' : 'rgba(11,15,18,0.12)';
      rr(ctx, -cw * 0.3, ch * 0.3, cw * 0.6, 10, 5); ctx.fill();
      ctx.restore();
    }
    // the statement
    const tx = P ? cx : W * 0.835, ty = P ? 520 : H * 0.36;
    if (l > 2.2) {
      const N = S.FACTS.cancel, v = Math.round(N * eo(k01(l, 2.3, 1.6)));
      txt(ctx, `+${v}%`, tx, ty, { size: P ? 190 : 170, w: 800, fam: LA, rtl: false, color: C.red, shadow: true });
    }
    kline(ctx, 'من مشاريع الوكلاء', tx, ty + (P ? 130 : 145), l, 3.0, { size: P ? 54 : 52, w: 800 });
    kline(ctx, 'متوقع إلغاؤها', tx, ty + (P ? 205 : 215), l, 3.3, { size: P ? 54 : 52, w: 800, color: C.red });
    // calendar badge "by end of 2027"
    const bx = tx, by = ty + (P ? 290 : 320);
    icon3d(ctx, 'calendar', bx + (P ? 150 : 140), by, P ? 80 : 84, { pop: k01(l, 3.7, 0.4), color: C.bk, dark: '#000', glyph: C.wh });
    kline(ctx, 'بنهاية 2027', bx - (P ? 40 : 30), by, l, 3.8, { size: P ? 46 : 44, w: 700, color: C.gr });
    chrome(ctx, t);
  }

  // 5 · SHIFT — the question moves from "build" to "accountability"
  function shift(ctx, t) {
    const l = local(t, 'shift');
    bg(ctx, t);
    const cy = P ? H * 0.47 : H * 0.5;
    const sep = P ? 0 : 380, vy = P ? 330 : 0;
    // left (old question) → fades and slides away; right (new) → grows
    const swap = eio(k01(l, 1.8, 0.8));
    const ax = P ? cx : cx + sep, ay = P ? cy - vy : cy;
    const bxx = P ? cx : cx - sep, byy = P ? cy + vy * 0.35 : cy;
    icon3d(ctx, 'rocket', ax, ay - 40, (P ? 190 : 210) * (1 - swap * 0.35), { pop: k01(l, 0.2, 0.5) });
    txt(ctx, 'كيف نبني الوكيل؟', ax, ay + (P ? 110 : 140), { size: P ? 50 : 52, w: 800, color: swap > 0.1 ? '#8A979E' : C.bk, alpha: clamp(k01(l, 0.4, 0.4)) });
    if (swap > 0) { // strike-through
      ctx.save(); ctx.font = `800 ${P ? 50 : 52}px ${AR}`; const tw = ctx.measureText('كيف نبني الوكيل؟').width; ctx.restore();
      ctx.strokeStyle = 'rgba(255,90,95,0.8)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ax + tw / 2, ay + (P ? 112 : 142)); ctx.lineTo(ax + tw / 2 - tw * swap, ay + (P ? 112 : 142)); ctx.stroke();
    }
    // arrow
    const ap = eo(k01(l, 1.4, 0.5));
    if (ap > 0) {
      ctx.save(); ctx.strokeStyle = C.tq; ctx.fillStyle = C.tq; ctx.lineWidth = 10; ctx.lineCap = 'round';
      if (P) { const y0 = ay + 165, y1 = y0 + 95 * ap; ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(cx, y1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - 24, y1 - 10); ctx.lineTo(cx, y1 + 22); ctx.lineTo(cx + 24, y1 - 10); ctx.fill(); }
      else { const x0 = cx + 150, x1 = x0 - 300 * ap; ctx.beginPath(); ctx.moveTo(x0, cy - 40); ctx.lineTo(x1, cy - 40); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x1 + 10, cy - 64); ctx.lineTo(x1 - 22, cy - 40); ctx.lineTo(x1 + 10, cy - 16); ctx.fill(); }
      ctx.restore();
    }
    const sd = P ? 1 : -1, sA = P ? -Math.PI / 2 : Math.PI / 2, sx0 = bxx + sd * (P ? 120 : 130), sy0 = byy - 50; // from the right (9:16) / left (16:9), finger horizontal
    const hkS = handAt([[2.4, sx0 + sd * 700, sy0 + 60, sA, 0], [3.2, sx0, sy0, sA, 0], [3.35, sx0, sy0, sA, 1], [3.6, sx0, sy0, sA, 0], [4.4, sx0 + sd * 700, sy0 + 60, sA, 0]], l);
    icon3d(ctx, 'scale', bxx, byy - 40, (P ? 220 : 240) * (0.7 + swap * 0.3), { pop: k01(l, 1.9, 0.5), press: hkS[4] });
    kline(ctx, 'مَن يُحاسَب؟', bxx, byy + (P ? 180 : 200), l, 2.2, { size: P ? 72 : 76, w: 800, color: C.tq });
    kline(ctx, 'الحوكمة قبل التوسّع', bxx, byy + (P ? 265 : 285), l, 2.6, { size: P ? 42 : 42, w: 500, color: C.gr });
    // the hand taps the scale
    ripple(ctx, sx0, sy0, l, 3.35, 110);
    hand(ctx, hkS[1], hkS[2], P ? 160 : 150, { ang: hkS[3], press: hkS[4] });
    chrome(ctx, t);
  }

  // 6 · END CARD — logo, all handles, the source, a question for the comments
  function end(ctx, t) {
    const l = local(t, 'end');
    bg(ctx, t);
    const cy = P ? H * 0.25 : H * 0.22;
    logoFull(ctx, cx, cy, P ? 300 : 270, { draw: k01(l, 0, 1.0) });
    kline(ctx, 'سؤالك للتعليقات: هل جرّبت وكيلاً في عملك؟', cx, P ? H * 0.42 : H * 0.44, l, 0.9, { size: P ? 40 : 46, w: 800 });
    // handles grid
    const items = [['X', '@y7yr_'], ['TikTok', '@i.y7y'], ['LinkedIn', 'in/yahya-alameer'], ['Links', 'linktr.ee/yalameer']];
    const cols = P ? 1 : 4, bw = P ? 640 : 400, bh = 84, gap = 20;
    const tw = cols * bw + (cols - 1) * gap, ox = (W - tw) / 2, oy = P ? H * 0.58 : H * 0.79;
    items.forEach(([k, v], i) => {
      const c = i % cols, r = Math.floor(i / cols), x = ox + c * (bw + gap), y = oy + r * (bh + gap);
      const p = k01(l, 1.3 + i * 0.12, 0.4); if (p <= 0) return;
      ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(0, (1 - eb(p)) * 30);
      ctx.fillStyle = C.wh; ctx.shadowColor = 'rgba(0,40,45,0.12)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; rr(ctx, x, y, bw, bh, bh / 2); ctx.fill(); ctx.shadowColor = 'transparent';
      const lw2 = P ? 170 : 116; ctx.fillStyle = C.tq; rr(ctx, x, y, lw2, bh, bh / 2); ctx.fill();
      txt(ctx, k, x + lw2 / 2, y + bh / 2 + 2, { size: P ? 26 : 22, w: 700, fam: LA, rtl: false, color: C.bk });
      txt(ctx, v, x + lw2 + (bw - lw2) / 2, y + bh / 2 + 2, { size: P ? 30 : 23, w: 600, fam: LA, rtl: false, color: C.bk });
      ctx.restore();
    });
    // clay "follow" button pressed by the hand
    const fbx = cx, fby = P ? H * 0.47 + 90 : H * 0.44 + 125;
    const fp = k01(l, 2.0, 0.5);
    const fex = fbx + (P ? 150 : 140) + 18, fey = fby - 8;
    const hkE = handAt([[2.2, W + 400, fey + 40, -Math.PI / 2, 0], [3.1, fex, fey, -Math.PI / 2, 0], [3.25, fex - 6, fey, -Math.PI / 2, 1], [3.5, fex, fey, -Math.PI / 2, 0], [4.6, W + 400, fey + 40, -Math.PI / 2, 0]], l);
    clayButton(ctx, 'تابعني', fbx, fby, P ? 300 : 280, P ? 96 : 90, { pop: fp, press: hkE[4] });
    ripple(ctx, fex, fey, l, 3.25, 120);
    hand(ctx, hkE[1], hkE[2], P ? 130 : 115, { ang: hkE[3], press: hkE[4] });
    txt(ctx, 'Source: Gartner — AI Hype Cycle (October 2026)', cx, P ? H - FREE_BOTTOM - 110 : H - 70, { size: 24, w: 500, fam: LA, rtl: false, color: C.gr, alpha: k01(l, 1.8, 0.5) });
  }

  // ---------------------------------------------------------------- transitions (iris from the hand)
  const SCENES = { hook, title, curve, cancel, shift, end };
  const ORDER = ['hook', 'title', 'curve', 'cancel', 'shift', 'end'];
  const TR = 0.55;
  function draw(ctx, t) {
    let idx = ORDER.findIndex((k) => t >= S.S[k][0] && t < S.S[k][1]); if (idx < 0) idx = ORDER.length - 1;
    const cur = ORDER[idx], start = S.S[cur][0];
    if (idx > 0 && t < start + TR) {
      // previous scene underneath, the new one revealed in a growing turquoise-edged circle
      SCENES[ORDER[idx - 1]](ctx, Math.min(t, start - 1e-3));
      const p = eio((t - start) / TR), R = Math.hypot(W, H) * p;
      const ox = W * 0.5, oy = H * 0.5;
      ctx.save(); ctx.beginPath(); ctx.arc(ox, oy, R, 0, 7); ctx.clip(); SCENES[cur](ctx, t); ctx.restore();
      ctx.save(); ctx.strokeStyle = C.tq; ctx.lineWidth = 40 * (1 - p) + 4; ctx.beginPath(); ctx.arc(ox, oy, R, 0, 7); ctx.stroke(); ctx.restore();
    } else SCENES[cur](ctx, t);
  }

  Studio.film({
    duration: S.DURATION,
    fadeOut: 0.8,
    post: { vignette: 0.1, grain: 0.012, paper: 0 },
    async init() {
      HAND.point.img = await Studio.loadImage('assets/hand/point.png');
      HAND.press.img = await Studio.loadImage('assets/hand/press.png');
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
