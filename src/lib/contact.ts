/**
 * Contact delivery — integration-ready.
 *
 * Set VITE_CONTACT_ENDPOINT at build time to a form backend that accepts JSON POSTs, e.g.
 *   Formspree:  https://formspree.io/f/<form-id>
 *   Web3Forms:  https://api.web3forms.com/submit   (also set VITE_CONTACT_ACCESS_KEY)
 * Without it, the form validates and then hands the message to the visitor's own email app
 * (mailto) — it never claims a message was sent when nothing sent it.
 */
export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
}

export const CONTACT_ENDPOINT: string | undefined = import.meta.env.VITE_CONTACT_ENDPOINT || undefined
const ACCESS_KEY: string | undefined = import.meta.env.VITE_CONTACT_ACCESS_KEY || undefined

export const isConfigured = () => Boolean(CONTACT_ENDPOINT)

export async function sendMessage(p: ContactPayload): Promise<void> {
  if (!CONTACT_ENDPOINT) throw new Error('not_configured')
  const res = await fetch(CONTACT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...p, ...(ACCESS_KEY ? { access_key: ACCESS_KEY } : {}), _subject: `[Portfolio] ${p.subject}` }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export function mailtoFor(to: string, p: ContactPayload) {
  const body = `${p.message}\n\n— ${p.name} (${p.email})`
  return `mailto:${to}?subject=${encodeURIComponent(p.subject)}&body=${encodeURIComponent(body)}`
}
