import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Award, BookOpen, Code2, HeartHandshake } from 'lucide-react'
import { useRef } from 'react'
import { Eyebrow, Lines, Reveal, ease } from '../components/fx'
import { TIMELINE, type TimelineItem } from '../data/content'
import { ContactCTA } from '../components/Blocks'

const ICON = { education: BookOpen, project: Code2, award: Award, volunteer: HeartHandshake }
const TAG = { education: 'Education', project: 'Technical', award: 'Award', volunteer: 'Volunteering' }

function Item({ it, i }: { it: TimelineItem; i: number }) {
  const I = ICON[it.type]
  const left = i % 2 === 0
  const reduce = useReducedMotion()
  return (
    <div className="relative grid grid-cols-[28px_1fr] gap-5 md:grid-cols-[1fr_56px_1fr] md:gap-0">
      <div className={`hidden md:block ${left ? '' : 'order-3'}`}>
        <motion.div
          initial={{ opacity: 0, x: reduce ? 0 : left ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 1, ease }}
          className={`${left ? 'pr-12 text-right' : 'pl-12'}`}
        >
          <Card it={it} align={left ? 'right' : 'left'} />
        </motion.div>
      </div>
      <div className={`relative flex justify-center md:order-2 ${left ? '' : 'md:order-2'}`}>
        <motion.span
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className={`relative z-10 mt-1 grid h-7 w-7 place-items-center rounded-full ring-1 ring-inset md:h-11 md:w-11 ${it.current ? 'bg-volt text-void ring-volt shadow-[0_0_40px_rgba(83,123,255,0.7)]' : 'bg-void text-volt-soft ring-white/20'}`}
        >
          <I className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={1.6} />
          {it.current && <span className="ping-soft absolute inset-0 rounded-full bg-volt/50" />}
        </motion.span>
      </div>
      <div className={`md:hidden`}>
        <Reveal y={20}>
          <Card it={it} align="left" />
        </Reveal>
      </div>
      <div className={`hidden md:block ${left ? 'order-3' : ''}`} />
    </div>
  )
}

function Card({ it, align }: { it: TimelineItem; align: 'left' | 'right' }) {
  return (
    <div className="pb-14 md:pb-20">
      <div className={`flex items-center gap-3 ${align === 'right' ? 'md:justify-end' : ''}`}>
        <span className="font-mono text-[11px] text-volt-soft">{it.date}</span>
        <span className="rounded-full bg-white/[0.05] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-mist">{TAG[it.type]}</span>
      </div>
      <h3 className="mt-3 font-display text-[clamp(1.4rem,2.4vw,2.1rem)] leading-tight tracking-tight">{it.title}</h3>
      <p className="mt-1.5 text-sm text-bone/60">{it.place}</p>
      {it.text && <p className={`mt-3 max-w-[44ch] text-[15px] leading-relaxed text-bone/70 ${align === 'right' ? 'md:ml-auto' : ''}`}>{it.text}</p>}
    </div>
  )
}

export default function Journey() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 60%', 'end 60%'] })
  const h = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 120, damping: 30 })
  return (
    <>
      <section className="wrap pb-16 pt-36 sm:pt-44">
        <Eyebrow n="04" className="mb-8">Education & milestones</Eyebrow>
        <h1 className="h-display text-[clamp(3.4rem,11vw,11rem)]">
          <Lines mount delay={0.25} lines={['Education', <span key="s" className="text-volt">& milestones.</span>]} />
        </h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-10 grid gap-8 md:grid-cols-12">
          <p className="max-w-[52ch] text-[15px] leading-relaxed text-bone/70 md:col-span-6">
            My academic path from Pakistan to Germany, alongside the projects, awards and volunteering that shaped it — newest first.
          </p>
          <div className="flex flex-wrap gap-4 md:col-span-5 md:col-start-8">
            {(Object.keys(TAG) as (keyof typeof TAG)[]).map((k) => {
              const I = ICON[k]
              return (
                <span key={k} className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mist">
                  <I className="h-3.5 w-3.5 text-volt-soft" /> {TAG[k]}
                </span>
              )
            })}
          </div>
        </motion.div>
      </section>

      <section ref={ref} className="wrap relative py-16">
        <div className="absolute bottom-0 left-[calc(1.25rem+13px)] top-16 w-px bg-white/10 sm:left-[calc(2rem+13px)] md:left-1/2 md:-translate-x-1/2 lg:left-1/2" />
        <motion.div style={{ scaleY: h }} className="absolute bottom-0 left-[calc(1.25rem+13px)] top-16 w-px origin-top bg-gradient-to-b from-volt via-iris to-volt sm:left-[calc(2rem+13px)] md:left-1/2 md:-translate-x-1/2" />
        {TIMELINE.map((it, i) => (
          <Item key={it.title + it.date} it={it} i={i} />
        ))}
      </section>

      <ContactCTA />
    </>
  )
}
