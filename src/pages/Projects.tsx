import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { useRef } from 'react'
import { MORE_PROJECTS, PROJECTS, type Project } from '../data/content'
import { Link } from '../lib/router'
import { Btn, Eyebrow, Img, Lines, Reveal, ease, useSpotlight } from '../components/fx'
import { GitHubIcon } from '../components/Shell'

/* Sticky stacking panels: each project pins, then scales back as the next slides over it. */
function Panel({ p, i, total, progress }: { p: Project; i: number; total: number; progress: MotionValue<number> }) {
  const reduce = useReducedMotion()
  const start = i / total
  const scale = useTransform(progress, [start, 1], [1, reduce ? 1 : 1 - (total - i) * 0.045])
  const dim = useTransform(progress, [start, Math.min(1, start + 1 / total)], [0, reduce ? 0 : 0.55])
  return (
    <div className="sticky top-0 flex h-[100svh] items-center" style={{ zIndex: i + 1 }}>
      <motion.div style={{ scale, top: `calc(${i * 14}px)` }} className="wrap relative w-full origin-top">
        <Link to={`#project-${p.id}`} data-cursor="view" data-cursor-label="Open" className="group relative block overflow-hidden rounded-[28px] bg-coal ring-1 ring-inset ring-white/[0.07]">
          <div className="grid min-h-[72svh] md:grid-cols-12">
            <div className="relative order-2 flex flex-col justify-between gap-10 p-7 sm:p-10 md:order-1 md:col-span-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-dim">{p.index} / 0{total}</span>
                  <span className="label">{p.date}</span>
                </div>
                <h2 className="h-display mt-8 text-[clamp(2.4rem,5vw,4.8rem)]">{p.title}</h2>
                <p className="mt-5 max-w-[38ch] text-[15px] leading-relaxed text-bone/70">{p.summary}</p>
              </div>
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <span key={s} className="rounded-full bg-white/[0.05] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mist">{s}</span>
                  ))}
                </div>
                <span className="mt-8 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em]">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-bone text-void transition-transform duration-700 ease-expo group-hover:rotate-45 group-hover:bg-volt">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  Read the case study
                </span>
              </div>
            </div>
            <div className="relative order-1 aspect-[16/10] overflow-hidden md:order-2 md:col-span-7 md:aspect-auto">
              <Img src={p.image!} alt={`${p.title} — visual`} className="absolute inset-0" imgClassName="transition-transform duration-[1800ms] ease-expo group-hover:scale-[1.06]" />
              <div className="absolute inset-0 bg-gradient-to-t from-coal/70 via-transparent to-transparent md:bg-gradient-to-r md:from-coal md:via-transparent" />
              <span className="absolute bottom-5 right-6 font-mono text-[10px] uppercase tracking-[0.18em] text-bone/60">{p.category}</span>
            </div>
          </div>
          <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-void" />
        </Link>
      </motion.div>
    </div>
  )
}

function MoreCard({ m, i }: { m: (typeof MORE_PROJECTS)[number]; i: number }) {
  const ref = useSpotlight<HTMLDivElement>()
  const reduce = useReducedMotion()
  return (
    <Reveal delay={i * 0.08}>
      <div
        ref={ref}
        className="group relative flex h-full flex-col overflow-hidden rounded-[24px] bg-coal ring-1 ring-inset ring-white/[0.07] transition-[box-shadow,transform] duration-700 ease-expo hover:-translate-y-1.5 hover:shadow-[0_30px_80px_-30px_rgba(83,123,255,0.45)]"
      >
        {/* cursor-following light */}
        <div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(360px circle at var(--mx,50%) var(--my,50%), rgba(83,123,255,0.16), transparent 60%)' }} />
        <div className="relative aspect-[16/10] overflow-hidden">
          <Img src={m.image} alt={`${m.title} — preview visual`} className="absolute inset-0" imgClassName={`transition-transform duration-[1600ms] ease-expo ${reduce ? '' : 'group-hover:scale-110'}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-coal via-coal/10 to-transparent" />
          <span className="absolute left-5 top-5 font-mono text-xs text-bone/60">0{i + 5}</span>
          {m.demo && <span className="absolute right-5 top-5 rounded-full bg-emerald-400/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-300 ring-1 ring-inset ring-emerald-400/30">Live</span>}
        </div>
        <div className="relative flex flex-1 flex-col p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <h3 className="h-display text-[1.75rem]">{m.title}</h3>
            <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 ring-inset ring-white/15 transition-all duration-500 ease-expo group-hover:rotate-45 group-hover:bg-volt group-hover:text-void group-hover:ring-volt">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-bone/65">{m.text}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {m.stack.map((s) => (
              <span key={s} className="rounded-full bg-white/[0.05] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mist">{s}</span>
            ))}
          </div>
          <div className="relative z-20 mt-auto flex flex-wrap gap-5 pt-7 font-mono text-[11px] uppercase tracking-[0.14em]">
            {m.github ? (
              <a href={m.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-bone hover:text-volt">
                <GitHubIcon className="h-4 w-4" /> GitHub
              </a>
            ) : (
              <span className="text-dim">Source not public</span>
            )}
            {m.demo && (
              <a href={m.demo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-bone hover:text-volt">
                <ExternalLink className="h-4 w-4" /> Live demo
              </a>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  )
}

export default function Projects() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  return (
    <>
      <section className="wrap pb-12 pt-36 sm:pt-44">
        <Eyebrow n="02" className="mb-8">Projects · 2025 — 2026</Eyebrow>
        <h1 className="h-display text-[clamp(3.4rem,12vw,12rem)]">
          <Lines mount delay={0.3} lines={['Selected', <span key="w" className="text-volt">projects.</span>]} />
        </h1>
        <div className="mt-12 grid gap-8 md:grid-cols-12">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1, ease }} className="max-w-[48ch] text-[15px] leading-relaxed text-bone/70 md:col-span-6">
            Seven projects — four in-depth builds across security, databases, machine learning and systems programming, plus three smaller ones. Every project links to its real GitHub repository.
          </motion.p>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="grid grid-cols-2 gap-x-6 gap-y-2 md:col-span-5 md:col-start-8">
            {PROJECTS.map((p) => (
              <li key={p.id}>
                <Link to={`#project-${p.id}`} className="group flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mist hover:text-bone">
                  <span className="text-volt">{p.index}</span> {p.title}
                </Link>
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      <div ref={ref} className="relative">
        {PROJECTS.map((p, i) => (
          <Panel key={p.id} p={p} i={i} total={PROJECTS.length} progress={scrollYProgress} />
        ))}
      </div>

      <section className="wrap py-24 sm:py-32">
        <Eyebrow n="05—07" className="mb-6">Also built</Eyebrow>
        <h2 className="h-display mb-12 text-[clamp(2.4rem,6vw,5rem)]">
          <Lines lines={['More projects']} />
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {MORE_PROJECTS.map((m, i) => (
            <MoreCard key={m.title} m={m} i={i} />
          ))}
        </div>
        <Reveal className="mt-16 flex justify-center">
          <Btn href="https://github.com/DaniyalSE" external variant="ghost" icon={<GitHubIcon className="h-4 w-4" />}>
            Everything on GitHub
          </Btn>
        </Reveal>
      </section>
    </>
  )
}
