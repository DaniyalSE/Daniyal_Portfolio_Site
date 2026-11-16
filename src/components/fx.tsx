import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from '../lib/router'

export const ease = [0.16, 1, 0.3, 1] as const

/* ---------- Reveal (scroll-triggered) ---------- */
export function Reveal({ children, delay = 0, y = 32, className = '' }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const r = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: r ? 0 : y, filter: r ? 'none' : 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 1.1, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ---------- Masked line/word reveal ---------- */
export function Lines({
  lines,
  className = '',
  delay = 0,
  stagger = 0.08,
  mount = false,
}: {
  lines: ReactNode[]
  className?: string
  delay?: number
  stagger?: number
  mount?: boolean
}) {
  const r = useReducedMotion()
  const c: Variants = { h: {}, s: { transition: { staggerChildren: stagger, delayChildren: delay } } }
  const l: Variants = { h: { y: r ? 0 : '105%', rotate: r ? 0 : 2 }, s: { y: '0%', rotate: 0, transition: { duration: 1.2, ease } } }
  const t = mount ? { initial: 'h', animate: 's' } : { initial: 'h', whileInView: 's', viewport: { once: true, margin: '-6% 0px' } }
  return (
    <motion.span className={`block ${className}`} variants={c} {...t}>
      {lines.map((x, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span className="block origin-top-left will-change-transform" variants={l}>
            {x}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

/* ---------- Character stagger (used for the name) ---------- */
export function Chars({ text, className = '', delay = 0, mount = true }: { text: string; className?: string; delay?: number; mount?: boolean }) {
  const r = useReducedMotion()
  const c: Variants = { h: {}, s: { transition: { staggerChildren: 0.025, delayChildren: delay } } }
  const ch: Variants = { h: { y: r ? 0 : '110%', opacity: 0 }, s: { y: '0%', opacity: 1, transition: { duration: 0.9, ease } } }
  const t = mount ? { initial: 'h', animate: 's' } : { initial: 'h', whileInView: 's', viewport: { once: true } }
  return (
    <motion.span className={`inline-flex flex-wrap ${className}`} variants={c} {...t} aria-label={text}>
      {text.split(' ').map((w, wi) => (
        <span key={wi} className="mr-[0.28em] inline-flex overflow-hidden" aria-hidden>
          {w.split('').map((x, i) => (
            <motion.span key={i} className="inline-block" variants={ch}>
              {x}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  )
}

/* ---------- Text scramble (decode effect) ---------- */
const GLYPHS = '01<>/{}[]#$%&*+=?ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export function Scramble({ text, className = '', speed = 28, trigger = true }: { text: string; className?: string; speed?: number; trigger?: boolean }) {
  const [out, setOut] = useState(text)
  const r = useReducedMotion()
  useEffect(() => {
    if (!trigger || r) {
      setOut(text)
      return
    }
    let frame = 0
    const total = text.length * 2 + 8
    const id = setInterval(() => {
      frame++
      const revealed = Math.max(0, frame - 8) / 2
      setOut(
        text
          .split('')
          .map((c, i) => (c === ' ' ? ' ' : i < revealed ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join(''),
      )
      if (frame >= total) {
        clearInterval(id)
        setOut(text)
      }
    }, speed)
    return () => clearInterval(id)
  }, [text, trigger, speed, r])
  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  )
}

/* ---------- Magnetic wrapper ---------- */
export function Magnetic({ children, strength = 0.3, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const r = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 15, mass: 0.35 })
  const sy = useSpring(y, { stiffness: 180, damping: 15, mass: 0.35 })
  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (r || e.pointerType !== 'mouse' || !ref.current) return
        const b = ref.current.getBoundingClientRect()
        x.set((e.clientX - b.left - b.width / 2) * strength)
        y.set((e.clientY - b.top - b.height / 2) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

/* ---------- Buttons (pill with liquid fill) ---------- */
type V = 'solid' | 'ghost' | 'volt'
export function Btn({
  children,
  to,
  href,
  onClick,
  variant = 'solid',
  icon = true,
  external,
  type = 'button',
  disabled,
  className = '',
  ariaLabel,
  download,
}: {
  children: ReactNode
  to?: string
  href?: string
  onClick?: () => void
  variant?: V
  icon?: boolean | ReactNode
  external?: boolean
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  ariaLabel?: string
  download?: string
}) {
  const base: Record<V, string> = {
    solid: 'bg-bone text-void',
    volt: 'bg-volt text-void',
    ghost: 'text-bone ring-1 ring-inset ring-white/20',
  }
  const fill: Record<V, string> = { solid: 'bg-volt', volt: 'bg-bone', ghost: 'bg-bone' }
  const hov: Record<V, string> = { solid: 'group-hover:text-void', volt: 'group-hover:text-void', ghost: 'group-hover:text-void' }
  const inner = (
    <>
      <span className={`absolute left-1/2 top-full aspect-square w-[160%] -translate-x-1/2 rounded-full transition-transform duration-[650ms] ease-expo group-hover:-translate-y-[62%] ${fill[variant]}`} aria-hidden />
      <span className={`relative z-10 flex items-center gap-2.5 transition-colors duration-300 ${hov[variant]}`}>
        {children}
        {icon &&
          (icon === true ? (
            <span className="relative block h-4 w-4 overflow-hidden">
              <ArrowUpRight className="absolute inset-0 h-4 w-4 transition-transform duration-500 ease-expo group-hover:-translate-y-full group-hover:translate-x-full" strokeWidth={1.8} />
              <ArrowUpRight className="absolute inset-0 h-4 w-4 -translate-x-full translate-y-full transition-transform duration-500 ease-expo group-hover:translate-x-0 group-hover:translate-y-0" strokeWidth={1.8} />
            </span>
          ) : (
            icon
          ))}
      </span>
    </>
  )
  const cls = `group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full px-6 font-mono text-[12px] uppercase tracking-[0.14em] disabled:pointer-events-none disabled:opacity-40 sm:h-14 sm:px-7 ${base[variant]} ${className}`
  let el
  if (to)
    el = (
      <Link to={to} className={cls} data-cursor="link" aria-label={ariaLabel}>
        {inner}
      </Link>
    )
  else if (href)
    el = (
      <a href={href} download={download} className={cls} target={external ? '_blank' : undefined} rel={external ? 'noreferrer noopener' : undefined} data-cursor="link" aria-label={ariaLabel} onClick={onClick}>
        {inner}
      </a>
    )
  else
    el = (
      <button type={type} onClick={onClick} disabled={disabled} className={cls} data-cursor="link" aria-label={ariaLabel}>
        {inner}
      </button>
    )
  return <Magnetic>{el}</Magnetic>
}

/* ---------- Image with blur-up ---------- */
export function Img({ src, alt, className = '', imgClassName = '', eager = false, sizes }: { src: string; alt: string; className?: string; imgClassName?: string; eager?: boolean; sizes?: string }) {
  const [ok, setOk] = useState(false)
  const [bad, setBad] = useState(false)
  return (
    <div className={`${/\b(absolute|fixed)\b/.test(className) ? '' : 'relative'} overflow-hidden bg-coal ${className}`}>
      {!bad && (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          // @ts-expect-error fetchpriority is valid HTML
          fetchpriority={eager ? 'high' : undefined}
          onLoad={() => setOk(true)}
          onError={() => setBad(true)}
          className={`h-full w-full object-cover transition-[opacity,filter,transform] duration-[1400ms] ease-expo ${ok ? 'opacity-100 blur-0' : 'scale-105 opacity-0 blur-xl'} ${imgClassName}`}
        />
      )}
    </div>
  )
}

/* ---------- Parallax image ---------- */
export function Parallax({ src, alt, className = '', amount = 12 }: { src: string; alt: string; className?: string; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const r = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], r ? ['0%', '0%'] : [`-${amount}%`, `${amount}%`])
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-[-14%]">
        <Img src={src} alt={alt} className="h-full w-full" />
      </motion.div>
    </div>
  )
}

/* ---------- Section label ---------- */
export function Eyebrow({ n, children, className = '' }: { n?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`label flex items-center gap-3 ${className}`}>
      {n && <span className="text-volt">{n}</span>}
      <span className="h-px w-8 bg-white/25" />
      <span>{children}</span>
    </div>
  )
}

/* ---------- Marquee ---------- */
export function Marquee({ items, className = '', d = 40, reverse = false }: { items: ReactNode[]; className?: string; d?: number; reverse?: boolean }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((x, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 sm:px-10">{x}</span>
          <span className="h-1.5 w-1.5 rotate-45 bg-volt" aria-hidden />
        </span>
      ))}
    </div>
  )
  return (
    <div className={`mask-fade-x flex overflow-hidden whitespace-nowrap ${className}`} aria-hidden>
      <div className="marquee flex" style={{ ['--d' as string]: `${d}s`, animationDirection: reverse ? 'reverse' : 'normal' }}>
        {row}
        {row}
      </div>
    </div>
  )
}

/* ---------- Spotlight card hover (cursor-following glow) ---------- */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const on = (e: PointerEvent) => {
      const b = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - b.left}px`)
      el.style.setProperty('--my', `${e.clientY - b.top}px`)
    }
    el.addEventListener('pointermove', on)
    return () => el.removeEventListener('pointermove', on)
  }, [])
  return ref
}
