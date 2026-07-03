<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

/** 棱镜折射 Canvas 动画：白色入射光穿过棱镜，折射为流动光谱 */
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0
let start = 0

const SPECTRUM = ['#8b6dff', '#5ba0f6', '#22d3ee', '#2bd4c4', '#34d399']

function draw(ts: number) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (canvas.width !== w * dpr) {
    canvas.width = w * dpr
    canvas.height = h * dpr
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  if (!start) start = ts
  const t = (ts - start) / 1000
  const progress = (t % 6) / 6

  const cx = w * 0.5
  const cy = h * 0.54
  const size = Math.min(w, h) * 0.3

  // 背景辉光
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 2.6)
  glow.addColorStop(0, 'rgba(139,109,255,0.16)')
  glow.addColorStop(0.5, 'rgba(34,211,238,0.05)')
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  // 入射白光（脉动）
  const pulse = 0.7 + 0.3 * Math.sin(t * 2)
  const bx = cx - size * 0.32
  const by = cy - size * 0.1
  const beam = ctx.createLinearGradient(0, h * 0.3, bx, by)
  beam.addColorStop(0, 'rgba(255,255,255,0)')
  beam.addColorStop(1, `rgba(255,255,255,${0.85 * pulse})`)
  ctx.strokeStyle = beam
  ctx.lineWidth = 2.6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, h * 0.3)
  ctx.lineTo(bx, by)
  ctx.stroke()

  // 光谱射线 + 流动光子
  const ox = cx + size * 0.3
  const oy = cy
  SPECTRUM.forEach((color, i) => {
    const k = i / (SPECTRUM.length - 1)
    const angle = -0.4 + k * 0.8
    const len = w * 0.58
    const ex = ox + Math.cos(angle) * len
    const ey = oy + Math.sin(angle) * len

    const ray = ctx.createLinearGradient(ox, oy, ex, ey)
    ray.addColorStop(0, color + 'c0')
    ray.addColorStop(1, color + '00')
    ctx.strokeStyle = ray
    ctx.lineWidth = 2.2
    ctx.beginPath()
    ctx.moveTo(ox, oy)
    ctx.lineTo(ex, ey)
    ctx.stroke()

    for (let p = 0; p < 2; p++) {
      const phase = (progress + i * 0.13 + p * 0.5) % 1
      const px = ox + (ex - ox) * phase
      const py = oy + (ey - oy) * phase
      ctx.fillStyle = color
      ctx.globalAlpha = (1 - phase) * 0.9
      ctx.beginPath()
      ctx.arc(px, py, 3 * (1 - phase * 0.5), 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }
  })

  // 棱镜三角
  const p1 = { x: cx, y: cy - size * 0.62 }
  const p2 = { x: cx + size * 0.56, y: cy + size * 0.42 }
  const p3 = { x: cx - size * 0.56, y: cy + size * 0.42 }
  const fill = ctx.createLinearGradient(p1.x, p1.y, p1.x, p2.y)
  fill.addColorStop(0, 'rgba(255,255,255,0.13)')
  fill.addColorStop(1, 'rgba(139,109,255,0.08)')
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.lineTo(p3.x, p3.y)
  ctx.closePath()
  ctx.fill()
  const stroke = ctx.createLinearGradient(p3.x, p1.y, p2.x, p2.y)
  stroke.addColorStop(0, 'rgba(255,255,255,0.75)')
  stroke.addColorStop(1, 'rgba(34,211,238,0.6)')
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1.6
  ctx.stroke()

  // 环绕粒子（确定性伪随机）
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < 30; i++) {
    const baseAngle = rand() * Math.PI * 2
    const dist = size * (1.1 + rand() * 1.9)
    const speed = 0.3 + rand() * 0.7
    const a = baseAngle + t * speed * 0.35
    const px = cx + Math.cos(a) * dist
    const py = cy + Math.sin(a) * dist * 0.55
    ctx.fillStyle = SPECTRUM[i % SPECTRUM.length]
    ctx.globalAlpha = 0.4 + 0.2 * Math.sin(t + i)
    ctx.beginPath()
    ctx.arc(px, py, 1.3 + rand(), 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  raf = requestAnimationFrame(draw)
}

onMounted(() => {
  raf = requestAnimationFrame(draw)
})

onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <canvas ref="canvasRef" class="pointer-events-none absolute inset-0 h-full w-full" />
</template>
