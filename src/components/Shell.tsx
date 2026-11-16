import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion'
import { Mail } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { PROFILE } from '../data/content'
import { Link, useRouter } from '../lib/router'
import { Magnetic, ease } from './fx'

export const NAV = [
  { to: '#about', label: 'About', n: '01' },
  { to: '#projects', label: 'Projects', n: '02' },
  { to: '#skills', label: 'Skills', n: '03' },
  { to: '#education', label: 'Education', n: '04' },
  { to: '#contact', label: 'Contact', n: '05' },
]

/* GitHub / LinkedIn marks (lucide dropped brand icons) */
export function GitHubIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}
export function LinkedInIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

/* ---------------- Loader (GSAP timeline) ---------------- */
export function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = root.current!
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let ctx: { revert: () => void } | undefined
    let cancelled = false
    // GSAP is only fetched for the first-visit intro; returning visitors never download it.
    import('gsap').then(({ default: gsap }) => {
      if (cancelled) return
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ onComplete: onDone })
        if (reduce) {
          tl.to(el, { autoAlpha: 0, duration: 0.25, delay: 0.2 })
          return
        }
        tl.fromTo('.ld-char', { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06 })
          .fromTo('.ld-line', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 0.8, ease: 'expo.inOut' }, '-=0.45')
          .to('.ld-count', { innerText: 100, duration: 0.8, snap: { innerText: 1 }, ease: 'power2.inOut' }, '<')
          .fromTo('.ld-meta', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.05 }, '<')
          .to('.ld-char', { yPercent: -110, duration: 0.5, ease: 'expo.in', stagger: 0.03 }, '+=0.05')
          .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.75, ease: 'expo.inOut' }, '-=0.2')
      }, el)
    }).catch(onDone)
    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [onDone])
  return (
    <div ref={root} className="fixed inset-0 z-[100] flex flex-col justify-between bg-void p-6 sm:p-10" style={{ clipPath: 'inset(0 0 0% 0)' }} role="status" aria-label="Loading portfolio">
      <div className="label flex justify-between">
        <span className="ld-meta">Portfolio — 2026</span>
        <span className="ld-meta">Chemnitz, DE</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex overflow-hidden font-display text-[clamp(5rem,20vw,15rem)] font-medium leading-[0.85] tracking-[-0.06em]">
          {PROFILE.initials.split('').map((c, i) => (
            <span key={i} className={`ld-char inline-block translate-y-[110%] ${i === 1 ? 'text-volt' : ''}`}>
              {c}
            </span>
          ))}
        </div>
        <div className="ld-line mt-8 h-px w-[min(60vw,420px)] bg-gradient-to-r from-volt via-iris to-transparent" />
      </div>
      <div className="flex items-end justify-between">
        <span className="ld-meta label">Building intelligent digital experiences</span>
        <span className="font-mono text-sm text-mist">
          <span className="ld-count">0</span>%
        </span>
      </div>
    </div>
  )
}

/* ---------------- Smooth scroll ---------------- */
export function useSmoothScroll() {
  const { route } = useRouter()
  const lenis = useRef<Lenis | null>(null)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const l = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })
    lenis.current = l
    let raf = 0
    const tick = (t: number) => {
      l.raf(t)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const top = () => l.scrollTo(0, { duration: 1.2 })
    addEventListener('folio:top', top)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('folio:top', top)
      l.destroy()
    }
  }, [])
  useEffect(() => {
    if (lenis.current) lenis.current.scrollTo(0, { immediate: true })
    else scrollTo(0, 0)
  }, [route])
  useEffect(() => {
    const top = () => scrollTo({ top: 0, behavior: 'smooth' })
    if (!lenis.current) addEventListener('folio:top', top)
    return () => removeEventListener('folio:top', top)
  }, [])
}

/* ---------------- Custom cursor ---------------- */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const [mode, setMode] = useState<'idle' | 'link' | 'view' | 'text'>('idle')
  const [on, setOn] = useState(false)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setOn(true)
    document.body.classList.add('has-cursor')
    let first = true
    let x = innerWidth / 2,
      y = innerHeight / 2,
      rx = x,
      ry = y,
      raf = 0
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (first) {
        first = false
        rx = x
        ry = y
        setSeen(true)
      }
      const t = (e.target as HTMLElement)?.closest?.('[data-cursor], a, button, input, textarea, select, label') as HTMLElement | null
      if (!t) {
        setMode('idle')
        setLabel('')
      } else if (t.dataset.cursor === 'view') {
        setMode('view')
        setLabel(t.dataset.cursorLabel || 'View')
      } else if (t.matches('input, textarea')) {
        setMode('text')
        setLabel('')
      } else {
        setMode('link')
        setLabel('')
      }
    }
    const loop = () => {
      rx += (x - rx) * 0.16
      ry += (y - ry) * 0.16
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    const leave = () => setMode('idle')
    addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    loop()
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      document.body.classList.remove('has-cursor')
    }
  }, [])

  if (!on) return null
  const size = mode === 'view' ? 92 : mode === 'link' ? 54 : mode === 'text' ? 4 : 34
  return (
    <>
      <div ref={ring} className={`pointer-events-none fixed left-0 top-0 z-[95] mix-blend-difference transition-opacity duration-500 ${seen ? 'opacity-100' : 'opacity-0'}`} aria-hidden>
        <div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,background-color,border-color] duration-500 ease-expo ${mode === 'view' ? 'bg-bone' : 'border border-bone/70'} flex items-center justify-center`}
          style={{ width: size, height: mode === 'text' ? 28 : size }}
        >
          {mode === 'view' && <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-void">{label}</span>}
        </div>
      </div>
      <div ref={dot} className={`pointer-events-none fixed left-0 top-0 z-[96] ${seen ? '' : 'opacity-0'}`} aria-hidden>
        <div className={`h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-volt transition-opacity ${mode === 'idle' ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    </>
  )
}

/* ---------------- Scroll progress ---------------- */
export function Progress() {
  const { scrollYProgress } = useScroll()
  const s = useSpring(scrollYProgress, { stiffness: 140, damping: 26 })
  return <motion.div className="fixed left-0 right-0 top-0 z-[80] h-[2px] origin-left bg-gradient-to-r from-volt to-iris" style={{ scaleX: s }} aria-hidden />
}

/* ---------------- Clock (local Chemnitz time) ---------------- */
function useBerlinTime() {
  const [t, setT] = useState('')
  useEffect(() => {
    const f = () => setT(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' }).format(new Date()))
    f()
    const id = setInterval(f, 15000)
    return () => clearInterval(id)
  }, [])
  return t
}

/* ---------------- Header + menu ---------------- */
export function Header() {
  const { route } = useRouter()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const time = useBerlinTime()
  useMotionValueEvent(scrollY, 'change', (v) => {
    const p = scrollY.getPrevious() ?? 0
    setScrolled(v > 30)
    setHidden(v > 500 && v > p + 2 && !open)
    if (v < p - 2) setHidden(false)
  })
  useEffect(() => setOpen(false), [route])
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [open])

  const current = route.name === 'project' ? '#projects' : `#${route.name}`

  return (
    <>
      <motion.header className="fixed inset-x-0 top-0 z-[60]" animate={{ y: hidden ? '-110%' : '0%' }} transition={{ duration: 0.6, ease }}>
        <div className={`wrap flex h-[72px] items-center justify-between transition-[background-color,backdrop-filter] duration-500 sm:h-20 ${scrolled && !open ? 'bg-void/55 backdrop-blur-xl' : ''}`}>
          <Link to="#about" className="group flex items-center gap-3" aria-label="Daniyal Naqvi — About" data-cursor="link">
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-bone font-display text-[13px] font-semibold tracking-tight text-void">
              <span className="transition-transform duration-500 ease-expo group-hover:-translate-y-8">DN</span>
              <span className="absolute translate-y-8 transition-transform duration-500 ease-expo group-hover:translate-y-0">↑</span>
            </span>
            <span className="hidden font-display text-[15px] font-medium tracking-tight sm:block">
              Daniyal Naqvi<span className="text-volt">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full bg-white/[0.04] p-1 ring-1 ring-inset ring-white/10 backdrop-blur-md lg:flex" aria-label="Primary">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} aria-current={current === n.to ? 'page' : undefined} className="group relative rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mist transition-colors hover:text-bone" data-cursor="link">
                {current === n.to && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/[0.08]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className="relative">
                  <span className={`mr-1.5 transition-colors ${current === n.to ? 'text-volt' : 'text-dim group-hover:text-volt'}`}>{n.n}.</span>
                  <span className={current === n.to ? 'text-bone' : ''}>{n.label}</span>
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-mist xl:block">Chemnitz · {time}</span>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('folio:palette'))}
              className="hidden h-11 items-center gap-2 rounded-full px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-mist ring-1 ring-inset ring-white/10 transition hover:text-bone hover:ring-white/30 md:flex"
              aria-label="Open command menu (Ctrl+K)"
              data-cursor="link"
            >
              <kbd className="font-mono">⌘K</kbd>
            </button>
            <Magnetic>
              <button
                onClick={() => setOpen((o) => !o)}
                className="group relative flex h-11 items-center gap-3 rounded-full bg-bone pl-5 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-void lg:hidden"
                aria-expanded={open}
                aria-controls="menu"
                aria-label={open ? 'Close menu' : 'Open menu'}
                data-cursor="link"
              >
                {open ? 'Close' : 'Menu'}
                <span className="relative block h-2.5 w-4">
                  <span className={`absolute left-0 h-[1.5px] w-full bg-void transition-all duration-500 ease-expo ${open ? 'top-1 rotate-45' : 'top-0'}`} />
                  <span className={`absolute left-0 h-[1.5px] w-full bg-void transition-all duration-500 ease-expo ${open ? 'top-1 -rotate-45' : 'top-2'}`} />
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            className="fixed inset-0 z-[55] flex flex-col bg-coal/95 pt-24 backdrop-blur-2xl lg:hidden"
            initial={{ clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.85, ease }}
          >
            <nav className="wrap flex flex-1 flex-col justify-center" aria-label="Mobile">
              {NAV.map((n, i) => (
                <motion.div key={n.to} className="overflow-hidden border-b border-white/[0.07]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }}>
                  <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ delay: 0.15 + i * 0.06, duration: 0.9, ease }}>
                    <Link to={n.to} className="flex items-baseline justify-between py-3">
                      <span className={`h-display text-[clamp(2.6rem,11vw,4.5rem)] ${current === n.to ? 'text-volt' : ''}`}>{n.label}</span>
                      <span className="font-mono text-xs text-dim">{n.n}</span>
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </nav>
            <div className="wrap flex items-center justify-between py-6">
              <div className="flex gap-5 text-mist">
                <a href={PROFILE.github} target="_blank" rel="noreferrer" aria-label="GitHub"><GitHubIcon className="h-5 w-5" /></a>
                <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedInIcon className="h-5 w-5" /></a>
                <a href={`mailto:${PROFILE.email}`} aria-label="Email"><Mail className="h-5 w-5" /></a>
              </div>
              <button onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent('folio:palette')) }} className="label rounded-full px-3 py-1.5 ring-1 ring-inset ring-white/15">Quick menu</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ---------------- Footer ---------------- */
export function Footer() {
  const time = useBerlinTime()
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-void">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[80%] -translate-x-1/2 rounded-full bg-volt/20 blur-[120px]" aria-hidden />
      <div className="wrap relative grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="label mb-4">Currently</p>
          <p className="max-w-md font-display text-2xl leading-snug tracking-tight text-bone/90">
            B.Sc. Data Science at TU Chemnitz — open to <span className="text-volt">Werkstudent</span> roles in Data Science, ML, AI and Software Development.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:col-span-5 md:col-start-8">
          <div>
            <p className="label mb-4">Sitemap</p>
            <ul className="space-y-2.5">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-mist transition-colors hover:text-bone">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label mb-4">Elsewhere</p>
            <ul className="space-y-2.5">
              <li><a className="text-mist hover:text-bone" href={PROFILE.github} target="_blank" rel="noreferrer">GitHub ↗</a></li>
              <li><a className="text-mist hover:text-bone" href={PROFILE.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
              <li><a className="break-all text-mist hover:text-bone" href={`mailto:${PROFILE.email}`}>Email</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="wrap relative">
        <p className="h-display select-none whitespace-nowrap text-[clamp(3rem,13.4vw,13.5rem)] text-white/[0.06]" aria-hidden>
          Daniyal Naqvi
        </p>
      </div>
      <div className="wrap relative flex flex-col gap-2 border-t border-white/[0.06] py-6 font-mono text-[11px] uppercase tracking-[0.14em] text-dim sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Syed Daniyal Haider Naqvi</span>
        <span>Chemnitz · {time} CET</span>
      </div>
    </footer>
  )
}

/* ---------------- Page transition ---------------- */
export function Page({ id, children }: { id: string; children: ReactNode }) {
  return (
    <motion.main
      key={id}
      id="main"
      tabIndex={-1}
      className="outline-none"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.9, ease, delay: 0.25 } }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.35, ease } }}
    >
      {children}
    </motion.main>
  )
}

export function Wipe({ id }: { id: string }) {
  return (
    <motion.div
      key={`wipe-${id}`}
      className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-coal"
      initial={{ clipPath: 'inset(0% 0 0% 0)' }}
      animate={{ clipPath: 'inset(0% 0 100% 0)' }}
      transition={{ duration: 0.8, ease, delay: 0.1 }}
      aria-hidden
    >
      <motion.span className="h-display text-4xl text-bone/80" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        {NAV.find((n) => n.to === `#${id}`)?.label ?? (id.startsWith('project-') ? 'Case study' : '')}
      </motion.span>
    </motion.div>
  )
}

/* ---------------- Ambient background particles (cheap 2D canvas) ---------------- */
export function Ambient() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')
    if (!ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let w = 0,
      h = 0,
      raf = 0
    const dpr = Math.min(devicePixelRatio, 1.5)
    const n = innerWidth < 768 ? 28 : 60
    const ps = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + 0.3, s: Math.random() * 0.00025 + 0.00006, a: Math.random() * 0.5 + 0.15 }))
    const size = () => {
      w = c.width = innerWidth * dpr
      h = c.height = innerHeight * dpr
    }
    size()
    addEventListener('resize', size)
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (document.hidden) return
      ctx.clearRect(0, 0, w, h)
      for (const p of ps) {
        p.y -= p.s
        if (p.y < -0.02) p.y = 1.02
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, p.r * dpr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139,164,255,${p.a})`
        ctx.fill()
      }
    }
    loop()
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', size)
    }
  }, [])
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60" aria-hidden />
}
