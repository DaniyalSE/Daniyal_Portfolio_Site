import { Link } from '../lib/router'
import { PROFILE } from '../data/content'
import { Lines, Magnetic, Reveal } from './fx'

export function Availability({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-3 rounded-full bg-white/[0.04] py-2 pl-3 pr-4 ring-1 ring-inset ring-white/10 backdrop-blur-md ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/85">Open to Werkstudent roles</span>
    </div>
  )
}

export function ContactCTA() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-40">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-volt/20 blur-[120px]" aria-hidden />
      <div className="wrap relative flex flex-col items-center text-center">
        <Availability />
        <h2 className="h-display mt-10 text-[clamp(3rem,10vw,10rem)]">
          <Lines lines={['Have an idea?', <span key="l" className="text-volt">Let's build.</span>]} />
        </h2>
        <Reveal delay={0.2} className="mt-12">
          <Magnetic strength={0.4}>
            <Link to="#contact" data-cursor="link" className="group relative grid h-40 w-40 place-items-center overflow-hidden rounded-full bg-volt text-void sm:h-48 sm:w-48">
              <span className="absolute inset-0 translate-y-full rounded-full bg-bone transition-transform duration-700 ease-expo group-hover:translate-y-0" />
              <span className="relative font-mono text-xs uppercase tracking-[0.18em]">Get in touch</span>
            </Link>
          </Magnetic>
        </Reveal>
        <Reveal delay={0.3} className="mt-10">
          <a href={`mailto:${PROFILE.email}`} className="font-display text-lg text-mist underline-offset-8 hover:text-bone hover:underline sm:text-2xl">
            {PROFILE.email}
          </a>
        </Reveal>
      </div>
    </section>
  )
}

