import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Interactive particle "mind": 9k points that morph between three forms
 * (sphere → neural layers → torus knot) as the visitor scrolls / clicks,
 * repel from the cursor and drift with the pointer. Runs only while visible.
 */
const N_DESKTOP = 9000
const N_MOBILE = 4200

function sphere(n: number) {
  const a = new Float32Array(n * 3)
  const g = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const t = g * i
    const rr = 1.55 + (Math.random() - 0.5) * 0.06
    a[i * 3] = Math.cos(t) * r * rr
    a[i * 3 + 1] = y * rr
    a[i * 3 + 2] = Math.sin(t) * r * rr
  }
  return a
}

function layers(n: number) {
  // A neural-network-like stack of 5 layers of nodes
  const a = new Float32Array(n * 3)
  const L = 5
  for (let i = 0; i < n; i++) {
    const l = i % L
    const x = (l - (L - 1) / 2) * 0.85
    const ang = Math.random() * Math.PI * 2
    const rad = Math.sqrt(Math.random()) * (l === 0 || l === L - 1 ? 0.9 : 1.35)
    a[i * 3] = x + (Math.random() - 0.5) * 0.05
    a[i * 3 + 1] = Math.sin(ang) * rad
    a[i * 3 + 2] = Math.cos(ang) * rad * 0.6
  }
  return a
}

function knot(n: number) {
  const a = new Float32Array(n * 3)
  const p = 2,
    q = 3
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    const r = 0.9 + 0.38 * Math.cos(q * t)
    const cx = r * Math.cos(p * t)
    const cy = r * Math.sin(p * t)
    const cz = 0.38 * Math.sin(q * t)
    const s = 0.16
    a[i * 3] = cx * 1.15 + (Math.random() - 0.5) * s
    a[i * 3 + 1] = cy * 1.15 + (Math.random() - 0.5) * s
    a[i * 3 + 2] = cz * 1.15 + (Math.random() - 0.5) * s
  }
  return a
}

const vert = /* glsl */ `
  attribute vec3 aB;
  attribute vec3 aC;
  attribute float aRand;
  uniform float uTime;
  uniform float uMorph;
  uniform vec2 uMouse;
  uniform float uPixel;
  uniform float uIntro;
  varying float vMix;
  varying float vAlpha;

  void main() {
    float m1 = smoothstep(0.0, 1.0, clamp(uMorph, 0.0, 1.0));
    float m2 = smoothstep(0.0, 1.0, clamp(uMorph - 1.0, 0.0, 1.0));
    vec3 p = mix(mix(position, aB, m1), aC, m2);

    // organic breathing
    float n = sin(p.x * 2.1 + uTime * 0.7 + aRand * 6.28) * cos(p.y * 1.7 + uTime * 0.5);
    p += normalize(p + 0.0001) * n * 0.045;
    // intro: scatter -> form
    p = mix(p * (2.6 + aRand * 3.0), p, uIntro);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 d = ndc - uMouse;
    float dist = length(d);
    float push = smoothstep(0.32, 0.0, dist) * 0.22;
    clip.xy += normalize(d + 0.0001) * push * clip.w;
    gl_Position = clip;

    float size = (1.6 + aRand * 2.2) * uPixel;
    gl_PointSize = size * (5.0 / -mv.z);
    vMix = clamp(p.x * 0.35 + 0.5 + push * 2.0, 0.0, 1.0);
    vAlpha = 0.35 + aRand * 0.65;
  }
`

const frag = /* glsl */ `
  varying float vMix;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    vec3 blue = vec3(0.325, 0.482, 1.0);
    vec3 violet = vec3(0.62, 0.45, 1.0);
    vec3 white = vec3(0.95, 0.95, 0.94);
    vec3 col = mix(blue, violet, vMix);
    col = mix(col, white, pow(glow, 6.0) * 0.6);
    gl_FragColor = vec4(col, glow * vAlpha);
  }
`

export default function HeroScene({ morph }: { morph: { current: number } }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const small = innerWidth < 768
    const N = small ? N_MOBILE : N_DESKTOP

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
    } catch {
      return // no WebGL: the static backdrop still carries the hero
    }
    const dpr = Math.min(devicePixelRatio, 1.6)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50)
    camera.position.set(0, 0, 5.6)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(sphere(N), 3))
    geo.setAttribute('aB', new THREE.BufferAttribute(layers(N), 3))
    geo.setAttribute('aC', new THREE.BufferAttribute(knot(N), 3))
    const rnd = new Float32Array(N)
    for (let i = 0; i < N; i++) rnd[i] = Math.random()
    geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1))

    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uPixel: { value: dpr * (small ? 1.25 : 1) },
      uIntro: { value: reduce ? 1 : 0 },
    }
    const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
    const pts = new THREE.Points(geo, mat)
    const group = new THREE.Group()
    group.add(pts)
    scene.add(group)

    // orbit ring
    const ringGeo = new THREE.RingGeometry(2.25, 2.252, 160)
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x537bff, transparent: true, opacity: 0.25, side: THREE.DoubleSide }))
    ring.rotation.x = Math.PI / 2.3
    group.add(ring)

    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      camera.aspect = w / h
      // keep the object comfortably framed on portrait screens
      camera.position.z = w / h < 0.8 ? 7.6 : 5.6
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const target = new THREE.Vector2(9, 9)
    const tilt = new THREE.Vector2()
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect()
      target.set(((e.clientX - b.left) / b.width) * 2 - 1, -(((e.clientY - b.top) / b.height) * 2 - 1))
      tilt.set(target.x, target.y)
    }
    const onLeave = () => target.set(9, 9)
    addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)

    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 })
    io.observe(el)

    const clock = new THREE.Clock()
    let raf = 0
    let introStart = -1
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible || document.hidden) return
      const t = clock.getElapsedTime()
      if (introStart < 0) introStart = t
      uniforms.uTime.value = t
      if (!reduce) uniforms.uIntro.value = Math.min(1, uniforms.uIntro.value + (1 - uniforms.uIntro.value) * 0.035)
      uniforms.uMorph.value += (morph.current - uniforms.uMorph.value) * 0.045
      uniforms.uMouse.value.lerp(target, 0.12)
      if (!reduce) {
        group.rotation.y = t * 0.08 + tilt.x * 0.35
        group.rotation.x = -tilt.y * 0.22 + Math.sin(t * 0.3) * 0.05
        ring.rotation.z = t * 0.15
      }
      renderer.render(scene, camera)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      geo.dispose()
      mat.dispose()
      ringGeo.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [morph])

  return <div ref={host} className="absolute inset-0" aria-hidden />
}
