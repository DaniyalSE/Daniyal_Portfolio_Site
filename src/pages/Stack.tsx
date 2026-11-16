import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useState } from 'react'
import Constellation from '../components/Constellation'
import { Eyebrow, Img, Lines, Reveal, ease } from '../components/fx'
import { SECURITY, SKILLS, projectsUsing } from '../data/content'

/* Typographic "logo" glyphs — monograms drawn in-house rather than third-party brand marks. */
const GLYPH: Record<string, string> = {
  Python: 'Py', Java: 'Jv', 'C++': 'C++', TypeScript: 'TS', JavaScript: 'JS', SQL: 'SQL',
  PyTorch: 'Pt', YOLOv11: 'Y11', 'Segment Anything': 'SAM', OpenCV: 'Cv', NumPy: 'Np', Pandas: 'Pd', Matplotlib: 'Mpl', Streamlit: 'St', Jupyter: 'Jp',
  React: 'Re', Vite: 'Vi', 'Tailwind CSS': 'Tw', HTML: '</>', CSS: '{}',
  FastAPI: 'Fa', 'Node.js': 'Nd', Express: 'Ex', 'REST APIs': 'API', 'Socket.IO': 'Io', WebSockets: 'Ws',
  MongoDB: 'Mg', SQLite: 'Lt', SQLAlchemy: 'SA',
  Git: 'Git', GitHub: 'Gh', Docker: 'Dk', 'VS Code': 'Vs', 'IntelliJ IDEA': 'Ij', Eclipse: 'Ec',
  Statistics: 'σ', 'Algorithm complexity analysis': 'O(n)', 'Numerical computing': '∫',
}

function Tile({ name, color, i }: { name: string; color: string; i: number }) {
  const reduce = useReducedMotion()
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 220, damping: 18 })
  const sry = useSpring(ry, { stiffness: 220, damping: 18 })
  const used = projectsUsing(name)
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-5%' }}
      transition={{ duration: 0.8, ease, delay: (i % 6) * 0.05 }}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 700 }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse') return
        const b = e.currentTarget.getBoundingClientRect()
        ry.set(((e.clientX - b.left) / b.width - 0.5) * 18)
        rx.set(-((e.clientY - b.top) / b.height - 0.5) * 18)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
      className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl bg-coal p-4 ring-1 ring-inset ring-white/[0.06] sm:p-5"
      tabIndex={0}
      aria-label={`${name}${used.length ? ` — used in ${used.join(', ')}` : ''}`}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus:opacity-100" style={{ background: `radial-gradient(circle at 30% 20%, ${color}33, transparent 65%)` }} />
      <span className="relative font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold tracking-tight transition-transform duration-500 ease-expo group-hover:-translate-y-1 group-hover:scale-110" style={{ color }}>
        {GLYPH[name] ?? name.slice(0, 2)}
      </span>
      <div className="relative">
        <p className="text-[13px] font-medium leading-tight sm:text-sm">{name}</p>
        <p className="mt-1 h-0 overflow-hidden font-mono text-[9px] uppercase tracking-[0.12em] text-mist opacity-0 transition-all duration-500 group-hover:h-auto group-hover:opacity-100 group-focus:h-auto group-focus:opacity-100">
          {used.length ? `In ${used.length} project${used.length > 1 ? 's' : ''}` : 'Coursework'}
        </p>
      </div>
    </motion.div>
  )
}

export default function Stack() {
  const [open, setOpen] = useState<string>(SKILLS[0].id)
  return (
    <>
      <section className="relative overflow-hidden pb-20 pt-36 sm:pt-44">
        <div className="absolute inset-0 opacity-50">
          <Img src="img/neural.webp" alt="" eager className="h-full w-full" imgClassName="opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-void via-void/40 to-void" />
        </div>
        <div className="wrap relative">
          <Eyebrow n="03" className="mb-8">Skills</Eyebrow>
          <h1 className="h-display text-[clamp(3.4rem,11vw,11rem)]">
            <Lines mount delay={0.25} lines={['The tools I', <span key="t" className="text-volt">build with.</span>]} />
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }} className="mt-10 max-w-[52ch] text-[16px] leading-relaxed text-bone/80">
            Five areas, no invented proficiency bars — hover any tool to see the project it was actually used in.
          </motion.p>
        </div>
      </section>

      <section className="wrap pb-24">
        <Constellation />
      </section>

      <section className="wrap py-16 sm:py-24">
        <Eyebrow n="01" className="mb-10">By category</Eyebrow>
        <div className="space-y-px overflow-hidden rounded-3xl bg-white/[0.06]">
          {SKILLS.map((g, gi) => {
            const isOpen = open === g.id
            return (
              <div key={g.id} className="bg-void">
                <button onClick={() => setOpen(isOpen ? '' : g.id)} aria-expanded={isOpen} className="group flex w-full items-center justify-between gap-6 px-5 py-6 text-left sm:px-8 sm:py-8">
                  <span className="flex items-baseline gap-5">
                    <span className="font-mono text-xs text-dim">0{gi + 1}</span>
                    <span className={`h-display text-[clamp(1.8rem,4.2vw,3.6rem)] transition-colors ${isOpen ? '' : 'text-bone/70 group-hover:text-bone'}`}>{g.label}</span>
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="hidden font-mono text-[11px] text-mist sm:inline">{g.items.length} tools</span>
                    <span className="relative grid h-11 w-11 place-items-center rounded-full ring-1 ring-inset ring-white/15" style={isOpen ? { background: g.color, boxShadow: `0 0 40px ${g.color}66` } : undefined}>
                      <span className={`absolute h-px w-4 ${isOpen ? 'bg-void' : 'bg-bone'}`} />
                      <span className={`absolute h-4 w-px transition-transform duration-500 ${isOpen ? 'scale-y-0 bg-void' : 'bg-bone'}`} />
                    </span>
                  </span>
                </button>
                <motion.div initial={false} animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.7, ease }} className="overflow-hidden">
                  <div className="grid grid-cols-3 gap-2.5 px-5 pb-8 sm:grid-cols-4 sm:px-8 md:grid-cols-6 lg:grid-cols-8">
                    {isOpen && g.items.map((s, i) => <Tile key={s} name={s} color={g.color} i={i} />)}
                  </div>
                </motion.div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="wrap grid gap-12 py-16 sm:py-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow n="02" className="mb-6">Also</Eyebrow>
          <h2 className="h-display text-[clamp(2.2rem,4.5vw,4rem)]">
            <Lines lines={['IT security', 'fundamentals']} />
          </h2>
          <p className="mt-6 max-w-[40ch] text-[15px] leading-relaxed text-bone/65">Applied while building CipherLink — encryption, key exchange and session hardening.</p>
        </div>
        <div className="flex flex-wrap content-start gap-2.5 lg:col-span-6 lg:col-start-7">
          {SECURITY.map((s, i) => (
            <Reveal key={s} delay={i * 0.06}>
              <span className="inline-block rounded-full px-5 py-3 font-mono text-sm text-bone ring-1 ring-inset ring-volt/40 transition-colors hover:bg-volt hover:text-void">{s}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative mt-10 overflow-hidden">
        <Img src="img/math.webp" alt="Abstract render of a loss-function landscape" className="h-[52svh] min-h-[320px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void" />
        <div className="wrap absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
          <p className="h-display text-[clamp(2rem,5vw,4.6rem)]">Statistics · Complexity · Numerics</p>
          <p className="label mt-4">The mathematics underneath</p>
        </div>
      </section>
    </>
  )
}
