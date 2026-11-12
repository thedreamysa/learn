// «يد واحدة» — scenes 1–6 (الجذور، الثمرة، بداية المعركة الخفية). u = seconds since the scene began.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, S = globalThis.SCORE, L = globalThis.L;
  const { clamp, lerp, ease } = U;
  const { ev, sc, BAR, BEAT } = S;
  const W = 1920, H = 1080 /* the stage; film.js fits it to the real frame */, C = L.C, SC = L.SCENES;

  // ---------- 1. اليد الأولى ----------
  SC[1] = (ctx, t, u) => {
    L.sky(ctx, ['#2A1208', '#8A3F1C', '#E08A3C', '#F4C06A'], 0, 760);
    L.glow(ctx, 1380, 640, 620, 'rgba(255,214,140,0.9)', 0.9);
    ctx.fillStyle = '#FFE2A8'; ctx.beginPath(); ctx.arc(1380, 660, 110, 0, 7); ctx.fill();
    // far walls of the town, then the ground
    for (let i = 0; i < 9; i++) L.najdi(ctx, -40 + i * 235, 742, 220, 60 + 70 * U.hash(i, 3), '#4A2412', i, 0);
    L.sky; ctx.fillStyle = '#5A3218'; ctx.fillRect(0, 740, W, H - 740);
    const g = ctx.createLinearGradient(0, 740, 0, H); g.addColorStop(0, 'rgba(240,160,80,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0.35)'); ctx.fillStyle = g; ctx.fillRect(0, 740, W, H - 740);
    // a row of finished bricks drying, and the one being shaped
    for (let i = 0; i < 5; i++) L.rr(ctx, 150 + i * 190, 800 + (i % 2) * 26, 160, 62, 10, '#8A5A34', C.ink, 5);
    const pat = Math.abs(Math.sin(((u - 0.9) / 1.25) * Math.PI)); // 0 when the palm is on the clay (the clay sounds)
    const sq = 1 - 0.07 * (1 - pat);
    L.rr(ctx, 760, 900 - 150 * sq, 520, 150 * sq, 22, C.clay, C.ink, 7);
    ctx.fillStyle = 'rgba(255,220,170,0.25)'; ctx.fillRect(790, 900 - 150 * sq + 16, 460, 12);
    ctx.fillStyle = '#3B2110'; ctx.beginPath(); ctx.ellipse(1020, 905, 330, 22, 0, 0, 7); ctx.fill();
    // the hand comes down from the top right, palm on the clay
    const hy = 720 - 150 * (1 - sq) / 0.07 * 0.0 - pat * 70;
    L.hand(ctx, { x: 1060, y: hy, s: 1.55, rot: Math.PI + 0.32 + 0.03 * Math.sin(u * 2), skin: '#B67B4E', mud: 0.85, sleeve: '#EFE6D2', sleeveFrom: 330, arm: 900, spread: 0.14, curl: 0.12 });
    L.dust(ctx, t, 70, '255,214,150', 4);
    const a = 1 - clamp((u - 0.5) / 1.8); if (a > 0) { ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.fillRect(0, 0, W, H); }
  };

  // ---------- 2. الدرعية ----------
  SC[2] = (ctx, t, u) => {
    const d = sc[2].t1 - sc[2].t0, p = u / d;
    L.sky(ctx, ['#3D5E94', '#E9A867', '#F8D79A', '#FBE9BE'], 0, 700);
    const sunY = lerp(760, 520, ease.outCubic(p));
    L.glow(ctx, 960, sunY, 700, 'rgba(255,226,160,0.9)', 0.9);
    ctx.fillStyle = '#FFF0C4'; ctx.beginPath(); ctx.arc(960, sunY, 90, 0, 7); ctx.fill();
    ctx.save(); // a slow aerial push-in
    const z = 1 + 0.07 * p; ctx.translate(W / 2, 620); ctx.scale(z, z); ctx.translate(-W / 2, -620);
    // far hills
    ctx.fillStyle = '#C99766'; ctx.beginPath(); ctx.moveTo(-100, 700); for (let x = -100; x <= W + 100; x += 60) ctx.lineTo(x, 640 + 26 * Math.sin(x * 0.004) + 12 * Math.sin(x * 0.013)); ctx.lineTo(W + 100, 800); ctx.lineTo(-100, 800); ctx.fill();
    // At-Turaif: three ranks of mud-brick buildings
    const rank = (y, n, col, seed, dx, hMin, hMax) => { for (let i = 0; i < n; i++) { const w = 120 + 110 * U.hash(i, seed); L.najdi(ctx, -160 + i * ((W + 320) / n) + dx, y, w, hMin + (hMax - hMin) * U.hash(i, seed + 5), col, seed + i); } };
    rank(700, 15, '#9A6238', 11, -p * 14, 60, 150);
    rank(770, 12, '#7E4C28', 23, -p * 30, 90, 230);
    L.najdi(ctx, 820 - p * 30, 770, 250, 330, '#86522C', 77); // the palace
    // wadi + palms
    ctx.fillStyle = '#5D3A1E'; ctx.fillRect(-200, 768, W + 400, 400);
    ctx.fillStyle = '#3F6E3A'; ctx.beginPath(); ctx.moveTo(-200, 860); ctx.quadraticCurveTo(900, 800, W + 200, 880); ctx.lineTo(W + 200, 1200); ctx.lineTo(-200, 1200); ctx.fill();
    for (let i = 0; i < 16; i++) { const k = U.hash(i, 41); L.palm(ctx, -120 + i * 140 + 60 * k - p * 60, 900 + 90 * U.hash(i, 42), 0.75 + 0.6 * k, i % 3 ? '#234A26' : '#1A3A1E', Math.sin(t * 0.9 + i)); }
    ctx.restore();
    // the hands gather: silhouettes rising together
    const hu = clamp((u - 2.6) / 1.6), ho = clamp((d - 0.6 - u) / 1.2);
    if (hu > 0 && ho > 0) for (let i = 0; i < 7; i++) {
      const k = ease.outBack(clamp(hu * 1.6 - i * 0.09), 1.2) * ease.outCubic(ho);
      L.hand(ctx, { x: 360 + i * 200, y: H + 330 - 420 * k + 14 * Math.sin(t * 2 + i), s: 1.05 + 0.2 * U.hash(i, 5), rot: (i - 3) * 0.07, skin: '#2B170C', line: '#2B170C', outline: 0, spread: 0.2, arm: 500 });
    }
    L.dust(ctx, t, 40, '255,236,190', 9);
    L.pop(ctx, t, ev.y1727, '1727', W / 2, 400, 210, C.goldHi, { glow: 'rgba(120,60,10,0.9)' });
    L.pop(ctx, t, ev.first, 'تأسيس الدولة السعودية الأولى', W / 2, 500, L.V ? 50 : 76, '#fff', { glow: 'rgba(60,30,5,0.9)' });
    L.flash(ctx, t, ev.y1727, '255,240,200', 0.75, 9);
  };

  // ---------- 3. التوحيد ----------
  SC[3] = (ctx, t, u) => {
    const mapT = ev.y1932 - BAR; // the outline starts drawing one bar before the hit
    L.sky(ctx, ['#7A3E22', '#D9853F', '#F3C679', '#F7DFA6'], 0, 760);
    L.glow(ctx, 300, 560, 600, 'rgba(255,220,150,0.8)', 0.8);
    // dunes
    const dune = (y, amp, col, ph, sp) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-10, H); for (let x = -10; x <= W + 10; x += 40) ctx.lineTo(x, y + amp * Math.sin(x * 0.0032 + ph) + amp * 0.4 * Math.sin(x * 0.009 + ph * 2 + u * sp)); ctx.lineTo(W + 10, H); ctx.fill(); };
    dune(640, 46, '#C98B4E', 0.5, 0);
    // riders along the ridge, gathering from both sides
    const rider = (x, y, s, dir, ph) => {
      ctx.save(); ctx.translate(x, y + 3 * Math.sin(ph)); ctx.scale(s * dir, s); ctx.fillStyle = '#3A1E0E'; ctx.strokeStyle = '#3A1E0E'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.ellipse(0, -44, 34, 15, 0, 0, 7); ctx.fill();
      ctx.lineWidth = 6; for (const [lx, k] of [[-22, 0], [-12, 1.6], [16, 3.1], [26, 4.7]]) { ctx.beginPath(); ctx.moveTo(lx, -38); ctx.lineTo(lx + 9 * Math.sin(ph + k), 0); ctx.stroke(); }
      ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(28, -50); ctx.lineTo(46, -76); ctx.stroke(); ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(46, -76); ctx.lineTo(60, -70); ctx.stroke();
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-32, -46); ctx.quadraticCurveTo(-48, -40, -46, -22); ctx.stroke();
      ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(2, -56); ctx.lineTo(4, -86); ctx.stroke(); ctx.beginPath(); ctx.arc(5, -96, 8, 0, 7); ctx.fill();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(14, -60); ctx.lineTo(18, -150); ctx.stroke();
      ctx.fillStyle = C.green; ctx.beginPath(); ctx.moveTo(18, -150); ctx.lineTo(-22 + 4 * Math.sin(ph * 0.7), -143); ctx.lineTo(18, -128); ctx.fill();
      ctx.restore();
    };
    const gather = ease.inOutQuad(clamp(u / (mapT - sc[3].t0 + 1)));
    for (let i = 0; i < 12; i++) {
      const dir = i % 2 ? 1 : -1, home = W / 2 + dir * (60 + (i >> 1) * 85), from = W / 2 + dir * (1100 + i * 60);
      const x = lerp(from, home, gather);
      rider(x, 648 + 46 * Math.sin(x * 0.0032 + 0.5) + (i % 3) * 6, 0.95, -dir, u * 9 * (gather < 1 ? 1 : 0.2) + i);
    }
    dune(760, 60, '#B0713A', 2.1, 0.02);
    dune(900, 50, '#8E5628', 4.0, 0.03);
    // the map: outline draws on, then fills with gold on the hit
    const m = clamp((t - mapT) / BAR);
    if (m > 0) {
      ctx.fillStyle = `rgba(30,12,4,${0.55 * m})`; ctx.fillRect(0, 0, W, H);
      const done = t >= ev.y1932, k = done ? 1 + 0.05 * Math.exp(-(t - ev.y1932) * 7) : 1;
      const rings = L.ksa(W / 2, 470, 33 * k);
      for (const pts of rings) {
        L.pathOf(ctx, pts);
        if (done) { const g = ctx.createLinearGradient(0, 180, 0, 800); g.addColorStop(0, C.goldHi); g.addColorStop(1, C.goldDark); ctx.fillStyle = g; ctx.shadowColor = 'rgba(255,200,90,0.9)'; ctx.shadowBlur = 50; ctx.fill(); ctx.shadowBlur = 0; }
        ctx.setLineDash([m * 5200, 5200]); ctx.strokeStyle = C.goldHi; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.stroke(); ctx.setLineDash([]);
      }
      if (done) {
        L.pop(ctx, t, ev.y1932, '1932', W / 2, 500, 170, '#3A2206', { shadow: false });
        L.pop(ctx, t, ev.y1932 + BEAT, 'المملكة العربية السعودية', W / 2, 880, L.V ? 70 : 96, '#fff', { glow: 'rgba(60,30,5,0.9)' });
      }
    }
    L.dust(ctx, t, 50, '255,226,160', 12);
    L.flash(ctx, t, ev.y1932, '255,236,180', 0.9, 7);
  };

  // ---------- 4. مونتاج البناء ----------
  const PANELS = [
    { cap: 'النفط', bg: '#F1DFB8' }, { cap: 'التعليم', bg: '#E9E3CF' }, { cap: 'الابتعاث', bg: '#D5E6EE' },
    { cap: 'الجامعات', bg: '#EEE2C4' }, { cap: 'الصناعة', bg: '#DDE4DA' }, { cap: 'توسعة الحرمين الشريفين', bg: '#F3E8CC' },
  ];
  function icon(ctx, i, a, t) { // drawn around (0,0), about 420 wide
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 7;
    if (i === 0) { // derrick
      ctx.beginPath(); ctx.moveTo(-90, 150); ctx.lineTo(-18, -190); ctx.lineTo(18, -190); ctx.lineTo(90, 150); ctx.stroke();
      for (let k = 0; k < 5; k++) { const y0 = 150 - k * 68, y1 = y0 - 68, w0 = 90 - k * 14.4, w1 = w0 - 14.4; ctx.beginPath(); ctx.moveTo(-w0, y0); ctx.lineTo(w1, y1); ctx.moveTo(w0, y0); ctx.lineTo(-w1, y1); ctx.moveTo(-w1, y1); ctx.lineTo(w1, y1); ctx.stroke(); }
      L.rr(ctx, -150, 150, 300, 26, 6, '#6A4A2A', C.ink, 6);
      ctx.fillStyle = '#1b1b1b'; const gh = 90 * a * (0.8 + 0.2 * Math.sin(t * 9)); ctx.beginPath(); ctx.moveTo(-14, -190); ctx.quadraticCurveTo(-50, -230 - gh, 0, -250 - gh); ctx.quadraticCurveTo(50, -230 - gh, 14, -190); ctx.fill();
      L.rr(ctx, 150, 70, 110, 80, 14, '#B9B4A6', C.ink, 6);
    } else if (i === 1) { // book + pencil
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, -80); ctx.quadraticCurveTo(-110, -130, -220, -90); ctx.lineTo(-220, 110); ctx.quadraticCurveTo(-110, 70, 0, 120); ctx.quadraticCurveTo(110, 70, 220, 110); ctx.lineTo(220, -90); ctx.quadraticCurveTo(110, -130, 0, -80); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(0, 120); ctx.stroke();
      ctx.lineWidth = 4; ctx.strokeStyle = '#9a8f7a'; for (let k = 0; k < 4; k++) { const w = 150 * clamp(a * 4 - k * 0.6); if (w > 0) { ctx.beginPath(); ctx.moveTo(190, -50 + k * 34); ctx.lineTo(190 - w, -44 + k * 34); ctx.stroke(); } }
      ctx.save(); ctx.translate(-110 + 40 * Math.sin(t * 5), 0 + 10 * Math.sin(t * 9)); ctx.rotate(-0.7); L.rr(ctx, -12, -150, 24, 150, 4, C.gold, C.ink, 5); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(0, 26); ctx.lineTo(12, 0); ctx.fill(); ctx.restore();
    } else if (i === 2) { // a plane climbing
      ctx.save(); ctx.translate(-160 + 320 * a, 90 - 180 * a); ctx.rotate(-0.28);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, 150, 30, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.green; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-80, 90); ctx.lineTo(-40, 90); ctx.lineTo(50, 0); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-120, -8); ctx.lineTo(-160, -70); ctx.lineTo(-130, -70); ctx.lineTo(-90, -14); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#7fb3d0'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(-50 + k * 32, -6, 7, 0, 7); ctx.fill(); }
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 10; ctx.setLineDash([26, 22]); ctx.beginPath(); ctx.moveTo(-230, 150); ctx.lineTo(-230 + 200 * a, 150 - 100 * a); ctx.stroke(); ctx.setLineDash([]);
    } else if (i === 3) { // a university: pediment, columns, dome
      ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(0, -120, 70, Math.PI, 0); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-230, -70); ctx.lineTo(0, -150); ctx.lineTo(230, -70); ctx.closePath(); ctx.fill(); ctx.stroke();
      L.rr(ctx, -220, -70, 440, 34, 4, '#fff', C.ink, 7);
      for (let k = 0; k < 6; k++) { const hh = 190 * ease.outCubic(clamp(a * 3 - k * 0.2)); L.rr(ctx, -200 + k * 74, 154 - hh, 32, hh, 4, '#fff', C.ink, 6); }
      L.rr(ctx, -250, 150, 500, 30, 4, '#D8CBA8', C.ink, 7);
    } else if (i === 4) { // a factory
      for (let k = 0; k < 3; k++) { const p = ((t * 0.5 + k * 0.33) % 1); ctx.fillStyle = `rgba(120,120,120,${0.5 * (1 - p)})`; ctx.beginPath(); ctx.arc(150 + 30 * p, -180 - 110 * p, 24 + 34 * p, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(70 + 30 * p, -150 - 110 * p, 20 + 30 * p, 0, 7); ctx.fill(); }
      L.rr(ctx, 130, -170, 44, 200, 4, '#B5553C', C.ink, 7); L.rr(ctx, 52, -140, 40, 170, 4, '#B5553C', C.ink, 7);
      ctx.fillStyle = '#9FB0B8'; ctx.beginPath(); ctx.moveTo(-240, 150); ctx.lineTo(-240, -20); ctx.lineTo(-150, -80); ctx.lineTo(-150, -20); ctx.lineTo(-60, -80); ctx.lineTo(-60, -20); ctx.lineTo(30, -80); ctx.lineTo(30, 0); ctx.lineTo(240, 0); ctx.lineTo(240, 150); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.goldHi; for (let k = 0; k < 5; k++) L.rr(ctx, -210 + k * 88, 50, 50, 40, 4, C.goldHi, C.ink, 5);
      ctx.save(); ctx.translate(-190, 190); ctx.rotate(t * 2); ctx.strokeStyle = C.ink; ctx.lineWidth = 12; for (let k = 0; k < 8; k++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(0, 44); ctx.stroke(); } ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill(); ctx.lineWidth = 7; ctx.stroke(); ctx.restore();
    } else { // the Two Holy Mosques: the Kaaba between minarets, arcades widening
      const wide = ease.outCubic(a);
      for (const dir of [-1, 1]) {
        const mx = dir * (150 + 80 * wide);
        L.rr(ctx, mx - 16, -170, 32, 320, 6, '#fff', C.ink, 6); L.rr(ctx, mx - 24, -90, 48, 14, 4, C.gold, C.ink, 5); L.rr(ctx, mx - 24, -10, 48, 14, 4, C.gold, C.ink, 5);
        ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(mx - 16, -170); ctx.quadraticCurveTo(mx, -240, mx, -250); ctx.quadraticCurveTo(mx, -240, mx + 16, -170); ctx.fill(); ctx.stroke();
        for (let k = 0; k < 3; k++) { const ax = dir * (60 + k * 62 * (0.6 + 0.4 * wide)) + (dir < 0 ? -50 : 0); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(ax, 150); ctx.lineTo(ax, 80); ctx.arc(ax + 25, 80, 25, Math.PI, 0); ctx.lineTo(ax + 50, 150); ctx.fill(); ctx.stroke(); }
      }
      L.rr(ctx, -62, 10, 124, 140, 4, '#15130f', C.ink, 7); ctx.fillStyle = C.gold; ctx.fillRect(-62, 44, 124, 16);
      L.rr(ctx, -300, 150, 600, 22, 4, '#E7DFC8', C.ink, 6);
    }
  }
  SC[4] = (ctx, t, u) => {
    L.sky(ctx, ['#0B3B28', '#0E5A3A', '#0A3222']);
    // a quiet lattice of gold diamonds
    ctx.strokeStyle = 'rgba(231,185,84,0.10)'; ctx.lineWidth = 2;
    for (let x = -40; x < W + 80; x += 120) for (let y = -40; y < H + 80; y += 120) { ctx.beginPath(); ctx.moveTo(x, y - 46); ctx.lineTo(x + 46, y); ctx.lineTo(x, y + 46); ctx.lineTo(x - 46, y); ctx.closePath(); ctx.stroke(); }
    let idx = 0; ev.panels.forEach((pt, i) => { if (t >= pt) idx = i; });
    const p0 = ev.panels[idx], p1 = ev.panels[idx + 1] ?? sc[4].t1, a = clamp((t - p0) / (p1 - p0));
    const slide = (1 - ease.outCubic(clamp((t - p0) / 0.3))) * (idx ? 1 : 0);
    const cx = W / 2 + slide * 1500, cy = 420, pw = 1040, ph = 620;
    const card = (x, i, aa) => {
      ctx.save(); ctx.translate(x, cy); ctx.rotate((i % 2 ? 1 : -1) * 0.012);
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; L.rr(ctx, -pw / 2, -ph / 2, pw, ph, 28, PANELS[i].bg); ctx.shadowColor = 'transparent';
      L.rr(ctx, -pw / 2 + 14, -ph / 2 + 14, pw - 28, ph - 28, 18, null, C.gold, 5);
      // the hand that lifts it
      L.hand(ctx, { x: 300, y: 236 - 14 * ease.outBack(clamp(aa * 5)), s: 0.86, rot: -1.25, skin: C.skin[i % C.skin.length], sleeve: '#F3EEE2', sleeveFrom: 170, arm: 520, spread: 0.1 });
      ctx.save(); ctx.translate(-130, 14); const k = 0.9 + 0.1 * ease.outBack(clamp(aa * 5)); ctx.scale(k * 0.94, k * 0.94); icon(ctx, i, aa, t); ctx.restore();
      L.tx(ctx, PANELS[i].cap, pw / 2 - 60, -ph / 2 + 110, i === 5 ? 60 : 78, C.greenDark, { align: 'right', shadow: false });
      ctx.restore();
    };
    if (slide > 0 && idx > 0) card(W / 2 - (1 - slide) * 1500, idx - 1, 1);
    card(cx, idx, a);
    // the kings: a gold timeline that lights up name by name (right to left)
    if (L.V) return; // the kings are listed under the card by film.js
    const y = 846; ctx.strokeStyle = 'rgba(231,185,84,0.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(250, y); ctx.lineTo(W - 250, y); ctx.stroke();
    S.KINGS.forEach((k, i) => {
      const x = W - 290 - i * 335, on = t >= ev.kings[i], pop = on ? 1 + 0.5 * Math.exp(-(t - ev.kings[i]) * 9) : 1;
      ctx.fillStyle = on ? C.goldHi : 'rgba(231,185,84,0.35)'; ctx.beginPath(); ctx.arc(x, y, (on ? 15 : 9) * pop, 0, 7); ctx.fill();
      if (!on) return;
      L.pop(ctx, t, ev.kings[i], k.name, x, y - 36, 50, '#fff');
      L.tx(ctx, k.years, x, y + 54, 30, C.goldHi, { weight: 700, alpha: clamp((t - ev.kings[i]) / 0.3) });
    });
    for (const kt of ev.kings) L.flash(ctx, t, kt, '255,236,180', 0.18, 12);
  };

  // ---------- 5. الرؤية ----------
  const TOWERS = Array.from({ length: 26 }, (_, i) => ({ x: -30 + i * 76 + 30 * U.hash(i, 61), w: 50 + 46 * U.hash(i, 62), h: 150 + 330 * U.hash(i, 63), type: [4, 4, 3, 4, 0, 4][i % 6], d: U.hash(i, 64) }));
  TOWERS[8] = { x: 610, w: 120, h: 640, type: 1, d: 0.25 }; TOWERS[15] = { x: 1150, w: 96, h: 560, type: 2, d: 0.45 }; TOWERS[12] = { x: 905, w: 86, h: 700, type: 3, d: 0.7 };
  L.riyadh = (ctx, t, rise, night = 1) => {
    const base = 880;
    TOWERS.forEach((b, i) => {
      const k = ease.outCubic(clamp(rise * 1.6 - b.d * 0.6));
      L.tower(ctx, b.x, base, b.w, b.h * (0.25 + 0.75 * k), b.type, night ? (i % 2 ? '#101a33' : '#16223f') : (i % 2 ? '#8FA6B8' : '#A9BCCB'), night ? (i % 3 ? '#FFD98A' : '#9ED0FF') : 'rgba(255,255,255,0.8)', i, t * 3);
      if (night && k < 1 && k > 0.02 && b.h > 400) { ctx.strokeStyle = '#FFD98A'; ctx.lineWidth = 4; const ty = base - b.h * (0.25 + 0.75 * k); ctx.beginPath(); ctx.moveTo(b.x + b.w / 2, ty); ctx.lineTo(b.x + b.w / 2, ty - 50); ctx.lineTo(b.x + b.w / 2 + 70, ty - 50); ctx.stroke(); }
    });
  };
  SC[5] = (ctx, t, u) => {
    const tt = Math.min(t, ev.cut), uu = tt - sc[5].t0, rise = clamp(uu / (ev.cut - sc[5].t0));
    ctx.save();
    const z = 1 + 0.06 * rise; ctx.translate(W / 2, 700); ctx.scale(z, z); ctx.translate(-W / 2, -700);
    L.sky(ctx, ['#050816', '#0C1840', '#27407E', '#5A5E9A'], 0, 900);
    // star trails (time-lapse)
    ctx.lineWidth = 2;
    for (let i = 0; i < 90; i++) { const r = 200 + 1100 * U.hash(i, 71), a0 = U.hash(i, 72) * 6.28, len = 0.05 + uu * 0.035; ctx.strokeStyle = `rgba(255,255,255,${0.15 + 0.4 * U.hash(i, 73)})`; ctx.beginPath(); ctx.arc(960, 1500, r + 500, a0 - 2.4, a0 - 2.4 + len); ctx.stroke(); }
    L.glow(ctx, 960, 900, 900, 'rgba(255,190,110,0.5)', 0.7);
    L.riyadh(ctx, tt, rise, 1);
    ctx.fillStyle = '#060912'; ctx.fillRect(-100, 880, W + 200, 300);
    // traffic: streaks of light
    for (let i = 0; i < 46; i++) { const lane = i % 4, sp = (lane < 2 ? 1 : -1) * (500 + 300 * U.hash(i, 81)), x = (((U.hash(i, 82) * 2600 + uu * sp) % 2600) + 2600) % 2600 - 300, y = 896 + lane * 18; ctx.strokeStyle = lane < 2 ? 'rgba(255,90,70,0.85)' : 'rgba(255,240,200,0.9)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.sign(sp) * 130, y); ctx.stroke(); }
    ctx.restore();
    L.pop(ctx, t, ev.vision, 'رؤية السعودية 2030', W / 2, 190, L.V ? 80 : 120, C.goldHi, { glow: 'rgba(255,170,60,0.8)' });
    L.pop(ctx, t, ev.vision + 2 * BEAT, 'أسرع قفزة في تاريخنا', W / 2, L.V ? 270 : 290, L.V ? 52 : 62, '#fff');
    // the cut: the picture freezes, turns cold, and the frame narrows to a phone
    if (t >= ev.cut) {
      const k = ease.inOutCubic(clamp((t - ev.cut) / (sc[5].t1 - ev.cut - 0.15)));
      ctx.fillStyle = `rgba(20,40,110,${0.45 * clamp((t - ev.cut) / 0.4)})`; ctx.fillRect(0, 0, W, H);
      const w = lerp(W + 80, 300, k), h = lerp(H + 80, 560, k);
      ctx.save(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.roundRect(W / 2 - w / 2, H / 2 - h / 2, w, h, 40 * k); ctx.fill('evenodd'); ctx.restore();
      if (k > 0.3) { ctx.strokeStyle = `rgba(90,110,150,${k})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, H / 2 - h / 2, w, h, 40 * k); ctx.stroke(); }
    }
  };

  // ---------- 6. الشاشة ----------
  L.youth = { skin: '#C98F62', hair: '#1c1512', hairStyle: 'short', outfit: 'hoodie', shirt: '#2E3A55', bottoms: 'pants', shorts: '#222', facialHair: 'stubble' };
  SC[6] = (ctx, t, u) => {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H);
    // the room: a window with a faint city, a bed edge
    L.rr(ctx, 1240, 150, 420, 520, 8, '#0B1430', '#141d3a', 10); ctx.fillStyle = '#141d3a'; ctx.fillRect(1444, 150, 10, 520); ctx.fillRect(1240, 400, 420, 10);
    for (let i = 0; i < 14; i++) { ctx.fillStyle = `rgba(255,214,140,${0.15 + 0.25 * U.hash(i, 5)})`; ctx.fillRect(1262 + (i % 7) * 56, 560 - 90 * U.hash(i, 6), 30, 8); }
    ctx.fillStyle = '#0A0F20'; ctx.fillRect(0, 900, W, 180);
    const breathe = Math.sin(t * 1.4) * 4;
    Ch.person(ctx, { x: 760, y: 1500 + breathe, pose: 'stand', s: 2.5, gesture: 'phone', eyes: t >= ev.ping && t < ev.ping + 0.6 ? 'wide' : 'normal', lookY: 0.9, look: 0.25, brows: 'worried', mouth: 'flat', headRot: 0.1, style: L.youth });
    ctx.fillStyle = 'rgba(5,10,34,0.62)'; ctx.fillRect(0, 0, W, H); // the dark
    const fl = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 3.1), kick = t >= ev.ping ? 0.6 * Math.exp(-(t - ev.ping) * 3) : 0;
    L.glow(ctx, 880, 780, 620, 'rgba(90,150,255,0.55)', fl + kick);
    L.glow(ctx, 880, 800, 200, 'rgba(210,230,255,0.8)', 0.7 + kick);
    if (t >= ev.ping) { // the notification
      const a = t - ev.ping, k = ease.outBack(clamp(a / 0.3), 1.6);
      for (let r = 0; r < 3; r++) { const rr = (a * 260 + r * 90) % 400; ctx.strokeStyle = `rgba(140,180,255,${0.5 * (1 - rr / 400)})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(880, 790, rr, 0, 7); ctx.stroke(); }
      ctx.save(); ctx.translate(L.V ? 880 : 1330, L.V ? 300 : 760); ctx.scale(k, k);
      L.rr(ctx, -330, -90, 660, 180, 30, 'rgba(22,30,58,0.96)', '#5A7FE0', 4);
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(-272, -32, 22, 0, 7); ctx.fill(); L.tx(ctx, '1', -272, -20, 30, '#fff', { shadow: false });
      L.tx(ctx, 'رسالة جديدة', 290, -28, 40, '#9FB6F0', { align: 'right', weight: 700, shadow: false });
      L.tx(ctx, 'عاجل!! انشرها قبل الحذف', 290, 46, 52, '#fff', { align: 'right', shadow: false });
      ctx.restore();
    }
    if (t >= ev.pulse) { const ph = ((t - ev.pulse) / BEAT) % 1; ctx.fillStyle = `rgba(40,70,200,${0.07 * (1 - ph)})`; ctx.fillRect(0, 0, W, H); }
    const a = clamp(u / 0.5); if (a < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - a})`; ctx.fillRect(0, 0, W, H); }
  };
})();
