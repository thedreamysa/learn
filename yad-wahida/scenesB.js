// «يد واحدة» — scenes 7–13 (المعركة الخفية، اليد التي توقف، يد واحدة).
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, S = globalThis.SCORE, L = globalThis.L;
  const { clamp, lerp, ease } = U;
  const { ev, sc, BAR, BEAT } = S;
  const W = G.W, H = G.H, C = L.C, SC = L.SCENES;

  const coldBg = (ctx, t) => { L.sky(ctx, ['#050814', '#0A1230', '#0B1A44']); ctx.strokeStyle = 'rgba(80,120,220,0.08)'; ctx.lineWidth = 2; for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } };
  const avatar = (ctx, x, y, r, col = '#5B6788') => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - r * 0.25, r * 0.42, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x, y + r * 0.75, r * 0.72, Math.PI, 0); ctx.fill(); };
  const rumor = (ctx, x, y, w, k = 1) => { // the forwarded message bubble
    L.rr(ctx, x, y, w, 250 * k, 26, '#1D2A52', '#3F5FB8', 4);
    L.tx(ctx, '↪ مُعاد توجيهها', x + w - 26, y + 48 * k, 28 * k, '#8FA6E6', { align: 'right', weight: 700, shadow: false });
    L.tx(ctx, 'عاجل!! خبر خطير…', x + w - 26, y + 118 * k, 46 * k, '#fff', { align: 'right', shadow: false });
    L.tx(ctx, 'انشروه قبل الحذف', x + w - 26, y + 186 * k, 46 * k, '#fff', { align: 'right', shadow: false });
    L.tx(ctx, 'المصدر: مجهول', x + 26, y + 232 * k, 24 * k, '#E58A7E', { align: 'left', weight: 700, shadow: false });
  };

  // ---------- 7. الإشاعة ----------
  SC[7] = (ctx, t, u) => {
    const cr = t >= ev.crack, sh = cr ? 22 * Math.exp(-(t - ev.crack) * 5) : 0;
    ctx.save(); ctx.translate(U.noise1(t * 40, 1) * sh, U.noise1(t * 40, 2) * sh);
    coldBg(ctx, t);
    const n = S.fwd.filter((f) => f.t <= t).length, N = S.fwd.length;
    // the web of forwards: every ping is one more node
    const node = (f) => [860 + f.x * 940, 330 + f.y * 560];
    ctx.lineWidth = 3;
    for (let i = 0; i < n; i++) { const f = S.fwd[i], [x, y] = node(f), p = i ? node(S.fwd[Math.floor(U.hash(i, 3) * i)]) : [520, 560]; ctx.strokeStyle = 'rgba(224,72,58,0.35)'; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(x, y); ctx.stroke(); }
    for (let i = 0; i < n; i++) { const f = S.fwd[i], [x, y] = node(f), a = t - f.t, k = ease.outBack(clamp(a / 0.2), 2); L.glow(ctx, x, y, 90, 'rgba(224,72,58,0.5)', Math.exp(-a * 4)); ctx.save(); ctx.translate(x, y); ctx.scale(k, k); L.rr(ctx, -30, -22, 60, 44, 12, '#1D2A52', C.red, 3); ctx.fillStyle = '#fff'; ctx.fillRect(-18, -8, 36, 5); ctx.fillRect(-18, 4, 24, 5); ctx.restore(); }
    // the phone with the rumour
    L.phone(ctx, 440, 560, 500, 860, (c, w, h) => {
      c.fillStyle = '#16203E'; c.fillRect(0, 0, w, 110); avatar(c, w - 70, 56, 34, '#7A89B8');
      L.tx(c, 'مجموعة الأهل والأصدقاء', w - 124, 68, 34, '#fff', { align: 'right', weight: 700, shadow: false });
      L.rr(c, 30, 150, 300, 70, 22, '#232C48'); L.rr(c, 30, 240, 220, 70, 22, '#232C48');
      const a = ease.outBack(clamp((u - 0.3) / 0.35), 1.4); c.save(); c.translate(w / 2, 480); c.scale(a, a); rumor(c, -220, -125, 440); c.restore();
      const b = Math.min(n, 5); for (let i = 0; i < b; i++) L.rr(c, 30, 640 + i * 44, 180 + 60 * U.hash(i, 9), 30, 14, '#232C48');
    }, { rot: -0.04 });
    // the counter
    const val = n === 0 ? 0 : Math.round(Math.pow(10, 1 + 4 * (n / N)) / (n >= N ? 1 : 1)), shown = cr || n >= N ? 100000 : val;
    if (n > 0) {
      L.tx(ctx, 'مُعاد توجيهها', 1330, 150, 60, '#9FB6F0', { weight: 700 });
      const pk = 1 + 0.15 * Math.exp(-(t - S.fwd[n - 1].t) * 14);
      ctx.save(); ctx.translate(1330, 270); ctx.scale(pk, pk); L.tx(ctx, shown.toLocaleString('en-US') + ' مرة', 0, 0, 120, cr ? C.red : '#fff', { glow: cr ? 'rgba(224,72,58,0.9)' : null }); ctx.restore();
    }
    ctx.restore();
    if (cr) { // the screen cracks like glass
      const a = clamp((t - ev.crack) / 0.12); ctx.fillStyle = `rgba(120,10,10,${0.22})`; ctx.fillRect(0, 0, W, H);
      ctx.lineCap = 'round'; const ox = 900, oy = 520;
      for (let i = 0; i < 18; i++) {
        let ang = (i / 18) * 6.283 + U.hash(i, 31) * 0.3, x = ox, y = oy; const len = (500 + 900 * U.hash(i, 32)) * a;
        ctx.strokeStyle = `rgba(235,245,255,${0.55 + 0.4 * U.hash(i, 33)})`; ctx.lineWidth = 2 + 4 * U.hash(i, 34); ctx.beginPath(); ctx.moveTo(x, y);
        for (let s = 0; s < 7; s++) { ang += (U.hash(i, s, 35) - 0.5) * 0.5; x += Math.cos(ang) * len / 7; y += Math.sin(ang) * len / 7; ctx.lineTo(x, y); if (s === 3 && i % 2) { ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang + 1) * len * 0.18, y + Math.sin(ang + 1) * len * 0.18); ctx.moveTo(x, y); } }
        ctx.stroke();
      }
      for (const r of [130, 290, 480]) { ctx.strokeStyle = 'rgba(235,245,255,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 18; i++) { const an = (i / 18) * 6.283, rr = r * a * (0.85 + 0.3 * U.hash(i % 18, r)); i ? ctx.lineTo(ox + Math.cos(an) * rr, oy + Math.sin(an) * rr) : ctx.moveTo(ox + Math.cos(an) * rr, oy + Math.sin(an) * rr); } ctx.stroke(); }
    }
    L.flash(ctx, t, ev.crack, '255,255,255', 0.9, 9);
  };

  // ---------- 8. الحساب المزيّف والابتزاز ----------
  SC[8] = (ctx, t, u) => {
    coldBg(ctx, t);
    const fall = t - ev.mask, off = fall > 0;
    // the farm behind the mask
    if (off) {
      const a = clamp(fall / 0.8);
      for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
        const k = clamp(a * 3 - (r + c) * 0.12); if (k <= 0) continue;
        const x = 120 + c * 150, y = 190 + r * 150; ctx.globalAlpha = 0.85 * k;
        L.rr(ctx, x - 56, y - 56, 112, 112, 18, '#121A36', '#2A3868', 3); avatar(ctx, x, y, 44, '#3A4670');
        const bl = Math.sin(t * 6 + r * 2 + c) > 0.2; ctx.fillStyle = bl ? C.red : '#5a1a16'; ctx.beginPath(); ctx.arc(x + 38, y - 38, 7, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      }
      L.pop(ctx, t, ev.mask + 0.5, 'مزرعة حسابات', 570, 960, 64, C.red, { glow: 'rgba(224,72,58,0.6)' });
    }
    // the profile card
    const shrink = off ? ease.outCubic(clamp(fall / 0.6)) : 0, px = lerp(600, 570, shrink), ps = lerp(1, 0.86, shrink);
    ctx.save(); ctx.translate(px, 520); ctx.scale(ps, ps);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 50; L.rr(ctx, -330, -300, 660, 600, 36, '#16203E', off ? C.red : '#3F5FB8', 5); ctx.shadowColor = 'transparent';
    ctx.fillStyle = off ? '#2A0F14' : '#27407E'; ctx.beginPath(); ctx.roundRect(-330, -300, 660, 170, [36, 36, 0, 0]); ctx.fill();
    ctx.fillStyle = '#0D1326'; ctx.beginPath(); ctx.arc(0, -130, 112, 0, 7); ctx.fill(); ctx.strokeStyle = off ? C.red : '#fff'; ctx.lineWidth = 6; ctx.stroke();
    avatar(ctx, 0, -130, 86, '#2A3358');
    if (off) { ctx.fillStyle = C.red; for (const ex of [-22, 22]) { ctx.beginPath(); ctx.arc(ex, -156, 7 + 2 * Math.sin(t * 9), 0, 7); ctx.fill(); } }
    L.tx(ctx, 'مواطن غيور', 0, 60, 70, '#fff', { shadow: false });
    L.tx(ctx, '@user_839201', 0, 116, 34, '#8FA6E6', { weight: 700, shadow: false });
    for (let i = 0; i < 3; i++) L.rr(ctx, -270, 160 + i * 42, 540 - i * 110, 22, 11, '#27335C');
    ctx.restore();
    // the mask: a friendly face that falls away
    ctx.save();
    const my = off ? 390 + 900 * fall * fall : 390 + 4 * Math.sin(t * 2), mr = off ? fall * 2.2 : 0;
    ctx.translate(600 + (off ? 160 * fall : 0), my); ctx.rotate(mr);
    ctx.fillStyle = '#F2E4CF'; ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 0, 92, 112, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-96, -40); ctx.quadraticCurveTo(0, -150, 96, -40); ctx.quadraticCurveTo(0, -86, -96, -40); ctx.fill(); ctx.stroke(); // a ghutra-like top
    ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-88, -62); ctx.quadraticCurveTo(0, -104, 88, -62); ctx.stroke();
    ctx.fillStyle = '#0D1326'; for (const ex of [-34, 34]) { ctx.beginPath(); ctx.ellipse(ex, -8, 15, 10, 0, 0, 7); ctx.fill(); }
    ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 26, 40, 0.25, Math.PI - 0.25); ctx.stroke();
    ctx.restore();
    // the blackmail message
    if (t >= ev.threat) {
      const a = t - ev.threat, k = ease.outBack(clamp(a / 0.3), 1.5);
      Ch.person(ctx, { x: 1630, y: 1330, pose: 'stand', s: 1.75, gesture: 'phone', eyes: 'wide', brows: 'worried', mouth: 'o', lookY: 0.7, look: -0.4, style: { skin: '#D9A77C', hairStyle: 'hijab', hijab: '#6C5B7B', outfit: 'abaya', robe: '#1B1B26' } });
      ctx.fillStyle = 'rgba(5,10,34,0.45)'; ctx.fillRect(1380, 300, 540, 780);
      ctx.save(); ctx.translate(1420, 330); ctx.scale(k, k); ctx.rotate(0.03);
      L.rr(ctx, -330, -130, 660, 260, 30, '#2A0F14', C.red, 5);
      L.tx(ctx, 'رقم مجهول', 290, -70, 34, '#E58A7E', { align: 'right', weight: 700, shadow: false });
      L.tx(ctx, 'ادفعي… وإلا نشرتُ صورك', 290, 10, 54, '#fff', { align: 'right', shadow: false });
      L.tx(ctx, 'ابتزاز إلكتروني', 290, 88, 40, C.red, { align: 'right', shadow: false });
      ctx.restore();
      L.glow(ctx, 1420, 330, 500, 'rgba(224,72,58,0.35)', Math.exp(-a * 3));
    }
    L.flash(ctx, t, ev.mask, '255,255,255', 0.35, 9);
  };

  // ---------- 9. المخدرات ----------
  const KIDS = [
    { dx: -230, style: { skin: '#C98F62', hair: '#17110e', hairStyle: 'short', outfit: 'thobe', robe: '#F4F1E8' }, mouth: 'smile' },
    { dx: 0, style: { skin: '#B67B4E', hair: '#17110e', hairStyle: 'quiff', outfit: 'shirt', shirt: '#2F6B53', bottoms: 'pants', shorts: '#2b2b33' }, mouth: 'grin' },
    { dx: 230, style: { skin: '#D9A77C', hairStyle: 'hijab', hijab: '#B5838D', outfit: 'abaya', robe: '#23232E' }, mouth: 'smile' },
  ];
  SC[9] = (ctx, t, u) => {
    const d = sc[9].t1 - sc[9].t0, p = u / d;
    ctx.fillStyle = '#04060E'; ctx.fillRect(0, 0, W, H);
    L.glow(ctx, 960, 640, 620, 'rgba(255,226,170,0.95)', 0.95, 'source-over');
    ctx.fillStyle = 'rgba(255,220,160,0.25)'; ctx.beginPath(); ctx.ellipse(960, 900, 430, 60, 0, 0, 7); ctx.fill();
    KIDS.forEach((k, i) => Ch.person(ctx, { x: 960 + k.dx, y: 900, pose: 'stand', s: 1.15, eyes: 'happy', mouth: k.mouth, look: i === 0 ? 0.6 : i === 2 ? -0.6 : 0, gesture: i === 1 ? 'wave' : undefined, style: k.style }));
    // the dark closes in: pills and capsules creeping from every edge, stopping at the light
    for (let i = 0; i < 46; i++) {
      const ang = (i / 46) * 6.283 + U.hash(i, 51), r0 = 1250, r1 = 520 + 110 * U.hash(i, 52), r = lerp(r0, r1, ease.outCubic(clamp(p * 1.25 - U.hash(i, 53) * 0.25)));
      const x = 960 + Math.cos(ang) * r * 1.25, y = 620 + Math.sin(ang) * r * 0.78;
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang + t * 0.4 * (i % 2 ? 1 : -1)); const s = 0.8 + 0.8 * U.hash(i, 54);
      if (i % 3) { L.cap(ctx, -22 * s, 0, 22 * s, 0, 30 * s, '#0b0b12'); L.cap(ctx, -22 * s, 0, 0, 0, 22 * s, '#7A1E2A'); L.cap(ctx, 4 * s, 0, 22 * s, 0, 22 * s, '#C9C2B8'); }
      else { ctx.fillStyle = '#0b0b12'; ctx.beginPath(); ctx.arc(0, 0, 24 * s, 0, 7); ctx.fill(); ctx.fillStyle = '#B9B2A8'; ctx.beginPath(); ctx.arc(0, 0, 19 * s, 0, 7); ctx.fill(); ctx.fillStyle = '#0b0b12'; ctx.fillRect(-17 * s, -2, 34 * s, 4); }
      ctx.restore();
    }
    const v = ctx.createRadialGradient(960, 620, 380, 960, 620, 1100); v.addColorStop(0, 'rgba(4,6,14,0)'); v.addColorStop(1, 'rgba(4,6,14,0.92)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    L.pop(ctx, t, sc[9].t0 + 2.2, 'أغلى ما نملك: شبابنا', W / 2, 170, 96, C.goldHi, { glow: 'rgba(0,0,0,0.9)' });
    const hb = ((u / BAR) % 1); ctx.fillStyle = `rgba(160,20,30,${0.10 * Math.exp(-hb * 5)})`; ctx.fillRect(0, 0, W, H);
  };

  // ---------- 10. اللحظة الفاصلة ----------
  SC[10] = (ctx, t, u) => {
    const stopped = t >= ev.stop, a = stopped ? t - ev.stop : 0, wide = stopped && a > 1.5;
    if (!wide) {
      const warm = clamp(a / 1.2);
      L.sky(ctx, [stopped ? `rgb(${Math.round(lerp(5, 60, warm))},${Math.round(lerp(8, 40, warm))},${Math.round(lerp(20, 20, warm))})` : '#050814', stopped ? `rgb(${Math.round(lerp(11, 150, warm))},${Math.round(lerp(26, 96, warm))},${Math.round(lerp(68, 40, warm))})` : '#0B1A44']);
      let hbK = 0; for (const h of ev.heart) if (t >= h) hbK = Math.exp(-(t - h) * 6);
      // the screen, very close
      const drop = stopped ? ease.inCubic(clamp(a / 0.45)) : 0;
      L.rr(ctx, 380, 60, 1160, 1200, 70, '#0F1626', '#3b4152', 10);
      ctx.save(); ctx.translate(960 + drop * 1700, 350 + drop * 60); ctx.rotate(drop * 0.5); ctx.scale(1.9, 1.9); rumor(ctx, -220, -125, 440); ctx.restore();
      const bx = 960, by = 760, pulse = 1 + 0.05 * hbK;
      ctx.save(); ctx.translate(bx, by); ctx.scale(pulse, pulse); ctx.globalAlpha = 1 - clamp(a / 0.3);
      L.glow(ctx, 0, 0, 420, 'rgba(224,72,58,0.5)', 0.4 + 0.6 * hbK);
      L.rr(ctx, -330, -75, 660, 150, 75, '#C13A2E', '#FF9A8E', 5); L.tx(ctx, 'إعادة توجيه  ↪', 0, 24, 72, '#fff', { shadow: false });
      ctx.restore();
      if (stopped) { const k = ease.outBack(clamp((a - 0.25) / 0.35), 1.6); if (k > 0) { ctx.save(); ctx.translate(960, 480); ctx.scale(k, k); ctx.strokeStyle = C.goldHi; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.arc(0, 0, 170, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-80, 5); ctx.lineTo(-22, 66); ctx.lineTo(88, -62); ctx.stroke(); ctx.restore(); L.pop(ctx, t, ev.stop + 0.4, 'توقّف… وتثبّت', 960, 800, 100, '#fff'); } }
      // the thumb: closer with every heartbeat, then it pulls away
      const near = clamp(u / (ev.stop - sc[10].t0)), trem = U.noise1(t * 14, 4) * 5 * near;
      const ty = stopped ? lerp(870, 1500, ease.outCubic(clamp(a / 0.7))) : lerp(1200, 870, ease.inOutQuad(near)) - 26 * hbK;
      L.hand(ctx, { x: 1034 + trem, y: ty + 428, s: 2.3, rot: 0.8, skin: '#C98F62', curl: [1, 1, 1, 1], thumb: 1.5, spread: 0.02, arm: 900, sleeve: '#2E3A55', sleeveFrom: 170 });
      if (!stopped) { ctx.fillStyle = `rgba(160,20,30,${0.12 * hbK})`; ctx.fillRect(0, 0, W, H); }
      L.flash(ctx, t, ev.stop, '255,244,214', 0.7, 6);
    } else {
      // he lifts his head: warm light comes back
      const k = clamp((a - 1.5) / 1.2);
      L.sky(ctx, ['#F3C679', '#F7DFA6', '#EBD9A8']);
      ctx.save(); ctx.translate(960, 620); ctx.rotate(t * 0.05); G.rays(ctx, 0, 0, { n: 18, r0: 200, r1: 1500, color: 'rgba(255,255,255,0.22)', lw: 60, alpha: 1 }); ctx.restore();
      L.glow(ctx, 960, 520, 700, 'rgba(255,250,220,0.9)', 0.8, 'source-over');
      Ch.person(ctx, { x: 960, y: 1560, pose: 'stand', s: 2.6, eyes: k > 0.5 ? 'happy' : 'normal', lookY: lerp(0.8, -0.5, ease.outCubic(k)), headRot: lerp(0.12, -0.03, k), mouth: k > 0.5 ? 'smile' : 'flat', brows: 'determined', style: L.youth });
      L.dust(ctx, t, 50, '255,255,255', 6);
      const f = 1 - clamp((a - 1.5) / 0.35); if (f > 0) { ctx.fillStyle = `rgba(255,244,214,${f})`; ctx.fillRect(0, 0, W, H); }
    }
  };

  // ---------- 11. ثلاث قواعد ----------
  const DAD = { skin: '#B67B4E', hair: '#2a2622', facialHair: 'trimmed', outfit: 'thobe', robe: '#F7F4EC', headwear: 'ghutra', build: 'regular' };
  const GIRL = { skin: '#D9A77C', hairStyle: 'hijab', hijab: '#2F6B53', outfit: 'abaya', robe: '#20202B' };
  const MOM = { skin: '#C98F62', hairStyle: 'hijab', hijab: '#7B5E57', outfit: 'abaya', robe: '#2A2230' };
  const SON = { skin: '#C98F62', hair: '#17110e', hairStyle: 'short', outfit: 'thobe', robe: '#F4F1E8', build: 'slim' };
  const RULES = ['تثبّت', 'بلّغ', 'احمِ بيتك'], SUB = ['لا تنشر قبل أن تتثبّت', 'بلّغ ولا تجادل', 'البيت المترابط لا تدخله الفتنة'];
  const goldCard = (ctx, t, t0, x, y, w, h, word, sub, size) => {
    if (t < t0) return; const k = ease.outBack(clamp((t - t0) / 0.3), 1.5);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-0.015);
    ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, C.goldHi); g.addColorStop(1, C.gold); L.rr(ctx, -w / 2, -h / 2, w, h, 30, g); ctx.shadowColor = 'transparent';
    L.rr(ctx, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 20, null, C.greenDark, 4);
    L.tx(ctx, word, 0, sub ? size * 0.12 : size * 0.33, size, C.greenDark, { shadow: false });
    if (sub) L.tx(ctx, sub, 0, h / 2 - 44, 40, '#3E2B08', { weight: 700, shadow: false });
    ctx.restore();
  };
  SC[11] = (ctx, t, u) => {
    L.sky(ctx, ['#F6E7C2', '#F1DCAA', '#E6CB8F']);
    ctx.fillStyle = '#0E5A3A'; ctx.fillRect(0, 880, W, 200); ctx.fillStyle = C.gold; ctx.fillRect(0, 874, W, 8);
    let idx = 0; ev.cards.forEach((c, i) => { if (t >= c) idx = i; });
    if (t >= ev.cardsAll) { // the three rules together
      RULES.forEach((w, i) => goldCard(ctx, t, ev.cardsAll + i * 0.12, W - 390 - i * 570, 430, 500, 330, w, null, i === 2 ? 110 : 150));
      L.pop(ctx, t, ev.cardsAll + 0.5, 'بلّغ عبر القنوات الرسمية', W / 2, 760, 70, C.greenDark, { shadow: false });
      L.flash(ctx, t, ev.cardsAll, '255,244,214', 0.6, 8); return;
    }
    const t0 = ev.cards[idx], a = t - t0, bob = Math.sin(t * 2) * 3;
    if (idx === 0) {
      Ch.person(ctx, { x: 520, y: 1010, pose: 'stand', s: 1.9, gesture: 'phone', eyes: 'normal', lookY: 0.5, look: 0.4, mouth: a > 1.6 ? 'smile' : 'flat', style: DAD });
      ctx.save(); ctx.translate(900, 300 + bob); const k = ease.outBack(clamp((a - 0.5) / 0.3), 1.4); ctx.scale(k, k);
      L.rr(ctx, -170, -120, 400, 250, 26, '#fff', C.green, 5); ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(150, -50, 44, 0, 7); ctx.fill(); avatar(ctx, 150, -50, 34, '#fff');
      L.tx(ctx, 'حساب رسمي', 90, -38, 42, C.greenDark, { align: 'right', shadow: false });
      for (let i = 0; i < 2; i++) L.rr(ctx, -140, 30 + i * 36, 330 - i * 90, 18, 9, '#D8D2C2');
      const ck = clamp((a - 1.2) / 0.35); if (ck > 0) { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(-110, -50, 40 * ease.outBack(ck, 2), 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-128, -50); ctx.lineTo(-114, -34); ctx.lineTo(-90, -66); ctx.stroke(); }
      ctx.restore();
    } else if (idx === 1) {
      Ch.person(ctx, { x: 520, y: 1010, pose: 'stand', s: 1.9, gesture: 'phone', eyes: 'normal', brows: 'determined', lookY: 0.5, look: 0.4, mouth: a > 1.4 ? 'smile' : 'flat', style: GIRL });
      ctx.save(); ctx.translate(900, 300 + bob); const k = ease.outBack(clamp((a - 0.4) / 0.3), 1.4); ctx.scale(k, k);
      L.rr(ctx, -170, -130, 400, 280, 26, '#fff', C.red, 5); ctx.fillStyle = '#3A4670'; ctx.beginPath(); ctx.arc(150, -60, 44, 0, 7); ctx.fill(); avatar(ctx, 150, -60, 34, '#7A89B8');
      L.tx(ctx, 'حساب مشبوه', 90, -48, 40, '#8A2A22', { align: 'right', shadow: false });
      const done = a > 1.3, press = done ? 1 - 0.08 * Math.exp(-(a - 1.3) * 10) : 1;
      ctx.save(); ctx.translate(30, 80); ctx.scale(press, press); L.rr(ctx, -150, -44, 300, 88, 44, done ? C.green : C.red); L.tx(ctx, done ? 'تم البلاغ ✓' : 'إبلاغ', 0, 16, 46, '#fff', { shadow: false }); ctx.restore();
      if (done) { const r = (a - 1.3) * 300; if (r < 240) { ctx.strokeStyle = `rgba(14,90,58,${1 - r / 240})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(30, 80, r, 0, 7); ctx.stroke(); } }
      ctx.restore();
    } else {
      // a home: a gold roofline over a mother and her son, talking
      ctx.strokeStyle = C.goldDark; ctx.lineWidth = 16; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      const hk = ease.outCubic(clamp(a / 0.8)); ctx.setLineDash([hk * 2600, 2600]); ctx.beginPath(); ctx.moveTo(170, 874); ctx.lineTo(170, 420); ctx.lineTo(590, 150); ctx.lineTo(1010, 420); ctx.lineTo(1010, 874); ctx.stroke(); ctx.setLineDash([]);
      L.glow(ctx, 590, 600, 460, 'rgba(255,240,200,0.9)', 0.7, 'source-over');
      L.rr(ctx, 280, 560, 620, 200, 40, '#7E2F25', C.ink, 6); L.rr(ctx, 250, 700, 680, 90, 30, '#9C3B2E', C.ink, 6); L.rr(ctx, 280, 786, 30, 94, 6, '#5a2a1c', C.ink, 5); L.rr(ctx, 870, 786, 30, 94, 6, '#5a2a1c', C.ink, 5); // a sofa
      Ch.person(ctx, { x: 720, y: 700, pose: 'sit', s: 1.15, eyes: 'happy', mouth: Math.sin(t * 7) > 0 ? 'smile' : 'open', look: -0.6, handL: [-90, -150 + 10 * Math.sin(t * 3)], style: MOM });
      Ch.person(ctx, { x: 470, y: 716, pose: 'sit', s: 0.95, eyes: 'happy', mouth: 'smile', look: 0.7, headRot: 0.05 * Math.sin(t * 2), style: SON });
      const hb = (a * 0.6) % 1; ctx.save(); ctx.translate(596, 400 - hb * 110); ctx.globalAlpha = (1 - hb) * clamp(a - 0.8); G.heart(ctx, 0, 0, 2.4 + 1.2 * hb); ctx.restore();
    }
    goldCard(ctx, t, t0, 1440, 430, 720, 440, RULES[idx], SUB[idx], idx === 2 ? 150 : 210);
    L.flash(ctx, t, t0, '255,244,214', 0.6, 8);
  };

  // ---------- 12. الأيدي ----------
  const PAIRS = [
    { bg: ['#F3C679', '#E9A867'], A: { skin: '#B67B4E', sleeve: '#F4F1E8' }, B: { skin: '#D9A77C', sleeve: '#F4F1E8', size: 0.72 } },
    { bg: ['#DCE9E2', '#A9CDB9'], A: { skin: '#C98F62', sleeve: '#3D4A66', cuff: '#fff' }, B: { skin: '#C98F62', sleeve: '#F4F1E8', size: 0.82 } },
    { bg: ['#C9C3A2', '#8E8F62'], A: { skin: '#A0683F', sleeve: '#5E6B3C', cuff: '#3F4A28' }, B: { skin: '#C98F62', sleeve: '#F4F1E8' } },
    { bg: ['#DDEEF0', '#9FD0D2'], A: { skin: '#D9A77C', sleeve: '#FFFFFF', cuff: '#2F8F8A' }, B: { skin: '#B67B4E', sleeve: '#F4F1E8' } },
    { bg: ['#BFE3EE', '#5FA8C9'], A: { skin: '#8A5632', sleeve: '#2F6F9A' }, B: { skin: '#C98F62', sleeve: '#F4F1E8' } },
    { bg: ['#E7D9A8', '#9BB267'], A: { skin: '#A0683F', sleeve: '#B98A52' }, B: { skin: '#D9A77C', sleeve: '#F4F1E8' } },
  ];
  const MAN = (i) => ({ skin: C.skin[i % 4], hair: '#201a16', facialHair: i % 2 ? 'trimmed' : 'mustache', outfit: 'thobe', robe: '#F7F4EC', headwear: 'ghutra' });
  SC[12] = (ctx, t, u) => {
    if (t < ev.ardah) {
      let i = 0; ev.clasps.forEach((c, k) => { if (t >= c) i = k; });
      const P = PAIRS[i], a = t - ev.clasps[i];
      L.sky(ctx, P.bg);
      ctx.save(); ctx.translate(W / 2, 480); ctx.rotate(t * 0.08); G.rays(ctx, 0, 0, { n: 16, r0: 160, r1: 1500, color: 'rgba(255,255,255,0.2)', lw: 70, alpha: 1 }); ctx.restore();
      L.clasp(ctx, W / 2, 500, 1.45, a / 0.22, P.A, P.B);
      L.pop(ctx, t, ev.clasps[i] + 0.2, S.CLASPS[i], W / 2, 250, 92, C.greenDark, { shadow: false });
      L.flash(ctx, t, ev.clasps[i] + 0.2, '255,255,255', 0.5, 12);
      return;
    }
    // the ardah: one row, one sway, swords up
    const a = t - ev.ardah, sway = Math.sin((a / BEAT) * Math.PI / 2 * 1) , beat = Math.exp(-((a / BEAT) % 1) * 4);
    L.sky(ctx, ['#0A4A30', '#0E5A3A', '#1E8A5A']);
    ctx.save(); ctx.translate(W / 2, 900); ctx.rotate(Math.sin(t * 0.3) * 0.05); G.rays(ctx, 0, 0, { n: 20, r0: 100, r1: 1700, color: 'rgba(231,185,84,0.16)', lw: 70, alpha: 1 }); ctx.restore();
    L.glow(ctx, W / 2, 900, 900, 'rgba(255,220,140,0.6)', 0.6 + 0.3 * beat);
    ctx.fillStyle = '#E9C58A'; ctx.fillRect(0, 960, W, 120); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(0, 960, W, 14);
    const enter = ease.outCubic(clamp(a / 0.6));
    for (let i = 8; i >= 0; i--) {
      const sz = 1.0, x = 140 + i * 205 + sway * 26, y = 1010 + (1 - enter) * 500 - 10 * beat;
      const hx = 110 + sway * 20, hy = -430 - 14 * beat;
      Ch.person(ctx, { x, y, pose: 'stand', s: sz, rot: sway * 0.05, eyes: 'happy', mouth: 'open', handR: [hx, hy], style: MAN(i) });
      ctx.save(); ctx.translate(x + hx * sz, y + hy * sz); ctx.rotate(0.2 + sway * 0.22);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 15; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 16); ctx.quadraticCurveTo(22, -90, 6, -190); ctx.stroke();
      ctx.strokeStyle = '#E9EEF2'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 16); ctx.quadraticCurveTo(22, -90, 6, -190); ctx.stroke();
      L.cap(ctx, -22, 14, 22, 8, 12, C.gold); ctx.restore();
    }
    L.pop(ctx, t, ev.ardah + 0.15, 'نحن يدٌ واحدة', W / 2, 300, 130, C.goldHi, { glow: 'rgba(0,0,0,0.6)' });
    G.confetti(ctx, t, ev.ardah, { n: 90, seed: 5, spawn: 5 });
    L.flash(ctx, t, ev.ardah, '255,244,214', 0.8, 7);
  };

  // ---------- 13. الختام ----------
  SC[13] = (ctx, t, u) => {
    const close = t >= ev.grasp;
    if (!close) {
      const p = u / (ev.grasp - sc[13].t0);
      L.sky(ctx, ['#4E8FD0', '#9CC7E8', '#F5E3B5']);
      L.glow(ctx, 1500, 260, 700, 'rgba(255,246,210,0.95)', 0.9, 'source-over');
      ctx.save(); const z = 1 + 0.08 * p; ctx.translate(W / 2, 760); ctx.scale(z, z); ctx.translate(-W / 2, -760);
      ctx.save(); ctx.translate(0, -70 + p * 20); L.riyadh(ctx, t, 1, 0); ctx.restore(); // today's towers, behind
      ctx.fillStyle = 'rgba(245,227,181,0.45)'; ctx.fillRect(-100, 560, W + 200, 300);
      for (let i = 0; i < 12; i++) { const w = 130 + 110 * U.hash(i, 23); L.najdi(ctx, -160 + i * 190 - p * 30, 880, w, 110 + 190 * U.hash(i, 28), i % 2 ? '#8A5630' : '#9A6238', 23 + i); }
      ctx.fillStyle = '#5D3A1E'; ctx.fillRect(-200, 876, W + 400, 300);
      for (let i = 0; i < 10; i++) L.palm(ctx, -60 + i * 230 + 80 * U.hash(i, 44), 990 + 50 * U.hash(i, 45), 1 + 0.5 * U.hash(i, 46), '#1F4423', Math.sin(t * 0.9 + i));
      // green banners in the wind
      for (let i = 0; i < 5; i++) { const x = 250 + i * 360, y = 880 - (110 + 190 * U.hash(i, 90)) - 20; ctx.strokeStyle = '#3A2414'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x, y + 40); ctx.lineTo(x, y - 170); ctx.stroke(); ctx.fillStyle = C.green; ctx.beginPath(); ctx.moveTo(x, y - 170); for (let k = 0; k <= 8; k++) ctx.lineTo(x + k * 20, y - 170 + 9 * Math.sin(t * 5 + k * 0.8 + i) * (k / 8)); for (let k = 8; k >= 0; k--) ctx.lineTo(x + k * 20, y - 86 + 9 * Math.sin(t * 5 + k * 0.8 + i + 0.5) * (k / 8)); ctx.fill(); }
      ctx.restore();
      L.dust(ctx, t, 50, '255,255,255', 14);
      L.flash(ctx, t, ev.final, '255,244,214', 0.9, 5);
      return;
    }
    // the first hand, still wet with clay, held by today's hand
    const a = t - ev.grasp, ti = t >= ev.title;
    L.sky(ctx, ['#F3C679', '#E9A867', '#B9682E']);
    ctx.save(); ctx.translate(W / 2, 640); ctx.rotate(t * 0.06); G.rays(ctx, 0, 0, { n: 18, r0: 180, r1: 1600, color: 'rgba(255,240,200,0.25)', lw: 70, alpha: 1 }); ctx.restore();
    L.glow(ctx, W / 2, 640, 800, 'rgba(255,244,214,0.9)', 0.8, 'source-over');
    if (ti) { ctx.fillStyle = `rgba(8,48,31,${0.55 * clamp((t - ev.title) / 0.5)})`; ctx.fillRect(0, 0, W, H); }
    L.clasp(ctx, W / 2, ti ? 700 : 600, 1.5, a / 0.5, { skin: '#8A5632', sleeve: '#B98A52' }, { skin: '#C98F62', sleeve: '#F7F4EC', cuff: C.gold });
    if (a > 0.5) { ctx.globalAlpha = 0.85; for (let i = 0; i < 9; i++) { ctx.fillStyle = C.clayDark; ctx.beginPath(); ctx.ellipse(W / 2 - 330 + i * 34 + 20 * U.hash(i, 3), (ti ? 700 : 600) + 20 + 50 * U.hash(i, 4) - 20, 16 + 12 * U.hash(i, 5), 9, 0.3, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
    L.dust(ctx, t, 60, '255,236,190', 15);
    L.pop(ctx, t, ev.title, 'يد واحدة', W / 2, 330, 230, C.goldHi, { glow: 'rgba(0,0,0,0.7)' });
    L.pop(ctx, t, ev.title + 2 * BEAT, 'نحمي الوطن', W / 2, 460, 100, '#fff');
    L.flash(ctx, t, ev.grasp, '255,244,214', 0.5, 8); L.flash(ctx, t, ev.title, '255,244,214', 0.9, 6);
  };
})();
