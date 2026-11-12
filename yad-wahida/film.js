// «يد واحدة» — THE FILM: picks the scene for frame t and fits the 1920×1080 stage to the real frame.
// 16:9: the stage as it is, with letterbox bars in chapters one and five.
// 9:16: each scene is re-framed on its subject inside a 4:5 block, wide elements (the kings, the counter,
//       the rule cards) are re-staged vertically, and everything stays inside the platforms' safe area.
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, L = globalThis.L, Studio = globalThis.Studio;
  const { clamp, ease } = U;
  const { sc, ev, BEAT } = S;
  const FW = G.W, FH = G.H, V = L.V, C = L.C;
  const BARS = { 1: 1, 2: 1, 3: 1, 12: 1, 13: 1 }; // cinematic 2.39:1 in chapters one and five (16:9 only)
  const DIP = { 2: 1, 4: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1 }; // a short dip from black at these scene starts

  // ---------- 9:16 framing: stage point (fx, fy) lands on (540, dy), scaled by k ----------
  const BY = 190, BH = 1350; // the 4:5 picture block
  const VC = { 1: { fx: 1000 }, 4: { k: 1, fy: 420, dy: 640, fill: '#0C4A31' }, 6: { fx: 880 }, 7: { k: 1.05, fx: 440, fy: 560, dy: 1010, fill: '#0A1230' }, 8: { k: 1.15, fx: 570, fill: '#0A1230' }, 11: { fx: 700 } };
  const cfg = (i, t) => { const c = { k: 1.25, fx: 960, fy: 540, dy: BY + BH / 2, ...(VC[i] || {}) }; if (i === 11 && t >= ev.cards[2]) c.fx = 590; if (i === 11 && t >= ev.cardsAll) c.fx = 960; if (i === 10 && t < ev.stop + 1.5) { c.k = 1.12; c.fill = '#070B18'; } return c; };
  let off = null;

  const OVER = { // elements re-staged for the vertical frame (frame coordinates)
    4(ctx, t) {
      S.KINGS.forEach((k, i) => {
        const y = 1050 + i * 86, on = t >= ev.kings[i];
        ctx.fillStyle = on ? C.goldHi : 'rgba(231,185,84,0.35)'; ctx.beginPath(); ctx.arc(930, y - 16, on ? 13 : 8, 0, 7); ctx.fill();
        if (i < 4) { ctx.strokeStyle = 'rgba(231,185,84,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(930, y); ctx.lineTo(930, y + 54); ctx.stroke(); }
        if (!on) return;
        const a = clamp((t - ev.kings[i]) / 0.2);
        L.tx(ctx, k.name, 890, y, 56, '#fff', { align: 'right', alpha: a });
        L.tx(ctx, k.years, 150, y, 38, C.goldHi, { align: 'left', weight: 700, alpha: a });
      });
    },
    7(ctx, t) {
      const n = S.fwd.filter((f) => f.t <= t).length, N = S.fwd.length, cr = t >= ev.crack;
      if (!n) return;
      const shown = cr || n >= N ? 100000 : Math.round(Math.pow(10, 1 + 4 * (n / N)));
      L.tx(ctx, 'مُعاد توجيهها', 540, 370, 56, '#9FB6F0', { weight: 700 });
      const pk = 1 + 0.15 * Math.exp(-(t - S.fwd[n - 1].t) * 14);
      ctx.save(); ctx.translate(540, 480); ctx.scale(pk, pk); L.tx(ctx, shown.toLocaleString('en-US') + ' مرة', 0, 0, 110, cr ? C.red : '#fff', { glow: cr ? 'rgba(224,72,58,0.9)' : null }); ctx.restore();
    },
    11(ctx, t) {
      if (t >= ev.cardsAll) {
        L.RULES.forEach((w, i) => L.goldCard(ctx, t, ev.cardsAll + i * 0.12, 540, 420 + i * 300, 760, 250, w, null, 130));
        L.pop(ctx, t, ev.cardsAll + 0.5, 'بلّغ عبر القنوات الرسمية', 540, 1340, 62, C.greenDark, { shadow: false });
        return;
      }
      let idx = 0; ev.cards.forEach((c, i) => { if (t >= c) idx = i; });
      L.goldCard(ctx, t, ev.cards[idx], 540, 1250, 800, 290, L.RULES[idx], L.SUB[idx], 140);
    },
  };

  function watermark(ctx, t) { // the author's name and one account, rotating
    const A = S.CREDIT.accounts, a = A[Math.floor(t / 7) % A.length], x = V ? 930 : FW - 60, y = V ? 262 : 60;
    L.tx(ctx, S.CREDIT.name, x, y, V ? 34 : 32, '#fff', { align: 'right', weight: 700, alpha: 0.85 });
    L.tx(ctx, `${a[0]}  ${a[1]}`, x, y + (V ? 42 : 40), V ? 28 : 26, C.goldHi, { align: 'right', weight: 700, alpha: 0.85 });
  }
  function credits(ctx, t) { // the rights + accounts card
    const a = clamp((t - ev.credits) / 0.6); if (a <= 0) return;
    const g = ctx.createLinearGradient(0, 0, 0, FH); g.addColorStop(0, '#0B3B28'); g.addColorStop(1, '#06241A');
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(0, 0, FW, FH); ctx.restore();
    const cx = FW / 2, y0 = V ? 560 : 250, K = S.CREDIT, T0 = ev.credits + 0.35;
    L.pop(ctx, t, T0, 'يد واحدة', cx, y0, V ? 120 : 110, C.goldHi);
    L.pop(ctx, t, T0 + 0.15, K.role, cx, y0 + (V ? 110 : 90), 40, '#CFE3D8', { weight: 700 });
    L.pop(ctx, t, T0 + 0.25, K.name, cx, y0 + (V ? 210 : 185), V ? 84 : 80, '#fff');
    ctx.fillStyle = C.gold; ctx.globalAlpha = clamp((t - T0 - 0.3) / 0.3); ctx.fillRect(cx - 160, y0 + (V ? 250 : 222), 320, 4); ctx.globalAlpha = 1;
    K.accounts.forEach((ac, i) => {
      const x = V ? cx : cx + (i % 2 ? 330 : -330), y = V ? y0 + 350 + i * 96 : y0 + 330 + Math.floor(i / 2) * 100, tt = T0 + 0.45 + i * 0.12;
      if (t < tt) return; const al = clamp((t - tt) / 0.25);
      L.tx(ctx, ac[0], x, y - 44, 26, C.goldHi, { weight: 700, alpha: al });
      L.tx(ctx, ac[1], x, y, V ? 50 : 46, '#fff', { alpha: al });
    });
    L.tx(ctx, K.rights, cx, V ? 1400 : 830, V ? 34 : 38, '#CFE3D8', { weight: 700, alpha: clamp((t - T0 - 1) / 0.4) });
    L.tx(ctx, K.year, cx, V ? 1452 : 884, V ? 30 : 32, C.goldHi, { weight: 700, alpha: clamp((t - T0 - 1) / 0.4) });
  }

  Studio.film({
    draw(ctx, t) {
      let i = 1; for (let k = 1; k <= 13; k++) if (t >= sc[k].t0) i = k;
      const u = t - sc[i].t0, scene = L.SCENES[i];
      if (!V) {
        ctx.save(); scene(ctx, t, u); ctx.restore();
        if (BARS[i]) L.bars(ctx, i === 12 ? clamp(u / 0.5) : 1);
        else if (i === 4) L.bars(ctx, 1 - clamp(u / 0.5));
      } else {
        const c = cfg(i, t);
        // backdrop: the same scene, soft and dark, filling the whole frame
        if (!off) { off = document.createElement('canvas'); off.width = 384; off.height = 216; }
        const o = off.getContext('2d'); o.save(); o.clearRect(0, 0, 384, 216); o.scale(0.2, 0.2); scene(o, t, u); o.restore();
        const bk = FH / 1080; ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(off, 540 - c.fx * bk, 0, 1920 * bk, FH);
        ctx.fillStyle = 'rgba(0,0,0,0.62)'; ctx.fillRect(0, 0, FW, FH);
        // the picture block
        ctx.save(); ctx.beginPath(); ctx.rect(0, BY, FW, BH); ctx.clip();
        if (c.fill) { ctx.fillStyle = c.fill; ctx.fillRect(0, BY, FW, BH); }
        ctx.translate(540 - c.fx * c.k, c.dy - c.fy * c.k); ctx.scale(c.k, c.k);
        ctx.beginPath(); ctx.rect(0, 0, 1920, 1080); ctx.clip();
        scene(ctx, t, u); ctx.restore();
        ctx.fillStyle = C.gold; ctx.fillRect(0, BY - 4, FW, 4); ctx.fillRect(0, BY + BH, FW, 4);
        if (OVER[i]) { ctx.save(); OVER[i](ctx, t); ctx.restore(); }
      }
      if (DIP[i]) { const a = 1 - clamp(u / 0.3); if (a > 0) { ctx.fillStyle = `rgba(0,0,0,${a * 0.9})`; ctx.fillRect(0, 0, FW, FH); } }
      // the narration, as subtitles
      const s = S.subtitles.find((x) => t >= x.t - 0.05 && t < x.end + 0.25);
      if (s) L.tx(ctx, s.text, FW / 2, V ? 1474 : FH - 78, 50, '#fff', { stroke: '#000', strokeW: 9, weight: 700, alpha: clamp((t - s.t + 0.05) / 0.12) });
      if (t < ev.credits + 0.3) watermark(ctx, t);
      credits(ctx, t);
    },
    post: (t) => ({ paper: 0.22, vignette: 0.38, grain: 0.05 }),
    fadeOut: 1.6,
  });
})();
