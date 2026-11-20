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
    title: [5, 9.5],
    curve: [9.5, 17.5],
    expect: [17.5, 22.5],
    cancel: [22.5, 28.5],
    shift: [28.5, 33.5],
    check: [33.5, 39.5],
    end: [39.5, 45],
  };
  const DURATION = 45;
  const ev = Object.fromEntries(Object.entries(S).map(([k, v]) => [k, v[0]]));

  // on-screen facts — PENDING SOURCE VERIFICATION (Gartner page must be opened before the final render)
  const FACTS = {
    deployed: 17, // % of organisations that have deployed AI agents
    expect: 60, // % expecting to deploy within two years ("more than")
    cancel: 40, // % of agentic projects expected to be cancelled by end-2027 ("more than")
  };
  const SOURCE = { ar: 'جارتنر · أكتوبر 2026', en: 'Gartner — AI Hype Cycle, Oct 2026' };
  // where Gartner places AI agents on the curve: null until verified on the source page (no guessing)
  const AGENTS_PHASE = null;
  const HANDLES = ['X  @y7yr_', 'TikTok  @i.y7y', 'LinkedIn  in/yahya-alameer', 'linktr.ee/yalameer'];

  const markers = Object.fromEntries(Object.entries(ev).map(([k, t]) => [k, { t, sync: 'v' }]));

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, S, m, ev, FACTS, SOURCE, AGENTS_PHASE, HANDLES, markers, vo: [], subtitles: [] };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
