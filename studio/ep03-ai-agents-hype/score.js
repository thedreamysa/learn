// EPISODE 3 · «تقرير في دقائق» · وكلاء الذكاء الاصطناعي بين الضجيج والواقع
// STYLE-FRAME PASS: scene timings are provisional. Once the voice segments exist, every scene start
// is re-pinned to the measured phrase that mentions it (silencedetect), so this file stays the one clock.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock } = MU;

  const FPS = 30;
  const FORMAT = U.pickFormat ? U.pickFormat('16:9') : '16:9';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 96, offset: 0 });
  const { T, BEAT } = clock;

  // scenes [start, end] in seconds
  const S = {
    hook: [0, 5],
    title: [5, 9],
    curve: [9, 18],
    cancel: [18, 24],
    shift: [24, 29],
    end: [29, 34],
  };
  const DURATION = 34;
  const ev = Object.fromEntries(Object.entries(S).map(([k, v]) => [k, v[0]]));

  // on-screen facts — PENDING SOURCE VERIFICATION (Gartner page must be opened before the final render)
  const FACTS = {
    deployed: 17, // % of organisations that have deployed AI agents
    expect: 60, // % expecting to deploy within two years ("more than")
    cancel: 40, // % of agentic projects expected to be cancelled by end-2027 ("more than")
  };
  const SOURCE = { ar: 'جارتنر · أكتوبر 2026', en: 'Gartner Hype Cycle for AI' };
  const HANDLES = ['X  @y7yr_', 'TikTok  @i.y7y', 'LinkedIn  in/yahya-alameer', 'linktr.ee/yalameer'];

  const markers = Object.fromEntries(Object.entries(ev).map(([k, t]) => [k, { t, sync: 'v' }]));

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, S, m, ev, FACTS, SOURCE, HANDLES, markers, vo: [], subtitles: [] };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
