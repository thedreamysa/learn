// «يد واحدة» — shared drawing helpers (pure functions of their arguments).
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE;
  const { clamp, lerp, ease } = U;
  const W = 1920, H = 1080 /* the stage; film.js fits it to the real frame */;
  const L = (globalThis.L = {});
  L.SCENES = {};
  L.V = G.W < G.H; // the 9:16 cut: scenes re-stage a few elements, film.js adds the rest

  L.C = {
    gold: '#E7B954', goldHi: '#FFE49A', goldDark: '#A9792A', green: '#0E5A3A', greenDark: '#08301F', greenHi: '#1E8A5A',
    clay: '#A9764A', clayDark: '#6E4526', sand: '#E9C58A', cream: '#F6EBD2', ink: '#2A1B12', night: '#070B18', cold: '#3E6FD8', red: '#E0483A',
    skin: ['#C98F62', '#B67B4E', '#D9A77C', '#A0683F', '#E0B48C', '#8A5632'],
  };
  const C = L.C;

  L.sky = (ctx, stops, y0 = 0, y1 = H) => {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    stops.forEach((c, i) => g.addColorStop(Array.isArray(c) ? c[0] : i / (stops.length - 1), Array.isArray(c) ? c[1] : c));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  };
  L.glow = (ctx, x, y, r, color, alpha = 1, mode = 'lighter') => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.globalCompositeOperation = mode; ctx.globalAlpha = alpha; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
  };
  L.cap = (ctx, x1, y1, x2, y2, w, color) => { ctx.lineCap = 'round'; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
  L.rr = (ctx, x, y, w, h, r, fill, stroke, lw = 4) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } };
  // draw capsule segments [x1,y1,x2,y2,w,color] with one shared outline
  L.segs = (ctx, segs, line = C.ink, o = 9) => { for (const s of segs) L.cap(ctx, s[0], s[1], s[2], s[3], s[4] + o, line); for (const s of segs) L.cap(ctx, s[0], s[1], s[2], s[3], s[4], s[5]); };

  // text: Arabic runs get Noto Naskh Arabic, Latin digits get Inter
  L.tx = (ctx, str, x, y, size, color = '#fff', o = {}) => {
    ctx.save();
    if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = size * 0.5; }
    else if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = size * 0.18; ctx.shadowOffsetY = size * 0.05; }
    G.text(ctx, str, x, y, { size, fam: 'Inter', weight: o.weight || 800, color, align: o.align || 'center', boil: 0, alpha: o.alpha ?? 1, stroke: o.stroke, strokeW: o.strokeW || size * 0.16, lang: 'ar' });
    ctx.restore();
  };
  // a title that pops in at t0 (scale overshoot + fade)
  L.pop = (ctx, t, t0, str, x, y, size, color, o = {}) => {
    if (t < t0) return;
    const a = clamp((t - t0) / 0.18), k = 1 + 0.5 * Math.exp(-(t - t0) * 9);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    L.tx(ctx, str, 0, 0, size, color, { ...o, alpha: a * (o.alpha ?? 1) });
    ctx.restore();
  };
  L.flash = (ctx, t, t0, color = '255,244,214', k = 0.8, decay = 10) => { const f = t >= t0 ? k * Math.exp(-(t - t0) * decay) : 0; if (f > 0.01) { ctx.fillStyle = `rgba(${color},${f})`; ctx.fillRect(0, 0, W, H); } };
  L.dust = (ctx, t, n = 60, color = '255,220,150', seed = 1) => {
    for (let i = 0; i < n; i++) {
      const x = (U.hash(i, seed) * W + t * (8 + 20 * U.hash(i, seed + 1))) % W, y = (U.hash(i, seed + 2) * H - t * (5 + 14 * U.hash(i, seed + 3)) + 10 * H) % H;
      const a = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.3 + i));
      ctx.fillStyle = `rgba(${color},${a})`; ctx.beginPath(); ctx.arc(x, y, 1.5 + 3 * U.hash(i, seed + 4), 0, 7); ctx.fill();
    }
  };

  // ---------- THE HAND (wrist at the origin, fingers pointing up) ----------
  L.hand = (ctx, o) => {
    const { x, y, s = 1, rot = 0, skin = C.skin[0], line = C.ink, curl = 0, spread = 0.12, arm = 700, sleeve = null, sleeveFrom = 190, mud = 0, thumb = 1, flip = 1, outline = 9 } = o;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * flip, s);
    const segs = [[0, 10, 0, arm, 84, skin]];
    if (sleeve) segs.push([0, sleeveFrom, 0, arm, 110, sleeve]);
    segs.push([0, -10, 0, -78, 112, skin]);
    const fingers = [];
    [[-42, 92, -1.5], [-14, 108, -0.5], [15, 102, 0.5], [42, 80, 1.5]].forEach(([fx, len, k], i) => {
      const c = Array.isArray(curl) ? curl[i] : curl, a = -Math.PI / 2 + k * spread, LL = len * (1 - 0.62 * c);
      const sg = [fx, -112, fx + Math.cos(a) * LL, -112 + Math.sin(a) * LL, 25, skin]; segs.push(sg); fingers.push(sg);
    });
    if (thumb) segs.push([-54, -38, -54 - 60 * thumb, -38 - 54 * thumb, 29, skin]);
    L.segs(ctx, segs, line, outline);
    if (mud > 0) { ctx.globalAlpha = mud; for (const f of fingers) L.cap(ctx, lerp(f[0], f[2], 0.35), lerp(f[1], f[3], 0.35), f[2], f[3], 25, C.clayDark); ctx.globalAlpha = 1; }
    ctx.restore();
  };

  // ---------- a handshake: A comes from the left, B from the right; u 0..1 ----------
  L.clasp = (ctx, cx, cy, s, u, A, B) => {
    const e = ease.outCubic(clamp(u)), dA = -(1 - e) * 900, dB = (1 - e) * 900, bs = B.size || 1, as = A.size || 1;
    const sq = 1 + 0.06 * Math.exp(-Math.max(0, u - 1) * 6) * (u >= 1 ? 1 : 0);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s * sq, s * sq);
    L.segs(ctx, [[-1300 + dA, 80, -330 + dA, 32, 118 * as, A.sleeve], [-400 + dA, 34, -70 + dA, 8, 88 * as, A.skin], [-70 + dA, 8, 35 + dA, 0, 104 * as, A.skin]]);
    if (A.cuff) L.cap(ctx, -352 + dA, 4, -340 + dA, 62, 16, A.cuff);
    L.segs(ctx, [[1300 + dB, 80, 330 + dB, 32, 118 * bs, B.sleeve], [400 + dB, 34, 70 + dB, 8, 88 * bs, B.skin], [70 + dB, 8, -30 + dB, 0, 104 * bs, B.skin]]);
    if (B.cuff) L.cap(ctx, 352 + dB, 4, 340 + dB, 62, 16, B.cuff);
    L.segs(ctx, [0, 1, 2, 3].map((i) => [-22 + dB, -36 + i * 25 * bs, -86 + dB, -24 + i * 25 * bs, 23 * bs, B.skin]), C.ink, 7);
    L.segs(ctx, [[-12 + dA, -48, 50 + dA, -62, 27 * as, A.skin]], C.ink, 7);
    ctx.restore();
  };

  // ---------- places ----------
  // a Najdi mud-brick building: crenellated roofline, triangular vents, a pale band
  L.najdi = (ctx, x, y, w, h, color, seed = 1, detail = 1) => {
    ctx.fillStyle = color; ctx.fillRect(x, y - h, w, h);
    const n = Math.max(3, Math.round(w / 26)), tw = w / n;
    ctx.beginPath();
    for (let i = 0; i < n; i++) { ctx.moveTo(x + i * tw, y - h + 1); ctx.lineTo(x + (i + 0.5) * tw, y - h - tw * 0.7); ctx.lineTo(x + (i + 1) * tw, y - h + 1); }
    ctx.fill();
    if (!detail) return;
    ctx.fillStyle = 'rgba(255,235,200,0.22)'; ctx.fillRect(x, y - h + 14, w, 7);
    ctx.fillStyle = 'rgba(40,20,8,0.5)';
    const rows = Math.max(1, Math.floor(h / 90));
    for (let r = 0; r < rows; r++) for (let i = 0; i < n - 1; i += 2) {
      if (U.hash(i, r, seed) < 0.35) continue;
      const vx = x + (i + 1) * tw, vy = y - h + 44 + r * 80;
      ctx.beginPath(); ctx.moveTo(vx - 7, vy + 12); ctx.lineTo(vx, vy); ctx.lineTo(vx + 7, vy + 12); ctx.fill();
    }
    if (h > 150 && U.hash(seed, 9) > 0.4) { ctx.fillRect(x + w * 0.42, y - 62, w * 0.16, 62); }
  };
  L.palm = (ctx, x, y, s, color, sway = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(14, -130, 6 + sway * 20, -260); ctx.stroke();
    ctx.lineWidth = 9;
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.42 + sway * 0.12, r = 120 - Math.abs(i - 4) * 6;
      const tx = 6 + sway * 20, ty = -260;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * r * 0.7, ty + Math.sin(a) * r * 0.9 - 30, tx + Math.cos(a) * r, ty + Math.sin(a) * r * 0.5 + 34); ctx.stroke();
    }
    ctx.restore();
  };
  // a tower with lit windows; type picks the crown
  L.tower = (ctx, x, y, w, h, type, body, lit, seed, tw = 0) => {
    if (h <= 4) return;
    ctx.fillStyle = body;
    ctx.beginPath();
    if (type === 1) { ctx.moveTo(x, y); ctx.lineTo(x, y - h * 0.86); ctx.quadraticCurveTo(x + w * 0.05, y - h, x + w * 0.2, y - h); ctx.quadraticCurveTo(x + w / 2, y - h * 0.62, x + w * 0.8, y - h); ctx.quadraticCurveTo(x + w * 0.95, y - h, x + w, y - h * 0.86); ctx.lineTo(x + w, y); }
    else if (type === 2) { ctx.moveTo(x, y); ctx.lineTo(x + w * 0.1, y - h * 0.8); ctx.lineTo(x + w / 2, y - h); ctx.lineTo(x + w * 0.9, y - h * 0.8); ctx.lineTo(x + w, y); }
    else if (type === 3) { ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.lineTo(x + w, y - h * 0.88); ctx.lineTo(x + w, y); }
    else { ctx.rect(x, y - h, w, h); }
    ctx.closePath(); ctx.fill();
    if (type === 2) { ctx.beginPath(); ctx.arc(x + w / 2, y - h * 0.84, w * 0.2, 0, 7); ctx.fillStyle = lit; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1; }
    if (type === 0) { ctx.fillStyle = body; ctx.fillRect(x + w * 0.46, y - h - h * 0.08, w * 0.08, h * 0.08); }
    if (!lit) return;
    const cols = Math.max(2, Math.floor(w / 16)), rows = Math.floor((h * 0.8) / 18);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const k = U.hash(c, r, seed);
      if (k < 0.45) continue;
      const on = 0.5 + 0.5 * Math.sin(tw * (0.6 + k * 2) + k * 40);
      ctx.fillStyle = lit; ctx.globalAlpha = 0.25 + 0.6 * k * on;
      ctx.fillRect(x + 5 + (c * (w - 10)) / cols, y - 12 - r * 18, (w - 10) / cols - 4, 8);
    }
    ctx.globalAlpha = 1;
  };
  // Saudi Arabia outline (Natural Earth, bundled with the engine) -> canvas path
  L.ksa = (cx, cy, k) => {
    const rings = (globalThis.GEO && GEO.world && GEO.world['Saudi Arabia']) || [];
    const my = (lat) => (Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * 180) / Math.PI, y0 = my(24);
    return rings.map((r) => { const pts = []; for (let i = 0; i < r.length; i += 2) pts.push([cx + (r[i] - 45) * k, cy - (my(r[i + 1]) - y0) * k]); return pts; });
  };
  L.pathOf = (ctx, pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };

  // a fictional phone (no real app's look): rounded body + screen callback in screen coordinates
  L.phone = (ctx, cx, cy, w, h, screen, o = {}) => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot || 0);
    L.rr(ctx, -w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 54, '#11131a', '#3b4152', 4);
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 40); ctx.clip();
    ctx.fillStyle = o.bg || '#0f1626'; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.translate(-w / 2, -h / 2); screen(ctx, w, h);
    ctx.restore();
  };
  L.bubble = (ctx, x, y, w, h, fill, lines, size, color = '#fff', o = {}) => {
    L.rr(ctx, x, y, w, h, 26, fill, o.stroke, 4);
    lines.forEach((ln, i) => L.tx(ctx, ln, x + w - 26, y + size * 1.25 + i * size * 1.5, size, color, { align: 'right', weight: 700, shadow: false }));
  };
  // letterbox bars (2.39:1) with amount k 0..1
  L.bars = (ctx, k) => { if (k <= 0) return; const b = ((H - W / 2.39) / 2) * k; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, b); ctx.fillRect(0, H - b, W, b); };
})();
