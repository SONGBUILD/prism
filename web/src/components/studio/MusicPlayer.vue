<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

export interface Composition {
  title: string
  bpm: number
  key?: string
  tracks: { name: string; wave: string; gain?: number; notes: [number, number, number][] }[]
}

const props = defineProps<{ composition: Composition }>()

const playing = ref(false)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let ctx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let loopTimer: ReturnType<typeof setTimeout> | undefined
let raf = 0

const midiFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

function scheduleNote(
  ac: AudioContext,
  dest: AudioNode,
  wave: string,
  gain: number,
  time: number,
  midi: number,
  dur: number,
) {
  const g = ac.createGain()
  g.connect(dest)
  if (wave === 'kick') {
    const osc = ac.createOscillator()
    osc.frequency.setValueAtTime(130, time)
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.12)
    g.gain.setValueAtTime(gain, time)
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.28)
    osc.connect(g)
    osc.start(time)
    osc.stop(time + 0.3)
  } else if (wave === 'noise') {
    const len = Math.floor(ac.sampleRate * 0.06)
    const buf = ac.createBuffer(1, len, ac.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    const src = ac.createBufferSource()
    src.buffer = buf
    const hp = ac.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 6500
    g.gain.setValueAtTime(gain, time)
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.06)
    src.connect(hp).connect(g)
    src.start(time)
  } else {
    const osc = ac.createOscillator()
    osc.type = (['sine', 'triangle', 'sawtooth', 'square'].includes(wave) ? wave : 'triangle') as OscillatorType
    osc.frequency.value = midiFreq(midi)
    const a = 0.015
    const rel = Math.min(0.25, dur * 0.4)
    g.gain.setValueAtTime(0.0001, time)
    g.gain.exponentialRampToValueAtTime(gain, time + a)
    g.gain.setValueAtTime(gain, time + Math.max(a, dur - rel))
    g.gain.exponentialRampToValueAtTime(0.001, time + dur + 0.05)
    osc.connect(g)
    osc.start(time)
    osc.stop(time + dur + 0.1)
  }
}

function scheduleLoop(startTime: number) {
  if (!ctx || !analyser) return
  const comp = props.composition
  const spb = 60 / (comp.bpm || 100)
  let totalBeats = 0
  for (const t of comp.tracks) {
    for (const [beat, , dur] of t.notes) totalBeats = Math.max(totalBeats, beat + dur)
  }
  totalBeats = Math.ceil(totalBeats / 4) * 4 || 16

  for (const t of comp.tracks) {
    const gain = t.gain ?? 0.4
    for (const [beat, midi, dur] of t.notes) {
      scheduleNote(ctx, analyser, t.wave, gain, startTime + beat * spb, midi, Math.max(0.05, dur * spb))
    }
  }
  const loopDur = totalBeats * spb
  loopTimer = setTimeout(() => scheduleLoop(startTime + loopDur), (startTime + loopDur - ctx.currentTime - 0.25) * 1000)
}

function drawSpectrum() {
  const canvas = canvasRef.value
  if (!canvas || !analyser) return
  const c2d = canvas.getContext('2d')!
  const data = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(data)
  const w = canvas.width
  const h = canvas.height
  c2d.clearRect(0, 0, w, h)
  const bars = 48
  const colors = ['#8b6dff', '#5ba0f6', '#22d3ee', '#2bd4c4', '#34d399']
  for (let i = 0; i < bars; i++) {
    const v = data[Math.floor((i / bars) * data.length * 0.7)] / 255
    const bh = Math.max(2, v * h * 0.92)
    const bw = w / bars
    c2d.fillStyle = colors[Math.floor((i / bars) * colors.length)]
    c2d.globalAlpha = 0.35 + v * 0.65
    c2d.beginPath()
    c2d.roundRect(i * bw + 1.5, h - bh, bw - 3, bh, 2)
    c2d.fill()
  }
  c2d.globalAlpha = 1
  raf = requestAnimationFrame(drawSpectrum)
}

async function play() {
  stop()
  ctx = new AudioContext()
  const master = ctx.createGain()
  master.gain.value = 0.55
  analyser = ctx.createAnalyser()
  analyser.fftSize = 256
  analyser.connect(master)
  master.connect(ctx.destination)
  scheduleLoop(ctx.currentTime + 0.08)
  playing.value = true
  raf = requestAnimationFrame(drawSpectrum)
}

function stop() {
  if (loopTimer) clearTimeout(loopTimer)
  cancelAnimationFrame(raf)
  if (ctx) {
    ctx.close()
    ctx = null
  }
  analyser = null
  playing.value = false
}

watch(() => props.composition, stop)
onBeforeUnmount(stop)
</script>

<template>
  <div class="glass overflow-hidden">
    <div class="flex items-center gap-4 border-b border-line p-5">
      <button
        class="spectrum-bg flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-lg shadow-brand/30 transition hover:brightness-110"
        @click="playing ? stop() : play()"
      >
        <svg v-if="!playing" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h4v12H6zm8 0h4v12h-4z" />
        </svg>
      </button>
      <div class="min-w-0 flex-1">
        <div class="truncate font-semibold text-t1">{{ composition.title || 'AI 作曲' }}</div>
        <div class="mt-0.5 text-xs text-t3">
          {{ composition.bpm }} BPM{{ composition.key ? ` · ${composition.key}` : '' }} ·
          {{ composition.tracks.length }} 轨 · 循环播放
        </div>
      </div>
      <div class="flex flex-wrap justify-end gap-1.5">
        <span
          v-for="t in composition.tracks"
          :key="t.name"
          class="rounded-md border border-line px-2 py-0.5 font-mono text-[11px] text-t3"
        >
          {{ t.name }}
        </span>
      </div>
    </div>
    <canvas ref="canvasRef" width="900" height="130" class="h-[110px] w-full" />
  </div>
</template>
