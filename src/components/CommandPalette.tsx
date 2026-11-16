import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Command, Copy, CornerDownLeft, Download, ExternalLink, FileText, Mail } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PROFILE, PROJECTS } from '../data/content'
import { useRouter } from '../lib/router'
import { NAV } from './Shell'
import { useHostDownloads } from './CvButton'
import { ease } from './fx'

interface Action {
  id: string
  group: string
  label: string
  hint?: string
  icon: typeof ArrowRight
  run: () => void | Promise<void>
}

export function openPalette() {
  window.dispatchEvent(new CustomEvent('folio:palette'))
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const [toast, setToast] = useState('')
  const { go } = useRouter()
  const dl = useHostDownloads()
  const input = useRef<HTMLInputElement>(null)

  const flash = (t: string) => {
    setToast(t)
    setTimeout(() => setToast(''), 1800)
  }

  const actions: Action[] = useMemo(
    () => [
      ...NAV.map((n) => ({ id: n.to, group: 'Navigate', label: `${n.n}. ${n.label}`, hint: n.to, icon: ArrowRight, run: () => go(n.to) })),
      ...PROJECTS.map((p) => ({ id: p.id, group: 'Case studies', label: p.title, hint: p.kicker, icon: FileText, run: () => go(`#project-${p.id}`) })),
      {
        id: 'copy-email',
        group: 'Actions',
        label: 'Copy email address',
        hint: PROFILE.email,
        icon: Copy,
        run: async () => {
          try {
            await navigator.clipboard.writeText(PROFILE.email)
            flash('Email copied')
          } catch {
            flash(PROFILE.email)
          }
        },
      },
      { id: 'mail', group: 'Actions', label: 'Write an email', hint: 'Opens your mail app', icon: Mail, run: () => void (location.href = `mailto:${PROFILE.email}`) },
      {
        id: 'cv',
        group: 'Actions',
        label: 'Download CV (English, PDF)',
        icon: Download,
        run: async () => {
          if (dl) {
            try {
              const blob = await (await fetch(PROFILE.cvEn)).blob()
              await dl.save({ filename: PROFILE.cvEn.split('/').pop()!, data: blob })
            } catch {
              /* declined */
            }
          } else {
            const a = document.createElement('a')
            a.href = PROFILE.cvEn
            a.download = PROFILE.cvEn.split('/').pop()!
            a.click()
          }
        },
      },
      { id: 'gh', group: 'Elsewhere', label: 'GitHub — DaniyalSE', icon: ExternalLink, run: () => void window.open(PROFILE.github, '_blank', 'noopener') },
      { id: 'li', group: 'Elsewhere', label: 'LinkedIn', icon: ExternalLink, run: () => void window.open(PROFILE.linkedin, '_blank', 'noopener') },
    ],
    [go, dl],
  )

  const list = actions.filter((a) => `${a.label} ${a.group} ${a.hint ?? ''}`.toLowerCase().includes(q.trim().toLowerCase()))

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === '/' && !/input|textarea|select/i.test((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    const o = () => setOpen(true)
    addEventListener('keydown', k)
    addEventListener('folio:palette', o)
    return () => {
      removeEventListener('keydown', k)
      removeEventListener('folio:palette', o)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQ('')
      setI(0)
      setTimeout(() => input.current?.focus(), 30)
    }
  }, [open])

  const run = async (a?: Action) => {
    if (!a) return
    await a.run()
    if (!a.id.startsWith('copy')) setOpen(false)
  }

  let lastGroup = ''
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[120] flex items-start justify-center bg-void/60 px-4 pt-[14vh] backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command menu"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.35, ease }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-2xl bg-coal/95 shadow-[0_40px_120px_-20px_rgba(83,123,255,0.4)] ring-1 ring-inset ring-white/10"
            >
              <div className="flex items-center gap-3 border-b border-white/[0.07] px-5">
                <Command className="h-4 w-4 text-volt" />
                <input
                  ref={input}
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value)
                    setI(0)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      setI((x) => Math.min(list.length - 1, x + 1))
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      setI((x) => Math.max(0, x - 1))
                    } else if (e.key === 'Enter') {
                      e.preventDefault()
                      run(list[i])
                    } else if (e.key === 'Escape') setOpen(false)
                  }}
                  placeholder="Jump to a page, project or action…"
                  className="h-14 w-full bg-transparent text-[15px] text-bone placeholder:text-dim focus:outline-none"
                  aria-label="Search commands"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="cmd-list"
                />
                <kbd className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-mist">ESC</kbd>
              </div>
              <ul id="cmd-list" role="listbox" className="no-scrollbar max-h-[52vh] overflow-y-auto p-2">
                {list.length === 0 && <li className="px-4 py-8 text-center text-sm text-dim">No matches for “{q}”</li>}
                {list.map((a, idx) => {
                  const head = a.group !== lastGroup
                  lastGroup = a.group
                  const I = a.icon
                  return (
                    <li key={a.id} role="option" aria-selected={idx === i}>
                      {head && <p className="px-3 pb-1.5 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-dim">{a.group}</p>}
                      <button
                        onMouseEnter={() => setI(idx)}
                        onClick={() => run(a)}
                        className={`flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left transition-colors ${idx === i ? 'bg-white/[0.07] text-bone' : 'text-bone/75'}`}
                      >
                        <span className="flex items-center gap-3">
                          <I className={`h-4 w-4 ${idx === i ? 'text-volt' : 'text-mist'}`} />
                          <span className="text-[14px]">{a.label}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          {a.hint && <span className="hidden font-mono text-[10px] text-dim sm:inline">{a.hint}</span>}
                          {idx === i && <CornerDownLeft className="h-3.5 w-3.5 text-mist" />}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
                <span>↑↓ navigate · ↵ select</span>
                <AnimatePresence>{toast && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-volt">{toast}</motion.span>}</AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
