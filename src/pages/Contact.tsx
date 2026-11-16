import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowUpRight, Check, CheckCircle2, Copy, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import CvButton from '../components/CvButton'
import { Btn, Eyebrow, Lines, Reveal, ease } from '../components/fx'
import { GitHubIcon, LinkedInIcon } from '../components/Shell'
import { PROFILE } from '../data/content'
import { isConfigured, mailtoFor, sendMessage, type ContactPayload } from '../lib/contact'
import { Availability } from '../components/Blocks'

type Errs = Partial<Record<keyof ContactPayload, string>>
const TOPICS = ['Werkstudent opportunity', 'Software collaboration', 'AI / Data Science project', 'Technical discussion', 'Something else']

function validate(f: ContactPayload): Errs {
  const e: Errs = {}
  if (f.name.trim().length < 2) e.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Please enter a valid email address.'
  if (f.subject.trim().length < 3) e.subject = 'Please add a subject.'
  if (f.message.trim().length < 20) e.message = `A little more detail, please (${f.message.trim().length}/20 characters).`
  return e
}

function CopyLine({ value, label, href, icon: I }: { value: string; label: string; href?: string; icon: typeof Mail }) {
  const [ok, setOk] = useState(false)
  return (
    <div className="group flex items-center justify-between gap-4 border-t border-white/[0.08] py-5">
      <div className="flex min-w-0 items-center gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.04] text-volt-soft ring-1 ring-inset ring-white/10">
          <I className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="label">{label}</p>
          {href ? (
            <a href={href} className="block truncate font-display text-lg hover:text-volt sm:text-xl" target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
              {value}
            </a>
          ) : (
            <p className="truncate font-display text-lg sm:text-xl">{value}</p>
          )}
        </div>
      </div>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value)
            setOk(true)
            setTimeout(() => setOk(false), 1500)
          } catch {
            /* clipboard blocked — value is on screen */
          }
        }}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-mist transition hover:bg-white/10 hover:text-bone"
        aria-label={`Copy ${label}`}
      >
        {ok ? <Check className="h-4 w-4 text-volt" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}

export default function Contact() {
  const empty: ContactPayload = { name: '', email: '', subject: '', message: '' }
  const [f, setF] = useState<ContactPayload>(empty)
  const [errs, setErrs] = useState<Errs>({})
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'handoff' | 'error'>('idle')
  const [topic, setTopic] = useState<string | null>(null)

  const set = (k: keyof ContactPayload, v: string) => {
    const n = { ...f, [k]: v }
    setF(n)
    if (errs[k]) setErrs((e) => ({ ...e, [k]: validate(n)[k] }))
    if (state === 'error') setState('idle')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate(f)
    setErrs(v)
    if (Object.keys(v).length) {
      setState('error')
      document.getElementById(`c-${Object.keys(v)[0]}`)?.focus()
      return
    }
    if (!isConfigured()) {
      setState('handoff')
      return
    }
    setState('sending')
    try {
      await sendMessage(f)
      setState('sent')
      setF(empty)
    } catch {
      setState('handoff')
    }
  }

  const field = (k: keyof ContactPayload) => `field ${errs[k] ? 'field-bad' : ''}`

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-36 sm:pt-44">
        <div className="pointer-events-none absolute -right-40 top-10 h-[50vmin] w-[50vmin] rounded-full bg-iris/20 blur-[120px]" />
        <div className="pointer-events-none absolute -left-20 top-60 h-[40vmin] w-[40vmin] rounded-full bg-volt/20 blur-[120px]" />
        <div className="wrap relative">
          <div className="mb-10 flex flex-wrap items-center gap-4">
            <span className="label"><span className="text-volt">05</span> &nbsp;Contact</span>
            <Availability />
          </div>
          <h1 className="h-display text-[clamp(3.2rem,10.5vw,10.5rem)]">
            <Lines mount delay={0.25} lines={['Have an idea?', <span key="l" className="text-volt">Let's build something.</span>]} />
          </h1>
        </div>
      </section>

      <section className="wrap grid gap-16 pb-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="max-w-[44ch] text-[17px] leading-relaxed text-bone/75">
              I'm looking for <strong className="font-medium text-bone">Werkstudent opportunities</strong> in Data Science, Machine Learning, AI and Software Development in Germany — and I'm always happy to talk about:
            </p>
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-2">
            {TOPICS.slice(0, 4).map((t, i) => (
              <Reveal key={t} delay={0.05 * i}>
                <button
                  onClick={() => {
                    setTopic(t)
                    set('subject', t)
                    document.getElementById('c-name')?.focus()
                  }}
                  className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] ring-1 ring-inset transition ${topic === t ? 'bg-volt text-void ring-volt' : 'text-bone ring-white/15 hover:ring-white/40'}`}
                >
                  {t}
                </button>
              </Reveal>
            ))}
          </div>
          <div className="mt-12">
            <CopyLine icon={Mail} label="Email" value={PROFILE.email} href={`mailto:${PROFILE.email}`} />
            <CopyLine icon={Phone} label="Phone" value={PROFILE.phone} href={PROFILE.phoneHref} />
            <CopyLine icon={LinkedInIcon as unknown as typeof Mail} label="LinkedIn" value="in/syeddaniyalnaqvi" href={PROFILE.linkedin} />
            <CopyLine icon={GitHubIcon as unknown as typeof Mail} label="GitHub" value="github.com/DaniyalSE" href={PROFILE.github} />
            <div className="flex items-center gap-4 border-y border-white/[0.08] py-5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.04] text-volt-soft ring-1 ring-inset ring-white/10">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="label">Location</p>
                <p className="font-display text-lg sm:text-xl">{PROFILE.location}</p>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <CvButton variant="ghost" />
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="relative overflow-hidden rounded-[28px] bg-coal/80 p-6 ring-1 ring-inset ring-white/[0.07] backdrop-blur sm:p-10">
            <AnimatePresence mode="wait">
              {state === 'sent' ? (
                <motion.div key="sent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex min-h-[480px] flex-col items-start justify-center gap-6" role="status">
                  <CheckCircle2 className="h-12 w-12 text-volt" strokeWidth={1.4} />
                  <h2 className="h-display text-5xl">Message sent.</h2>
                  <p className="text-bone/70">Thank you — I'll reply to you by email.</p>
                  <Btn onClick={() => setState('idle')} variant="ghost">Write another</Btn>
                </motion.div>
              ) : state === 'handoff' ? (
                <motion.div key="handoff" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ ease }} className="flex min-h-[480px] flex-col items-start justify-center gap-6" role="status">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-volt/15 text-volt">
                    <Mail className="h-5 w-5" />
                  </span>
                  <h2 className="h-display text-4xl sm:text-5xl">Your message is ready.</h2>
                  <p className="max-w-[44ch] text-[15px] leading-relaxed text-bone/70">
                    This site has no mail server connected, so nothing has been sent yet. Open it in your email app — subject and message are pre-filled — or copy it and write to <span className="text-bone">{PROFILE.email}</span>.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Btn href={mailtoFor(PROFILE.email, f)} variant="volt">Open in email app</Btn>
                    <Btn
                      variant="ghost"
                      icon={<Copy className="h-4 w-4" />}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(`To: ${PROFILE.email}\nSubject: ${f.subject}\n\n${f.message}\n\n— ${f.name} (${f.email})`)
                        } catch {
                          /* ignore */
                        }
                      }}
                    >
                      Copy message
                    </Btn>
                  </div>
                  <button onClick={() => setState('idle')} className="label underline-offset-4 hover:text-bone hover:underline">
                    ← Edit message
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                  <div className="flex items-center justify-between">
                    <p className="label">New message</p>
                    <p className="label">{isConfigured() ? 'Sends directly' : 'Opens in your email app'}</p>
                  </div>
                  <AnimatePresence>
                    {state === 'error' && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 overflow-hidden rounded-xl bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ff9a9a]" role="alert">
                        <AlertCircle className="h-4 w-4 shrink-0" /> Please check the highlighted fields.
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <div className="grid gap-8 sm:grid-cols-2">
                    <label className="block">
                      <span className="label">Name *</span>
                      <input id="c-name" className={field('name')} value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" aria-invalid={!!errs.name} aria-describedby="e-name" />
                      {errs.name && <span id="e-name" className="mt-2 block text-xs text-[#ff9a9a]">{errs.name}</span>}
                    </label>
                    <label className="block">
                      <span className="label">Email *</span>
                      <input id="c-email" type="email" className={field('email')} value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" aria-invalid={!!errs.email} aria-describedby="e-email" />
                      {errs.email && <span id="e-email" className="mt-2 block text-xs text-[#ff9a9a]">{errs.email}</span>}
                    </label>
                  </div>
                  <label className="block">
                    <span className="label">Subject *</span>
                    <input id="c-subject" className={field('subject')} value={f.subject} onChange={(e) => set('subject', e.target.value)} list="topics" aria-invalid={!!errs.subject} aria-describedby="e-subject" />
                    <datalist id="topics">
                      {TOPICS.map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                    {errs.subject && <span id="e-subject" className="mt-2 block text-xs text-[#ff9a9a]">{errs.subject}</span>}
                  </label>
                  <label className="block">
                    <span className="label flex justify-between">
                      <span>Message *</span>
                      <span className="tabular-nums">{f.message.length}/2000</span>
                    </span>
                    <textarea id="c-message" rows={6} maxLength={2000} className={`${field('message')} resize-none`} value={f.message} onChange={(e) => set('message', e.target.value)} aria-invalid={!!errs.message} aria-describedby="e-message" />
                    {errs.message && <span id="e-message" className="mt-2 block text-xs text-[#ff9a9a]">{errs.message}</span>}
                  </label>
                  <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-dim">{isConfigured() ? 'Your message goes straight to my inbox.' : 'No data is stored or sent by this site.'}</p>
                    <Btn type="submit" variant="solid" disabled={state === 'sending'} icon={<ArrowUpRight className="h-4 w-4" />}>
                      {state === 'sending' ? 'Sending…' : 'Send message'}
                    </Btn>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="wrap pb-24">
        <Eyebrow className="mb-6">Response</Eyebrow>
        <p className="max-w-[60ch] text-sm leading-relaxed text-mist">Email is the fastest way to reach me. Recruiters are welcome to request references or code walkthroughs of any project.</p>
      </section>
    </>
  )
}
