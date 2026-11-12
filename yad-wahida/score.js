// «يد واحدة» — THE SCORE: the single timeline that the music, the voiceover and the picture all read.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock } = MU;

  const FPS = 30;
  const FORMAT = '16:9';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 90, offset: 0 }); // 1 beat = 0.667s, 1 bar = 2.667s
  const { T, BEAT, BAR } = clock;

  // ---------- 13 scenes, cut on bar lines ----------
  const BARS = [3, 5, 5, 6, 5, 4, 4, 5, 4, 4, 7, 6, 6];
  const sc = []; // sc[1..13] = { bar, bars, t0, t1 }
  let b = 0;
  BARS.forEach((n, i) => { sc[i + 1] = { bar: b, bars: n, t0: T(b), t1: T(b + n) }; b += n; });
  const TOTAL_BARS = b; // 64
  const DURATION = T(TOTAL_BARS) + 2.4;
  const at = (scene, bar = 0, beat = 0) => T(sc[scene].bar + bar, beat);

  const S = {
    roots: [0, sc[4].t0], // الجذور
    fruit: [sc[4].t0, sc[6].t0], // الثمرة
    hidden: [sc[6].t0, sc[10].t0], // المعركة الخفية
    stop: [sc[10].t0, sc[12].t0], // اليد التي توقف
    one: [sc[12].t0, DURATION], // يد واحدة
  };

  // ---------- voiceover (real takes in vo/, durations measured with ffprobe) ----------
  const VO = [
    { s: 1, f: 'vo/s01.mp3', d: 2.35, off: 2.6, text: 'كل وطنٍ يبدأ بيد…' },
    { s: 2, f: 'vo/s02.mp3', d: 9.72, off: 0.5, text: 'عام ألف وسبعمئة وسبعة وعشرين، اجتمعت الأيدي حول الإمام محمد بن سعود في الدرعية، فكان الأمن بعد الخوف، والوحدة بعد الفرقة.' },
    { s: 3, f: 'vo/s03.mp3', d: 10.92, off: 0.5, text: 'وجاء المؤسس الملك عبدالعزيز، فجمع القلوب قبل الأرض، حتى صارت المملكة عام ألف وتسعمئة واثنين وثلاثين بيتًا واحدًا للجميع.' },
    { s: 4, f: 'vo/s04.mp3', d: 13.4, off: 0.4, text: 'وتعاقب الملوك: سعود وفيصل وخالد وفهد وعبدالله، والشعب معهم يدًا بيد: جامعةٌ هنا، ومصنعٌ هناك، وحرمانِ يتسعان للملايين.' },
    { s: 5, f: 'vo/s05.mp3', d: 11.15, off: 0.4, text: 'واليوم، في عهد الملك سلمان وبقيادة سمو ولي العهد، نعيش أسرع قفزة في تاريخنا. وكلما ارتفع البناء، كثُر من يتمنّى أن يسقط.' },
    { s: 6, f: 'vo/s06.mp3', d: 3.71, off: 1.2, gain: 2.4, text: 'أعداء اليوم لا يطرقون الباب… هم في جيبك.' },
    { s: 7, f: 'vo/s07.mp3', d: 5.56, off: 0.6, text: 'إشاعةٌ مجهولة المصدر، تُكتب لتُغضب، وتُنشر لتُفرّق.' },
    { s: 8, f: 'vo/s08.mp3', d: 10.92, off: 0.5, text: 'حسابٌ يلبس ثوبنا ويتكلم بلهجتنا، لكنه لا يريد لنا خيرًا. يزرع الفتنة بين الأخ وأخيه، ويستغل لحظة ضعف.' },
    { s: 9, f: 'vo/s09.mp3', d: 7.97, off: 0.6, text: 'ويستهدفون أغلى ما نملك: شبابنا. لأنهم يعلمون أن من يملك الشباب يملك المستقبل.' },
    { s: 10, f: 'vo/s10.mp3', d: 4.68, off: 5.6, text: 'لكن اليد التي بنت هذا الوطن، تعرف أيضًا كيف تحميه.' },
    { s: 11, f: 'vo/s11a.wav', d: 2.4, off: 1.0, text: 'لا تنشر قبل أن تتثبّت.' },
    { s: 11, f: 'vo/s11b.wav', d: 1.97, off: 2 * BAR + 1.0, text: 'بلّغ ولا تجادل.' },
    { s: 11, f: 'vo/s11c.wav', d: 4.56, off: 4 * BAR + 1.0, text: 'واقترب ممن تحب، فالبيت المترابط لا تدخله الفتنة.' },
    { s: 12, f: 'vo/s12.mp3', d: 7.55, off: 0.7, text: 'من الشمال إلى الجنوب، ومن الشرق إلى الغرب، نحن لسنا أياديَ كثيرة… نحن يدٌ واحدة.' },
    { s: 13, f: 'vo/s13.mp3', d: 5.25, off: 0.9, text: 'هذا الوطن أمانةٌ في أيدينا منذ ثلاثة قرون. ولن نفلتها.' },
  ].map((v) => ({ ...v, at: sc[v.s].t0 + v.off, gain: v.gain || 1 }));

  // subtitles: each line split into clauses, timed by letter count across the take
  const subtitles = [];
  for (const v of VO) {
    let parts = v.text.match(/[^،.:…]+[،.:…]*/g).map((x) => x.trim()).filter(Boolean);
    parts = parts.flatMap((p) => {
      if (p.length <= 46) return [p];
      const ws = p.split(' '); const h = Math.ceil(ws.length / 2);
      return [ws.slice(0, h).join(' '), ws.slice(h).join(' ')];
    });
    // merge very short clauses with the next one
    const merged = [];
    for (const p of parts) { const l = merged[merged.length - 1]; if (l && (l.length < 14 || p.length < 10) && l.length + p.length < 46) merged[merged.length - 1] = l + ' ' + p; else merged.push(p); }
    const total = merged.reduce((a, p) => a + p.length, 0);
    let t = v.at;
    for (const p of merged) { const d = (v.d * p.length) / total; subtitles.push({ t, end: t + d, text: p }); t += d; }
  }

  // ---------- events (every hit lives here; song.js and film.js both read them) ----------
  const ev = {
    y1727: at(2, 1), // «1727» stamps, drum
    first: at(2, 2), // «تأسيس الدولة السعودية الأولى»
    y1932: at(3, 3), // the map completes in gold, ardah drum
    kings: [2.2, 3.05, 3.85, 4.65, 5.45].map((x) => sc[4].t0 + x), // each king's name card
    panels: [0, BAR, 2 * BAR, 3 * BAR, 10.3, 12.4].map((x) => sc[4].t0 + x),
    vision: at(5, 2), // «رؤية 2030»
    cut: sc[5].t0 + 0.4 + 11.1, // the music is cut on «يسقط»
    ping: at(6, 2), // a notification in the silence
    pulse: at(6, 3), // the low electronic pulse starts
    crack: at(7, 3), // the screen cracks
    mask: at(8, 2), // the mask falls
    threat: at(8, 3, 2), // the blackmail message
    heart: [0, 1, 2, 3, 4, 5, 6].map((i) => at(10, 0) + i * BEAT * 1.0), // heartbeats over the hovering thumb
    stop: at(10, 2), // he stops: closes the message
    cards: [at(11, 0), at(11, 2), at(11, 4)], // تثبّت · بلّغ · احمِ بيتك
    cardsAll: at(11, 6),
    clasps: [0, 1, 2, 3, 4, 5].map((i) => at(12, 0) + i * BAR / 2), // six handshakes
    ardah: at(12, 3),
    final: at(13, 0),
    grasp: at(13, 3), // the first hand, held by today's hand
    title: at(13, 4), // «يد واحدة — نحمي الوطن»
  };
  // forwards counter in scene 7: accelerating notification pings (seeded, same for sound and picture)
  const rnd = U.mulberry32(7);
  const fwd = [];
  { let t = sc[7].t0 + 1.0, gap = 0.62; while (t < ev.crack - 0.25) { fwd.push({ t, x: rnd(), y: rnd() }); t += gap; gap = Math.max(0.07, gap * 0.86); } }

  const KINGS = [
    { name: 'الملك سعود', years: '1953 – 1964' },
    { name: 'الملك فيصل', years: '1964 – 1975' },
    { name: 'الملك خالد', years: '1975 – 1982' },
    { name: 'الملك فهد', years: '1982 – 2005' },
    { name: 'الملك عبدالله', years: '2005 – 2015' },
  ];
  const CLASPS = ['جدٌّ وحفيد', 'معلّمٌ وطالب', 'جنديٌّ في الحدّ الجنوبي', 'طبيبة', 'صيّادٌ في جازان', 'مزارعٌ في القصيم'];

  const markers = {
    y1727: { t: ev.y1727, sync: 'av' },
    y1932: { t: ev.y1932, sync: 'av' },
    kings: ev.kings[0],
    vision: ev.vision,
    cut: ev.cut,
    ping: ev.ping,
    crack: { t: ev.crack, sync: 'av' },
    mask: ev.mask,
    stop: ev.stop,
    card1: ev.cards[0], card2: ev.cards[1], card3: ev.cards[2],
    ardah: ev.ardah,
    grasp: ev.grasp,
    title: { t: ev.title, sync: 'av' },
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, sc, at, VO, subtitles, ev, fwd, KINGS, CLASPS, markers, TOTAL_BARS };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
