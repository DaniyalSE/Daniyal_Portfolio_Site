import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowDown, MapPin } from 'lucide-react'
import { Suspense, lazy, useRef, useState } from 'react'
import { Availability, ContactCTA } from '../components/Blocks'
import CvButton from '../components/CvButton'
import { Btn, Eyebrow, Img, Lines, Parallax, Reveal, Scramble, ease } from '../components/fx'
import { ACHIEVEMENTS, INTERESTS, PROFILE } from '../data/content'
import { Link } from '../lib/router'

const HeroScene = lazy(() => import('../components/HeroScene'))

/* ─────────────────────────── Landing ─────────────────────────── */

function Portrait() {
  const reduce = useReducedMotion()
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 120, damping: 16 })
  const sry = useSpring(ry, { stiffness: 120, damping: 16 })
  const sphere = useRef(0)
  return (
    <div
      className="relative mx-auto aspect-[4/5] w-full max-w-[460px] lg:max-w-none"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse') return
        const b = e.currentTarget.getBoundingClientRect()
        ry.set(((e.clientX - b.left) / b.width - 0.5) * 10)
        rx.set(-((e.clientY - b.top) / b.height - 0.5) * 10)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
    >
      {/* abstract 3D particle field behind the photograph */}
      <div className="pointer-events-none absolute -inset-[22%] opacity-80" aria-hidden>
        <Suspense fallback={null}>
          <HeroScene morph={sphere} />
        </Suspense>
      </div>
      <div className="pointer-events-none absolute -inset-10 rounded-full bg-volt/15 blur-[90px]" aria-hidden />

      <motion.div style={{ rotateX: srx, rotateY: sry, transformPerspective: 1100 }} className="relative h-full">
        <motion.div
          initial={{ clipPath: 'inset(100% 0 0 0 round 32px)' }}
          animate={{ clipPath: 'inset(0% 0 0 0 round 32px)' }}
          transition={{ duration: 1.4, ease, delay: 0.5 }}
          className="relative h-full overflow-hidden rounded-[32px] ring-1 ring-inset ring-white/10"
        >
          <motion.div initial={{ scale: 1.18 }} animate={{ scale: 1 }} transition={{ duration: 2, ease, delay: 0.5 }} className="h-full">
            <Img src="img/me-dresden.webp" alt="Daniyal Naqvi by the Elbe in Dresden, with the Hofkirche behind him" eager className="h-full w-full" imgClassName="object-[50%_35%]" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-6">
            <div>
              <p className="label text-bone/60">Currently</p>
              <p className="mt-1 font-display text-lg leading-tight text-bone">B.Sc. Data Science</p>
              <p className="text-sm text-bone/65">TU Chemnitz · since Oct 2026</p>
            </div>
            <span className="label text-bone/50">Dresden, SN</span>
          </div>
        </motion.div>

        {/* floating detail chip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: reduce ? 0 : [0, -8, 0] }}
          transition={{ opacity: { delay: 1.5, duration: 0.8 }, y: { delay: 1.5, duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
          className="absolute -left-4 top-10 hidden rounded-2xl bg-coal/80 px-4 py-3 ring-1 ring-inset ring-white/10 backdrop-blur-xl sm:block lg:-left-10"
          style={{ translateZ: 40 }}
        >
          <p className="label">Stack</p>
          <p className="mt-1 font-mono text-[12px] text-bone/85">Python · PyTorch · React · FastAPI</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

function Landing() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-14%'])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* quiet background: fine grid + one soft light */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" aria-hidden />

      <motion.div style={{ y, opacity: fade }} className="wrap relative grid min-h-[100svh] items-center gap-14 pb-16 pt-28 lg:grid-cols-12 lg:gap-10 lg:pt-24">
        {/* LEFT */}
        <div className="lg:col-span-7">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease }} className="font-mono text-[12px] uppercase tracking-[0.28em] text-volt">
            <Scramble text="Hello, I'm" />
          </motion.p>
          <h1 className="h-display mt-5 text-[clamp(3.6rem,min(9.5vw,15vh),9.8rem)] uppercase leading-[0.86]">
            <Lines mount delay={0.4} stagger={0.12} lines={['Daniyal', <span key="n">Naqvi<span className="text-volt">.</span></span>]} />
          </h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.9, ease }} className="mt-7 max-w-[40ch] font-display text-[clamp(1.1rem,1.6vw,1.35rem)] leading-snug text-bone/90">
            {PROFILE.roles.map((r, i) => (
              <span key={r}>
                <span className="whitespace-nowrap">{r}</span>
                {i < PROFILE.roles.length - 1 && <span className="mx-2.5 text-volt" aria-hidden>|</span>}{' '}
              </span>
            ))}
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.9, ease }} className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-bone/65 sm:text-[17px]">
            {PROFILE.intro}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.9, ease }} className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="inline-flex items-center gap-2 text-sm text-bone/75">
              <MapPin className="h-4 w-4 text-volt" /> {PROFILE.location}
            </span>
            <Availability />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.45, duration: 0.9, ease }} className="mt-10 flex flex-wrap gap-3">
            <Btn to="#projects" variant="solid">Explore my work</Btn>
            <CvButton variant="ghost" label="Download CV" />
            <Btn to="#contact" variant="ghost">Contact me</Btn>
          </motion.div>
        </div>

        {/* RIGHT */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }} className="lg:col-span-5">
          <Portrait />
        </motion.div>
      </motion.div>

      <button
        onClick={() => scrollBy({ top: innerHeight * 0.85, behavior: 'smooth' })}
        className="label absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 hover:text-bone lg:flex"
        aria-label="Scroll to my story"
        data-cursor="link"
      >
        <ArrowDown className="h-3.5 w-3.5 animate-bounce" /> My story
      </button>
    </section>
  )
}

/* ─────────────────────────── A. My story ─────────────────────────── */

function Story() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 45%'] })
  const w = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const steps = [
    { k: 'Narowal, Pakistan', t: 'A head for numbers', d: 'School years with a focus on mathematics and statistics — 96.4% in Matriculation, a fully funded scholarship for Intermediate, and 92.7% there.' },
    { k: 'Islamabad, Pakistan', t: 'Computer Science at COMSATS', d: 'Four semesters of B.S. Computer Science (CGPA 3.30): data structures and algorithms, Java OOP, advanced database systems, SQL, MongoDB and Docker. I started building real projects — from a DBMS in Java to an encrypted chat system.' },
    { k: 'Chemnitz, Germany', t: 'Data Science at TU Chemnitz', d: 'The projects I enjoyed most were the ones that learned from data. Since October 2026 I study B.Sc. Data Science at TU Chemnitz to go deeper into statistics, machine learning and AI.' },
  ]
  return (
    <section ref={ref} className="wrap py-24 sm:py-36">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow n="A">My story</Eyebrow>
        </div>
        <div className="lg:col-span-8">
          <h2 className="h-display max-w-[18ch] text-[clamp(2.4rem,5.4vw,5rem)]">
            <Lines lines={['From Computer Science', <span key="d">to <span className="text-volt">Data Science.</span></span>]} />
          </h2>
        </div>
      </div>
      <div className="relative mt-16 lg:mt-24">
        <div className="absolute left-0 right-0 top-[7px] hidden h-px bg-white/10 md:block" />
        <motion.div style={{ width: reduce ? '100%' : w }} className="absolute left-0 top-[7px] hidden h-px bg-volt md:block" />
        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.12}>
              <span className="relative z-10 mb-8 block h-3.5 w-3.5 rounded-full bg-void ring-2 ring-volt" />
              <p className="label">{s.k}</p>
              <h3 className="mt-3 font-display text-[1.7rem] leading-tight tracking-tight">{s.t}</h3>
              <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-bone/65">{s.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── B. What I do ─────────────────────────── */

const AREAS = [
  { n: '01', t: 'Data Science & AI', d: 'Exploring machine learning, deep learning, computer vision, and data-driven solutions.', img: 'img/neural.webp', proof: 'Brain Tumor Segmentation · YOLOv11 + SAM', to: '#project-brain-tumor-segmentation' },
  { n: '02', t: 'Software Development', d: 'Building full-stack applications, backend systems, APIs, and interactive applications.', img: 'img/workspace.webp', proof: 'CipherLink · FastAPI + React', to: '#project-cipherlink' },
  { n: '03', t: 'Database Engineering', d: 'Working with relational and NoSQL databases, query optimization, database architecture, and real-time systems.', img: 'img/p-hospital.webp', proof: 'Hospital DBMS Console · MongoDB', to: '#project-hospital-dbms' },
]

function WhatIDo() {
  const [hover, setHover] = useState<number | null>(null)
  return (
    <section className="py-24 sm:py-32">
      <div className="wrap">
        <div className="mb-14 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow n="B">What I do</Eyebrow>
          </div>
          <h2 className="h-display text-[clamp(2.4rem,5.4vw,5rem)] lg:col-span-8">
            <Lines lines={['Three areas I build in.']} />
          </h2>
        </div>
        <div onPointerLeave={() => setHover(null)}>
          {AREAS.map((a, i) => (
            <Reveal key={a.n} delay={i * 0.06}>
              <Link
                to={a.to}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                data-cursor="view"
                data-cursor-label="See project"
                className="group relative grid items-center gap-6 overflow-hidden border-t border-white/[0.08] py-9 last:border-b md:grid-cols-12 md:py-12"
              >
                {/* image wipes in behind the row on hover */}
                <span className="pointer-events-none absolute inset-0 -z-0 hidden md:block" aria-hidden>
                  <motion.span className="absolute inset-0 block" initial={false} animate={{ clipPath: hover === i ? 'inset(0% 0% 0% 0%)' : 'inset(50% 0% 50% 0%)' }} transition={{ duration: 0.7, ease }}>
                    <Img src={a.img} alt="" className="h-full w-full" imgClassName="opacity-35" />
                    <span className="absolute inset-0 bg-gradient-to-r from-void via-void/60 to-void/20" />
                  </motion.span>
                </span>
                <span className="relative font-mono text-sm text-volt md:col-span-1">{a.n}</span>
                <span className={`h-display relative text-[clamp(2rem,4.4vw,4rem)] transition-all duration-700 ease-expo md:col-span-5 md:group-hover:translate-x-3 ${hover !== null && hover !== i ? 'md:opacity-35' : ''}`}>{a.t}</span>
                <span className="relative md:col-span-5 md:col-start-8">
                  <span className="block text-[16px] leading-relaxed text-bone/70">{a.d}</span>
                  <span className="label mt-4 block text-bone/45 transition-colors group-hover:text-volt">→ {a.proof}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── C. Education ─────────────────────────── */

const EDU = [
  { y: 'Oct 2026 — Present', t: 'B.Sc. Data Science', p: 'Technische Universität Chemnitz, Germany', n: 'Current', current: true },
  { y: '2024 — 2026', t: 'B.S. Computer Science', p: 'COMSATS University Islamabad, Pakistan', n: 'Four semesters completed · CGPA 3.30 / 4.00' },
  { y: '2020 — 2022', t: 'Intermediate (HSSC)', p: 'Narowal Public School and College, Pakistan', n: '92.7% · Mathematics, statistics, sciences' },
  { y: 'Before 2020', t: 'Matriculation (SSC)', p: 'Narowal Public School and College, Pakistan', n: '96.4% · Mathematics, statistics, sciences' },
]

function Education() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 55%'] })
  const h = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <section className="wrap py-24 sm:py-32">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow n="C">Education</Eyebrow>
          <h2 className="h-display mt-8 text-[clamp(2.4rem,4.6vw,4.2rem)]">
            <Lines lines={['Where I', 'learned.']} />
          </h2>
          <Reveal delay={0.2} className="mt-8">
            <Btn to="#education" variant="ghost">Full timeline</Btn>
          </Reveal>
        </div>
        <div ref={ref} className="relative lg:col-span-7 lg:col-start-6">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-white/10" />
          <motion.div style={{ scaleY: h }} className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-volt" />
          {EDU.map((e, i) => (
            <Reveal key={e.t} delay={i * 0.08} className="relative pb-12 pl-12 last:pb-0">
              <span className={`absolute left-0 top-2 h-[15px] w-[15px] rounded-full ring-2 ${e.current ? 'bg-volt ring-volt shadow-[0_0_24px_rgba(83,123,255,0.8)]' : 'bg-void ring-white/30'}`} />
              <p className="font-mono text-xs text-volt">{e.y}</p>
              <h3 className="mt-2 font-display text-[clamp(1.5rem,2.4vw,2.1rem)] leading-tight tracking-tight">{e.t}</h3>
              <p className="mt-1 text-[15px] text-bone/70">{e.p}</p>
              <p className="label mt-3 text-bone/45">{e.n}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── D. Achievements ─────────────────────────── */

function Achievements() {
  return (
    <section className="wrap py-24 sm:py-32">
      <div className="mb-12 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow n="D">Achievements</Eyebrow>
        </div>
        <h2 className="h-display text-[clamp(2.4rem,5.4vw,5rem)] lg:col-span-8">
          <Lines lines={['Recognition & community.']} />
        </h2>
      </div>
      <div className="lg:ml-[33.4%]">
        {ACHIEVEMENTS.map((a, i) => (
          <Reveal key={a.title} delay={i * 0.08}>
            <div className="group grid items-baseline gap-2 border-t border-white/[0.08] py-8 last:border-b sm:grid-cols-12">
              <span className="font-display text-3xl tracking-tight text-bone/30 transition-colors duration-500 group-hover:text-volt sm:col-span-2">{a.year}</span>
              <div className="sm:col-span-10">
                <p className="font-display text-[clamp(1.4rem,2.4vw,2rem)] leading-tight tracking-tight transition-transform duration-500 ease-expo group-hover:translate-x-2">{a.title}</p>
                <p className="mt-1.5 text-[15px] text-bone/55">{a.org}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────── E. Current focus ─────────────────────────── */

function CurrentFocus() {
  return (
    <section className="relative overflow-hidden">
      <Parallax src="img/math.webp" alt="" className="absolute inset-0 opacity-40" amount={10} />
      <div className="absolute inset-0 bg-gradient-to-b from-void via-void/70 to-void" />
      <div className="wrap relative grid gap-12 py-28 sm:py-36 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow n="E">Current focus</Eyebrow>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white/[0.04] px-4 py-2 ring-1 ring-inset ring-white/10">
            <span className="h-2 w-2 rounded-full bg-volt shadow-[0_0_12px_#537BFF]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/80">Now · Winter semester 2026/27</span>
          </div>
        </div>
        <div className="lg:col-span-8">
          <Reveal>
            <p className="font-display text-[clamp(1.6rem,3.2vw,2.8rem)] leading-[1.2] tracking-[-0.02em]">
              Studying Data Science at <span className="text-volt">TU Chemnitz</span> and developing my skills in AI, software engineering and data technologies — while looking for a <span className="text-volt">Werkstudent</span> role where I can contribute and learn.
            </p>
          </Reveal>
          <div className="mt-12 flex flex-wrap gap-2">
            {INTERESTS.map((t, i) => (
              <Reveal key={t} delay={i * 0.04}>
                <span className="inline-block rounded-full px-4 py-2 text-sm text-bone/85 ring-1 ring-inset ring-white/15 transition-colors hover:bg-volt hover:text-void hover:ring-volt">{t}</span>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2} className="mt-12 flex flex-wrap gap-3">
            <Btn to="#skills" variant="ghost">My skills</Btn>
            <CvButton variant="ghost" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default function About() {
  return (
    <>
      <Landing />
      <Story />
      <WhatIDo />
      <Education />
      <Achievements />
      <CurrentFocus />
      <ContactCTA />
    </>
  )
}
