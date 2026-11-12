// «يد واحدة» — THE FILM: picks the scene for frame t, then letterbox + subtitles. Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, L = globalThis.L, Studio = globalThis.Studio;
  const { clamp } = U;
  const { sc, ev } = S;
  const W = G.W, H = G.H;
  const BARS = { 1: 1, 2: 1, 3: 1, 12: 1, 13: 1 }; // cinematic 2.39:1 in chapters one and five
  const DIP = { 2: 1, 4: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1 }; // a short dip from black at these scene starts

  Studio.film({
    draw(ctx, t) {
      let i = 1; for (let k = 1; k <= 13; k++) if (t >= sc[k].t0) i = k;
      const u = t - sc[i].t0;
      ctx.save(); L.SCENES[i](ctx, t, u); ctx.restore();
      if (DIP[i]) { const a = 1 - clamp(u / 0.3); if (a > 0) { ctx.fillStyle = `rgba(0,0,0,${a * 0.9})`; ctx.fillRect(0, 0, W, H); } }
      if (BARS[i]) L.bars(ctx, i === 12 ? clamp(u / 0.5) : 1);
      else if (i === 4) L.bars(ctx, 1 - clamp(u / 0.5));
      // the narration, as subtitles
      const s = S.subtitles.find((x) => t >= x.t - 0.05 && t < x.end + 0.25);
      if (s) L.tx(ctx, s.text, W / 2, H - 78, 50, '#fff', { stroke: '#000', strokeW: 9, weight: 700, alpha: clamp((t - s.t + 0.05) / 0.12) });
    },
    post: (t) => ({ paper: 0.22, vignette: 0.38, grain: 0.05 }),
    fadeOut: 2.2,
  });
})();
