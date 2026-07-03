import type { Composition } from '../components/studio/MusicPlayer.vue'

/**
 * 手工编曲的真实作品。
 * 记谱：音名+八度（C4=60），notes 三元组 [起始拍, MIDI, 时值拍]。
 */

const NAMES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

function n(name: string): number {
  const m = name.match(/^([A-G])([#b]?)(-?\d)$/)!
  return NAMES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) + 1) * 12
}

/** 把 "C4:0.5 E4:0.5 G4:1 -:0.5" 形式的乐句翻译成 notes（- 为休止） */
function phrase(startBeat: number, line: string): [number, number, number][] {
  const out: [number, number, number][] = []
  let t = startBeat
  for (const token of line.trim().split(/\s+/)) {
    const [name, durStr] = token.split(':')
    const dur = Number(durStr)
    if (name !== '-') out.push([t, n(name), dur])
    t += dur
  }
  return out
}

/** 和弦铺底：每小节整拍持续 */
function chords(prog: string[][], beatsPerBar = 4): [number, number, number][] {
  const out: [number, number, number][] = []
  prog.forEach((chord, bar) => {
    for (const name of chord) out.push([bar * beatsPerBar, n(name), beatsPerBar])
  })
  return out
}

/** 低音声部：每小节 根音-八度-五度-根音 的行进 */
function bassLine(roots: string[]): [number, number, number][] {
  const out: [number, number, number][] = []
  roots.forEach((root, bar) => {
    const r = n(root)
    out.push([bar * 4, r, 1], [bar * 4 + 1, r + 12, 0.5], [bar * 4 + 1.5, r, 0.5])
    out.push([bar * 4 + 2, r + 7, 1], [bar * 4 + 3, r, 0.75])
  })
  return out
}

/** 鼓组：四脚踢 + 反拍踩镲 + 2/4 拍军鼓（noise 短音代替） */
function drums(bars: number) {
  const kick: [number, number, number][] = []
  const hat: [number, number, number][] = []
  const snare: [number, number, number][] = []
  for (let b = 0; b < bars; b++) {
    kick.push([b * 4, 36, 0.1], [b * 4 + 2, 36, 0.1])
    if (b % 2 === 1) kick.push([b * 4 + 3.5, 36, 0.1])
    snare.push([b * 4 + 1, 40, 0.08], [b * 4 + 3, 40, 0.08])
    for (let e = 0; e < 8; e++) hat.push([b * 4 + e * 0.5 + 0.25, 42, 0.04])
  }
  return { kick, hat, snare }
}

// ============ 作品一：《星港夜航》 A 小调 · 96 BPM ============
// 进行：Am → F → C → G ×2，B 段转 Dm → E，旋律为 A 小调五声下行动机的展开
function nightVoyage(): Composition {
  const progRoots = ['A2', 'F2', 'C3', 'G2', 'A2', 'F2', 'C3', 'G2', 'D3', 'E3', 'A2', 'A2']
  const progChords = [
    ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'],
    ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'],
    ['D4', 'F4', 'A4'], ['E4', 'G#4', 'B4'], ['A3', 'C4', 'E4'], ['A3', 'C4', 'E4'],
  ]
  const lead = [
    // A 段主题：下行动机与回答句
    ...phrase(0, 'E5:1 C5:0.5 D5:0.5 E5:1 -:1'),
    ...phrase(4, 'D5:1 C5:0.5 A4:0.5 C5:1.5 -:0.5'),
    ...phrase(8, 'G4:0.5 A4:0.5 C5:1 E5:1 D5:1'),
    ...phrase(12, 'B4:1.5 G4:0.5 A4:1.5 -:0.5'),
    // A' 段：动机高八度变奏
    ...phrase(16, 'E5:0.5 G5:0.5 E5:0.5 C5:0.5 D5:1 -:1'),
    ...phrase(20, 'D5:0.5 F5:0.5 D5:0.5 C5:0.5 A4:1.5 -:0.5'),
    ...phrase(24, 'C5:0.5 E5:0.5 G5:1 E5:0.5 D5:0.5 C5:1'),
    ...phrase(28, 'B4:1 D5:1 B4:0.5 G4:0.5 A4:1'),
    // B 段：张力与解决
    ...phrase(32, 'F5:1 E5:0.5 D5:0.5 F5:1 A5:1'),
    ...phrase(36, 'G#5:1.5 E5:0.5 B4:1 E5:1'),
    ...phrase(40, 'C5:0.5 D5:0.5 E5:1 A4:1.5 -:1'),
    ...phrase(44, 'A4:2 -:2'),
  ]
  const { kick, hat, snare } = drums(12)
  return {
    title: '星港夜航',
    bpm: 96,
    key: 'A 小调 · ABA 三段式',
    tracks: [
      { name: 'lead', wave: 'triangle', gain: 0.5, notes: lead },
      { name: 'pad', wave: 'sine', gain: 0.15, notes: chords(progChords) },
      { name: 'bass', wave: 'sawtooth', gain: 0.34, notes: bassLine(progRoots) },
      { name: 'kick', wave: 'kick', gain: 0.9, notes: kick },
      { name: 'snare', wave: 'noise', gain: 0.35, notes: snare },
      { name: 'hat', wave: 'noise', gain: 0.16, notes: hat },
    ],
  }
}

// ============ 作品二：《光之涟漪》 C 大调 · 114 BPM ============
// 进行：C → G → Am → F（卡农进行），主旋律 + 十六分音符琶音声部
function lightRipples(): Composition {
  const progRoots = ['C3', 'G2', 'A2', 'F2', 'C3', 'G2', 'A2', 'F2']
  const progChords = [
    ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'],
    ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'],
  ]
  // 琶音声部：每小节 上行-下行 十六分音符
  const arpChords = [
    ['C5', 'E5', 'G5', 'C6'], ['G4', 'B4', 'D5', 'G5'], ['A4', 'C5', 'E5', 'A5'], ['F4', 'A4', 'C5', 'F5'],
    ['C5', 'E5', 'G5', 'C6'], ['G4', 'B4', 'D5', 'G5'], ['A4', 'C5', 'E5', 'A5'], ['F4', 'A4', 'C5', 'F5'],
  ]
  const arp: [number, number, number][] = []
  arpChords.forEach((c, bar) => {
    const seq = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 3, 2, 1, 0, 1]
    seq.forEach((idx, e) => arp.push([bar * 4 + e * 0.25, n(c[idx]), 0.24]))
  })
  const lead = [
    ...phrase(0, 'G4:1 E4:0.5 F4:0.5 G4:1 C5:1'),
    ...phrase(4, 'B4:1.5 G4:0.5 D5:2'),
    ...phrase(8, 'C5:1 A4:0.5 B4:0.5 C5:1 E5:1'),
    ...phrase(12, 'D5:1 C5:0.5 A4:0.5 F4:2'),
    ...phrase(16, 'E5:1 G5:1 E5:0.5 D5:0.5 C5:1'),
    ...phrase(20, 'D5:1.5 B4:0.5 G4:2'),
    ...phrase(24, 'A4:0.5 C5:0.5 E5:1 A5:1 G5:1'),
    ...phrase(28, 'F5:1 E5:0.5 D5:0.5 C5:2'),
  ]
  const { kick, hat, snare } = drums(8)
  return {
    title: '光之涟漪',
    bpm: 114,
    key: 'C 大调 · 卡农进行 + 琶音',
    tracks: [
      { name: 'lead', wave: 'triangle', gain: 0.46, notes: lead },
      { name: 'arp', wave: 'square', gain: 0.1, notes: arp },
      { name: 'pad', wave: 'sine', gain: 0.13, notes: chords(progChords) },
      { name: 'bass', wave: 'sawtooth', gain: 0.32, notes: bassLine(progRoots) },
      { name: 'kick', wave: 'kick', gain: 0.85, notes: kick },
      { name: 'snare', wave: 'noise', gain: 0.3, notes: snare },
      { name: 'hat', wave: 'noise', gain: 0.15, notes: hat },
    ],
  }
}

// ============ 作品三：《晴天》致敬改编 · C 大调 · 72 BPM ============
// 校园民谣钢琴风格改编自周杰伦同名经典，前奏+主歌+副歌三段式，旋律为改编版本
function qingTian(): Composition {
  const progRoots = [
    'C3', 'A2', 'F2', 'G2',
    'C3', 'G2', 'A2', 'E2', 'F2', 'C3', 'D2', 'G2',
    'F2', 'C3', 'D2', 'G2', 'E2', 'A2', 'D2', 'G2',
  ]
  const progChords = [
    ['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'],
    ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['E3', 'G3', 'B3'],
    ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['D3', 'F3', 'A3'], ['G3', 'B3', 'D4'],
    ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['D3', 'F3', 'A3'], ['G3', 'B3', 'D4'],
    ['E3', 'G3', 'B3'], ['A3', 'C4', 'E4'], ['D3', 'F3', 'A3'], ['G3', 'B3', 'D4'],
  ]
  const lead = [
    // 前奏：钢琴下行动机
    ...phrase(0, 'E5:0.5 D5:0.5 C5:0.5 B4:0.5 A4:1 C5:1'),
    ...phrase(4, 'D5:0.5 C5:0.5 B4:0.5 A4:0.5 G4:1 A4:1'),
    ...phrase(8, 'C5:0.5 B4:0.5 A4:0.5 G4:0.5 F4:1 G4:1'),
    ...phrase(12, 'A4:0.5 G4:0.5 F4:0.5 E4:0.5 D4:1 -:1'),
    // 主歌
    ...phrase(16, 'E5:0.5 E5:0.5 E5:0.5 D5:0.5 C5:1 D5:1'),
    ...phrase(20, 'E5:0.5 D5:0.5 C5:1 -:0.5 D5:0.5 E5:1'),
    ...phrase(24, 'G5:0.5 E5:0.5 D5:0.5 C5:0.5 D5:1 E5:1'),
    ...phrase(28, 'D5:0.5 C5:0.5 B4:1 -:0.5 C5:0.5 D5:1'),
    ...phrase(32, 'C5:0.5 C5:0.5 C5:0.5 B4:0.5 A4:1 B4:1'),
    ...phrase(36, 'C5:0.5 D5:0.5 C5:1 -:0.5 B4:0.5 A4:1'),
    ...phrase(40, 'D5:0.5 E5:0.5 G5:0.5 E5:0.5 D5:1 C5:1'),
    ...phrase(44, 'D5:0.5 C5:0.5 B4:1 A4:2'),
    // 副歌：情绪推向高点
    ...phrase(48, 'F5:0.5 E5:0.5 D5:0.5 C5:0.5 D5:1 F5:1'),
    ...phrase(52, 'E5:0.5 D5:0.5 C5:1 -:0.5 D5:0.5 E5:1'),
    ...phrase(56, 'D5:0.5 C5:0.5 A4:1 -:1 C5:1'),
    ...phrase(60, 'B4:0.5 C5:0.5 D5:1 E5:0.5 D5:0.5 C5:1'),
    ...phrase(64, 'E5:0.5 G5:0.5 E5:1 -:0.5 D5:0.5 C5:1'),
    ...phrase(68, 'C5:0.5 B4:0.5 A4:1 -:0.5 B4:0.5 C5:1'),
    ...phrase(72, 'D5:0.5 F5:0.5 E5:1 D5:0.5 C5:0.5 A4:1'),
    ...phrase(76, 'B4:0.5 C5:0.5 D5:1 C5:0.5 B4:0.5 G4:1'),
  ]
  const { kick, hat, snare } = drums(20)
  return {
    title: '晴天',
    bpm: 72,
    key: 'C 大调 · 前奏-主歌-副歌三段式',
    tracks: [
      { name: 'lead', wave: 'triangle', gain: 0.48, notes: lead },
      { name: 'pad', wave: 'sine', gain: 0.14, notes: chords(progChords) },
      { name: 'bass', wave: 'sawtooth', gain: 0.3, notes: bassLine(progRoots) },
      { name: 'kick', wave: 'kick', gain: 0.7, notes: kick },
      { name: 'snare', wave: 'noise', gain: 0.24, notes: snare },
      { name: 'hat', wave: 'noise', gain: 0.12, notes: hat },
    ],
  }
}

export const MUSIC_DEMOS: { id: string; desc: string; composition: Composition }[] = [
  {
    id: 'night-voyage',
    desc: 'A 小调 · ABA 三段式 · 6 轨编曲，B 段属和弦张力解决',
    composition: nightVoyage(),
  },
  {
    id: 'light-ripples',
    desc: 'C 大调 · 卡农进行 · 十六分音符琶音声部 + 主旋律对位',
    composition: lightRipples(),
  },
  {
    id: 'qing-tian',
    desc: 'C 大调 · 校园民谣钢琴改编 · 致敬周杰伦经典旋律',
    composition: qingTian(),
  },
]
