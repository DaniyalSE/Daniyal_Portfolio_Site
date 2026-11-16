import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PROJECTS } from '../data/content'
import { Link } from '../lib/router'
import { Btn, Eyebrow, Img, Lines, Reveal, ease } from '../components/fx'
import { GitHubIcon } from '../components/Shell'

/* Single-pass tokenizer → no risk of re-highlighting generated markup. */
const TOKEN = /("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`[^`\n]*`)|(#.*$|\/\/.*$)|\b(def|class|return|if|else|elif|for|in|import|from|const|let|await|async|new|throw|String|true|false|None|typeof|private|public|static)\b|\b(\d+(?:\.\d+)?)\b|(\.[A-Za-z_]\w*)(?=\()/gm
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function highlight(src: string) {
  let out = ''
  let last = 0
  for (const m of src.matchAll(TOKEN)) {
    out += esc(src.slice(last, m.index))
    const [tok, str, com, kw, num, call] = m
    const cls = str ? 'text-[#9fd3a2]' : com ? 'text-white/35' : kw ? 'text-iris-soft' : num ? 'text-[#f5b97a]' : call ? 'text-volt-soft' : ''
    out += `<span class="${cls}">${esc(tok)}</span>`
    last = (m.index ?? 0) + tok.length
  }
  return out + esc(src.slice(last))
}

function CodePanel({ file, lang, code, note }: { file: string; lang: string; code: string; note: string }) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const lines = code.split('\n')
  const reduce = useReducedMotion()
  return (
    <div className="overflow-hidden rounded-3xl bg-[#0B0D12] ring-1 ring-inset ring-white/[0.08] shadow-[0_60px_140px_-40px_rgba(83,123,255,0.35)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden>
            <i className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <i className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <i className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </span>
          <span className="font-mono text-[11px] text-mist">{file}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-dim">{lang}</span>
          <button
            onClick={async () => {
              setCopyFailed(false)
              try {
                await navigator.clipboard.writeText(code)
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              } catch {
                setCopyFailed(true)
              }
            }}
            className="grid h-8 w-8 place-items-center rounded-full text-mist hover:bg-white/10 hover:text-bone"
            aria-label="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-volt" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <pre className="no-scrollbar overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.75] sm:p-7 sm:text-[13px]">
        <code>
          {lines.map((l, i) => (
            <motion.span
              key={i}
              className="block whitespace-pre"
              initial={{ opacity: 0, x: reduce ? 0 : -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.035, duration: 0.5, ease }}
            >
              <span className="mr-5 inline-block w-5 select-none text-right text-white/20">{i + 1}</span>
              <span className="text-bone/85" dangerouslySetInnerHTML={{ __html: highlight(l) || ' ' }} />
            </motion.span>
          ))}
        </code>
      </pre>
      {copyFailed && <p className="border-t border-red-300/20 px-5 py-3 text-xs text-red-200 sm:px-7" role="status">Copy is unavailable in this browser.</p>}
      <p className="border-t border-white/[0.06] px-5 py-4 text-sm leading-relaxed text-mist sm:px-7">{note}</p>
    </div>
  )
}

export default function ProjectDetail({ id }: { id: string }) {
  const idx = PROJECTS.findIndex((p) => p.id === id)
  const p = PROJECTS[idx]
  const hero = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] })
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.18])
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '12%'])
  const clip = useTransform(scrollYProgress, [0, 0.6], reduce ? ['inset(0% 0% 0% 0% round 28px)', 'inset(0% 0% 0% 0% round 28px)'] : ['inset(0% 0% 0% 0% round 28px)', 'inset(6% 4% 6% 4% round 40px)'])

  useEffect(() => {
    if (p) document.title = `${p.title} — Case study | Syed Daniyal Haider Naqvi`
  }, [p])

  if (!p)
    return (
      <section className="wrap flex min-h-[80vh] flex-col items-center justify-center gap-6 pt-32 text-center">
        <p className="h-display text-6xl">Project not found</p>
        <Btn to="#projects">Back to projects</Btn>
      </section>
    )

  const next = PROJECTS[(idx + 1) % PROJECTS.length]

  return (
    <article>
      <header className="wrap pb-12 pt-32 sm:pt-40">
        <Link to="#projects" className="label mb-10 inline-flex items-center gap-2 hover:text-bone">
          <ArrowLeft className="h-3.5 w-3.5" /> All projects
        </Link>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <h1 className="h-display text-[clamp(3rem,10vw,10rem)]">
            <Lines mount delay={0.25} lines={p.title.split(' ').length > 2 ? [p.title.split(' ').slice(0, 2).join(' '), p.title.split(' ').slice(2).join(' ')] : [p.title]} />
          </h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.9, ease }} className="max-w-[34ch] text-lg text-bone/75 lg:pb-4">
            {p.summary}
          </motion.p>
        </div>
      </header>

      <div ref={hero} className="relative h-[70svh] min-h-[420px] sm:h-[92svh]">
        <motion.div style={{ clipPath: clip }} className="wrap absolute inset-0 !px-0 sm:!px-8 lg:!px-14">
          <motion.div initial={{ clipPath: 'inset(100% 0 0 0)' }} animate={{ clipPath: 'inset(0% 0 0 0)' }} transition={{ duration: 1.3, ease, delay: 0.35 }} className="relative h-full overflow-hidden sm:rounded-[28px]">
            <motion.div style={{ scale: imgScale, y: imgY }} className="absolute inset-0">
              {p.image ? <Img src={p.image} alt={`${p.title} — key visual`} eager className="h-full w-full" /> : <div className="h-full w-full bg-coal" aria-label={`${p.title} — no image available`} />}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <section className="wrap grid gap-10 border-b border-white/[0.07] py-14 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Type', 'Personal project'],
          ['Year', p.date],
          ['Field', p.category],
          ['Source', 'Public on GitHub'],
        ].map(([k, v], i) => (
          <Reveal key={k} delay={i * 0.06}>
            <p className="label mb-2">{k}</p>
            <p className="font-display text-xl">{v}</p>
          </Reveal>
        ))}
      </section>

      <section className="wrap grid gap-14 py-20 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow n="01">Overview</Eyebrow>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <Reveal>
            <p className="font-display text-[clamp(1.25rem,2vw,1.75rem)] leading-[1.4] tracking-[-0.015em] text-bone/85">{p.description}</p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 flex flex-wrap gap-3">
            <Btn href={p.github} external variant="solid" icon={<GitHubIcon className="h-4 w-4" />}>
              View source
            </Btn>
            {p.demo && (
              <Btn href={p.demo} external variant="ghost">
                Live demo
              </Btn>
            )}
          </Reveal>
          {!p.demo && <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-dim">No public live demo — runs locally from the repository.</p>}
        </div>
      </section>

      <section className="wrap grid gap-14 py-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow n="02">Key features</Eyebrow>
        </div>
        <ol className="lg:col-span-7 lg:col-start-6">
          {p.features.map((f, i) => (
            <Reveal key={f} delay={i * 0.04}>
              <li className="group flex items-baseline gap-6 border-t border-white/[0.07] py-5 last:border-b">
                <span className="font-mono text-xs text-volt">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display text-xl tracking-tight transition-transform duration-500 ease-expo group-hover:translate-x-2 sm:text-2xl">{f}</span>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="wrap grid gap-14 py-20 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow n="03">From the source</Eyebrow>
          <p className="mt-6 max-w-[30ch] text-sm leading-relaxed text-mist">An unedited excerpt from the public repository.</p>
        </div>
        <div className="lg:col-span-8">
          <Reveal>
            <CodePanel {...p.excerpt} />
          </Reveal>
        </div>
      </section>

      <section className="wrap grid gap-14 py-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow n="04">Stack</Eyebrow>
        </div>
        <div className="flex flex-wrap gap-2 lg:col-span-7 lg:col-start-6">
          {p.stack.map((s, i) => (
            <motion.span
              key={s}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.6, ease }}
              className="rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-bone ring-1 ring-inset ring-white/15 transition-colors hover:bg-volt hover:text-void hover:ring-volt"
            >
              {s}
            </motion.span>
          ))}
        </div>
      </section>

      <Link to={`#project-${next.id}`} data-cursor="view" data-cursor-label="Next" className="group relative mt-24 block overflow-hidden border-t border-white/[0.07]">
        <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-40">
          {next.image ? <Img src={next.image} alt="" className="h-full w-full" /> : <div className="h-full w-full bg-coal" aria-hidden />}
        </div>
        <div className="wrap relative flex flex-col gap-6 py-20 sm:py-28 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label mb-5">Next project · {next.index}</p>
            <p className="h-display text-[clamp(2.6rem,8vw,8rem)] transition-transform duration-700 ease-expo group-hover:translate-x-4">{next.title}</p>
          </div>
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-bone text-void transition-transform duration-700 ease-expo group-hover:rotate-45 group-hover:bg-volt">
            <ArrowUpRight className="h-7 w-7" />
          </span>
        </div>
      </Link>
    </article>
  )
}
