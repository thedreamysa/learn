// «يد واحدة» — THE SONG: every sound from the score -> out/music.wav (music + SFX + the recorded voiceover).
//   node song.js      (STEMS=1 writes out/stem-*.wav, LUFS=-14 masters to a loudness target)
const path = require('path');
const { SR, Bus, reverb, pingpong, rng } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const S = require('./score');
const { T, BEAT, BAR, DURATION, m, ev, sc, at, clock } = S;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), oud = bus(), str = bus(), brass = bus(), choir = bus(), low = bus(), fx = bus(), verb = bus(), dly = bus();

// ---------- maqam Hijaz on D: D Eb F# G A Bb C ----------
const n = (name) => m(name);
const CH = { // strings voicings
  D: ['D3', 'A3', 'D4', 'F#4'], Eb: ['Eb3', 'Bb3', 'Eb4', 'G4'], Gm: ['G3', 'Bb3', 'D4', 'G4'], Cm: ['C3', 'G3', 'C4', 'Eb4'],
  D5: ['D3', 'A3', 'D4'], Dlow: ['D2', 'A2', 'D3'], dark: ['D2', 'Eb3', 'A3'],
};
const chord = (name, t, dur, gain, o = {}) => { for (const k of CH[name]) { const x = I.strings(n(k), dur, { attack: 0.5, release: 0.9, ...o, seed: n(k) }); str.addStereo(x.L, x.R, t, gain); verb.addStereo(x.L, x.R, t, gain * 0.5); } };
const pluck = (note, t, dur = 1.2, g = 0.5, pan = 0) => { const x = I.guitar(n(note) - 12, dur, { bright: 0.42, sustain: 0.9972, seed: Math.round(t * 31) }); oud.addMono(x, t, g, pan); verb.addMono(x, t, g * 0.45); dly.addMono(x, t, g * 0.12); };
const DG = (t, g = 0.9, pitch = 1) => { drums.addMono(I.dhol('dagga', { seed: Math.round(t * 13), pitch }), t, g); verb.addMono(I.dhol('dagga', { seed: 3, pitch }), t, g * 0.2); };
const TL = (t, g = 0.5, pan = 0.2) => drums.addMono(I.dhol('tilli', { seed: Math.round(t * 17) }), t, g, pan);
const bigHit = (t, g = 1) => { drums.addMono(I.dhol('both', { seed: 5, pitch: 0.9 }), t, g); drums.addMono(I.timpani(n('D2'), { decay: 1.6 }), t, g * 0.8); fx.addMono(I.subBoom(1.8), t, g * 0.5); verb.addMono(I.timpani(n('D2')), t, g * 0.5); };

// ---------- 1. الجذور: wind, clay, a lone oud ----------
fx.addMono(I.noiseSweep(sc[2].t1 - 0.2, 500, 900, { q: 0.6, pink: true, shape: (x) => 0.5 + 0.5 * Math.sin(x * 14) * Math.sin(Math.PI * x) }), 0.1, 0.16);
for (let i = 0; i < 5; i++) fx.addMono(I.scribble(0.5, 40 + i), 0.9 + i * 1.25, 0.14, -0.2 + i * 0.1); // the hand working the clay
const TAQSIM = [ // [note, bar, beat, dur]
  ['D4', 0, 2, 2.5], ['A4', 1, 1, 1.4], ['Bb4', 1, 2.5, 0.7], ['A4', 1, 3, 2.2], ['F#4', 2, 2, 1.2], ['Eb4', 2, 3, 0.8],
  ['D4', 3, 0, 2.6], ['F#4', 3, 3, 0.8], ['G4', 3, 3.5, 0.6], ['A4', 4, 0, 1.8], ['Bb4', 4, 2, 0.7], ['C5', 4, 2.5, 0.7], ['D5', 4, 3, 2.4],
  ['C5', 5, 2, 0.7], ['Bb4', 5, 2.5, 0.7], ['A4', 5, 3, 1.8], ['G4', 6, 1, 0.7], ['F#4', 6, 1.5, 0.7], ['Eb4', 6, 2, 0.7], ['D4', 6, 3, 2.6],
  ['A3', 7, 2, 1.2], ['D4', 7, 3, 2.4],
  ['D4', 8, 0, 2], ['F#4', 8, 2, 0.9], ['A4', 8, 3, 1.6], ['Bb4', 9, 1, 0.7], ['A4', 9, 2, 0.7], ['G4', 9, 3, 1.6], ['F#4', 10, 1, 0.7], ['G4', 10, 2, 0.7],
];
for (const [note, b, beat, dur] of TAQSIM) if (T(b, beat) !== ev.y1727) pluck(note, T(b, beat), dur + 0.6, 0.55, -0.1);
// drone under the Diriyah and the unification
chord('Dlow', sc[2].t0, sc[3].t0 - sc[2].t0, 0.05, { attack: 2.5, bright: 0.6 });
chord('D5', sc[3].t0, ev.y1932 - sc[3].t0, 0.07, { attack: 2, bright: 0.8 });
chord('Eb', at(3, 2), BAR - 0.15, 0.06, { attack: 0.8 });
// hooves approaching (scene 3)
for (let i = 0; i < 22; i++) { const t = sc[3].t0 + 0.6 + i * 0.31; if (t < ev.y1932 - 0.5) { fx.addMono(I.woodTick(0.7 + (i % 2) * 0.12), t, 0.1 + i * 0.006, -0.5 + i * 0.04); fx.addMono(I.woodTick(0.62), t + 0.09, 0.07, -0.5 + i * 0.04); } }
// the dates
bigHit(ev.y1727, 0.7);
fx.addMono(I.bell(n('D5'), 2.5), ev.first, 0.1);
bigHit(ev.y1932, 1);
chord('D', ev.y1932, sc[4].t0 - ev.y1932 + 0.3, 0.1, { attack: 0.05 });
{ const x = I.brassNote(n('D4'), 3.5, { bright: 0.8 }); brass.addStereo(x.L, x.R, ev.y1932, 0.3); verb.addStereo(x.L, x.R, ev.y1932, 0.2); }

// ---------- the ardah groove ----------
// level: 0 none, 1 sparse, 2 walking, 3 full
function ardahBar(bar, level) {
  const t0 = T(bar), s = BEAT / 4;
  if (level >= 1) { DG(t0, 0.8); DG(t0 + 8 * s, 0.6); }
  if (level >= 2) { DG(t0 + 6 * s, 0.5, 1.05); for (const k of [4, 12]) TL(t0 + k * s, 0.4); }
  if (level >= 3) { for (const k of [3, 10, 14, 15]) TL(t0 + k * s, 0.3, -0.25); drums.addMono(I.clap(), t0 + 4 * s, 0.25); drums.addMono(I.clap(), t0 + 12 * s, 0.25); DG(t0 + 11 * s, 0.4, 1.1); }
}
const prog = (bar0, names, gain, o) => names.forEach((nm, i) => chord(nm, T(bar0 + i), BAR + 0.1, gain, o));
const brassLine = (bar0, notes, g = 0.3) => { for (const [note, bar, beat, d] of notes) { const x = I.brassNote(n(note), d * BEAT * 0.94, { bright: 0.9 }); brass.addStereo(x.L, x.R, T(bar0 + bar, beat), g); verb.addStereo(x.L, x.R, T(bar0 + bar, beat), g * 0.4); } };

// ---------- 2. الثمرة: the groove builds (scene 4), the full orchestra (scene 5), then the cut ----------
for (let i = 0; i < 6; i++) ardahBar(sc[4].bar + i, i < 2 ? 1 : 2);
prog(sc[4].bar, ['D', 'D', 'Eb', 'D', 'Gm', 'Eb'], 0.085, { attack: 0.3 });
for (const t of ev.kings) { drums.addMono(I.tom(110, 0.5), t, 0.45); fx.addMono(I.bell(n('A5'), 1.2), t, 0.05); }
for (const t of ev.panels.slice(1)) fx.addMono(I.paperFwip(0.9), t - 0.03, 0.2);
for (let i = 0; i < 5; i++) { const bar = sc[5].bar + i; if (T(bar) < ev.cut) ardahBar(bar, 3); }
prog(sc[5].bar, ['D', 'Eb', 'Gm', 'Cm', 'D'], 0.1, { attack: 0.15, bright: 1.2 });
brassLine(sc[5].bar, [['D4', 0, 0, 3], ['F#4', 0, 3, 1], ['G4', 1, 0, 3], ['Bb4', 1, 3, 1], ['A4', 2, 0, 2], ['Bb4', 2, 2, 2], ['C5', 3, 0, 2], ['Eb5', 3, 2, 2], ['D5', 4, 0, 1]], 0.28);
fx.addMono(I.noiseSweep(ev.cut - at(5, 2), 300, 7000, { q: 0.9, shape: (x) => x * x, pink: true }), at(5, 2), 0.3);
fx.addMono(I.bell(n('D6'), 2), ev.vision, 0.08);

// ---------- 3. المعركة الخفية: silence, a ping, a low pulse ----------
const ping = (t, g = 0.3, pan = 0) => { const x = I.ting(86); fx.addMono(x, t, g, pan); dly.addMono(x, t, g * 0.3); };
ping(ev.ping, 0.4);
for (let t = ev.pulse; t < sc[10].t0 - 0.3; t += BEAT / 2) { // the cold 8th-note pulse
  const k = Math.round((t - ev.pulse) / (BEAT / 2));
  low.addMono(I.bass(n(k % 16 === 14 ? 'Eb2' : 'D2') - 12, BEAT * 0.4, { bright: 0.18, sub: 1 }), t, k % 2 ? 0.28 : 0.5);
}
{ const span = sc[10].t0 - sc[7].t0; for (const k of ['D2', 'Eb3', 'A3']) { const p = I.padNote(n(k), span, { cutoff: 520, attack: 3, release: 0.6, detune: 0.3 }); str.addStereo(p.L, p.R, sc[7].t0, 0.1); } }
S.fwd.forEach((f, i) => ping(f.t, 0.1 + 0.18 * (i / S.fwd.length), (f.x - 0.5) * 1.4));
// the glass cracks
{ const len = Math.round(0.5 * SR), g = new Float32Array(len), r = rng(77); let hp = 0, prev = 0;
  for (let i = 0; i < len; i++) { const x = r(); hp = 0.72 * (hp + x - prev); prev = x; g[i] = hp * Math.exp(-i / (0.045 * SR)) * 0.9 + (r() > 0.9985 ? r() * Math.exp(-i / (0.3 * SR)) : 0); }
  fx.addMono(g, ev.crack, 0.5); verb.addMono(g, ev.crack, 0.3); fx.addMono(I.thwack(), ev.crack, 0.6); fx.addMono(I.subBoom(1.4, 70, 30), ev.crack, 0.5); }
fx.addMono(I.noiseSweep(0.45, 2500, 300, { pink: true }), ev.mask - 0.1, 0.3);
fx.addMono(I.bwomp(), ev.mask + 0.25, 0.35);
ping(ev.threat, 0.35, 0.3);
for (let i = 0; i < 4; i++) { low.addMono(I.heartbeat(), at(9, i), 1.2); } // slow heart under «شبابنا»
fx.addMono(I.subBoom(2.5, 55, 26), sc[9].t0, 0.35);

// ---------- 4. اليد التي توقف: heartbeats, silence, the drums come back ----------
for (const t of ev.heart) low.addMono(I.heartbeat(), t, 2.6);
DG(ev.stop, 1); fx.addMono(I.paperFwip(0.7), ev.stop - 0.04, 0.3);
chord('D5', ev.stop, 2 * BAR, 0.07, { attack: 1.2 });
ardahBar(sc[10].bar + 3, 1);
pluck('D4', at(10, 3), 2.5, 0.5); pluck('A4', at(10, 3, 2), 2, 0.45);
for (let i = 0; i < 7; i++) ardahBar(sc[11].bar + i, 2);
prog(sc[11].bar, ['D', 'D', 'Gm', 'Gm', 'Eb', 'Eb', 'D'], 0.085, { attack: 0.3 });
const WARM = [['D4', 0, 2, 1], ['F#4', 0, 3, 1], ['A4', 1, 0, 2], ['G4', 1, 2, 1], ['F#4', 1, 3, 1], ['G4', 2, 2, 1], ['Bb4', 2, 3, 1], ['D5', 3, 0, 2], ['C5', 3, 2, 1], ['Bb4', 3, 3, 1], ['Bb4', 4, 2, 1], ['A4', 4, 3, 1], ['G4', 5, 0, 2], ['F#4', 5, 2, 1], ['Eb4', 5, 3, 1], ['D4', 6, 0, 3]];
for (const [note, b, beat, d] of WARM) pluck(note, at(11, b, beat), d * BEAT + 0.8, 0.5, 0.15);
for (const t of [...ev.cards, ev.cardsAll]) { bigHit(t, 0.55); fx.addMono(I.bell(n('D6'), 2.2), t, 0.1); }

// ---------- 5. يد واحدة: the full ardah, voices, the last chord ----------
for (let i = 0; i < 6; i++) ardahBar(sc[12].bar + i, 3);
prog(sc[12].bar, ['D', 'Eb', 'D', 'Gm', 'Eb', 'D'], 0.11, { attack: 0.12, bright: 1.25 });
ev.clasps.forEach((t, i) => { drums.addMono(I.clap(), t, 0.5); drums.addMono(I.tom(90 + i * 8, 0.4), t, 0.4); });
const sing = (note, t, dur, g = 0.2) => { for (const [d, type, pan] of [[0, 'tenor', -0.4], [-12, 'tenor', 0.4], [7, 'alto', 0]]) { const v = I.voice(n(note) + d, dur, { syl: 'o', type, seed: n(note) + d, vib: 0.12 }); choir.addMono(v, t, g, pan); verb.addMono(v, t, g * 0.6); } };
const CHANT = [['D4', 0, 0, 3], ['D4', 0, 3, 1], ['F#4', 1, 0, 2], ['Eb4', 1, 2, 2], ['D4', 2, 0, 4]];
for (const b0 of [3, 0]) for (const [note, b, beat, d] of CHANT) { if (b0 === 0 && b > 2) continue; sing(note, at(12, b0 + b, beat), d * BEAT * 0.95, b0 === 3 ? 0.22 : 0.1); }
brassLine(sc[12].bar + 3, [['D4', 0, 0, 3], ['D4', 0, 3, 1], ['F#4', 1, 0, 2], ['Eb4', 1, 2, 2], ['D4', 2, 0, 4]], 0.24);
fx.addMono(I.noiseSweep(BAR, 300, 8000, { q: 0.9, shape: (x) => x * x, pink: true }), at(12, 5), 0.3);
bigHit(ev.final, 1); drums.addMono(I.crash(3), ev.final, 0.3);
for (let i = 0; i < 4; i++) ardahBar(sc[13].bar + i, i < 3 ? 2 : 1);
prog(sc[13].bar, ['D', 'Gm', 'Eb'], 0.1, { attack: 0.15 });
chord('Eb', ev.grasp, BAR - 0.1, 0.1, { attack: 0.1 });
for (const [note, b, beat, d] of [['A4', 0, 0, 4], ['Bb4', 1, 0, 4], ['G4', 2, 0, 4], ['F#4', 3, 0, 3]]) sing(note, at(13, b, beat), d * BEAT * 0.95, 0.14);
bigHit(ev.title, 1.1); drums.addMono(I.crash(9), ev.title, 0.35);
chord('D', ev.title, DURATION - ev.title, 0.13, { attack: 0.05, release: 2.5 });
sing('D4', ev.title, 5, 0.2);
{ const x = I.brassNote(n('D4'), 5, { bright: 0.9 }); brass.addStereo(x.L, x.R, ev.title, 0.3); verb.addStereo(x.L, x.R, ev.title, 0.2); }
pluck('D4', ev.title + 2 * BEAT, 3, 0.5); pluck('A4', ev.title + 3 * BEAT, 3, 0.45); pluck('D5', ev.title + 4 * BEAT, 4, 0.5);

// ---------- mix: music -> silences -> duck under the voice -> master ----------
const stems = { drums, oud, str, brass, choir, low, fx, verb: reverb(verb, { room: 0.86, damp: 0.35 }), dly: pingpong(dly, BEAT * 0.75, 0.3, 3200) };
const GAIN = { drums: 0.5, oud: 1.5, str: 2.2, brass: 1.3, choir: 1.2, low: 0.32, fx: 1, verb: 0.9, dly: 1 };
const out = path.join(__dirname, 'out');
const music = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(music, 24);
MIX.gate(music, ev.cut, ev.ping); // the music is cut on «يسقط»: true silence until the notification
MIX.gate(music, ev.stop - BEAT * 0.9, ev.stop); // a held breath before he stops
const vo = bus();
for (const v of S.VO) MIX.loadAudio(path.join(__dirname, v.f), { at: v.at, gain: v.gain, length: DURATION }).mixInto(vo, 1);
MIX.duck([music], vo, { depth: 0.7, attack: 0.03, release: 0.45, threshold: 0.03 });
if (process.env.STEMS) { MIX.writeWav(path.join(out, 'stem-music.wav'), music); MIX.writeWav(path.join(out, 'stem-vo.wav'), vo); }
const mix = new Bus(N);
music.mixInto(mix, parseFloat(process.env.MUSIC || '0.8')); vo.mixInto(mix, parseFloat(process.env.VOICE || '1.15'));
MIX.fadeOut(mix, DURATION - 2.2, DURATION);
const M = MIX.master(mix, parseFloat(process.env.DRIVE || '0.8'), undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : null });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS at drive ${M.drive.toFixed(2)}` : ''})`);
