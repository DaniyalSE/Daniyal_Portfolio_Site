import { AnimatePresence, motion } from 'framer-motion'
import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PROFILE } from '../data/content'
import { Btn } from './fx'

type DownloadsNS = { save: (r: { filename: string; data: Blob }) => Promise<{ status: string }> }
declare global {
  interface Window {
    claude?: { use: (n: string) => Promise<unknown> }
  }
}

/**
 * CV download. On a normal host this is a plain <a download>. Inside the Claude artifact viewer
 * (where page-initiated downloads are blocked) it uses the viewer's `downloads` capability.
 */
export function useHostDownloads() {
  const [dl, setDl] = useState<DownloadsNS | null>(null)
  useEffect(() => {
    let alive = true
    window.claude
      ?.use('downloads')
      .then((d) => alive && setDl((d as DownloadsNS) ?? null))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return dl
}

export default function CvButton({ lang = 'en', variant = 'solid' as 'solid' | 'ghost' | 'volt', label }: { lang?: 'en' | 'de'; variant?: 'solid' | 'ghost' | 'volt'; label?: string }) {
  const dl = useHostDownloads()
  const [msg, setMsg] = useState('')
  const path = lang === 'en' ? PROFILE.cvEn : PROFILE.cvDe
  const filename = path.split('/').pop()!
  const text = label ?? (lang === 'en' ? 'Download CV' : 'Lebenslauf (DE)')

  const flash = (m: string) => {
    setMsg(m)
    setTimeout(() => setMsg(''), 2600)
  }

  const viaHost = async () => {
    try {
      const blob = await (await fetch(path)).blob()
      await dl!.save({ filename, data: blob })
      flash('Saved')
    } catch (e) {
      const code = (e as { code?: string })?.code
      if (code === 'declined') flash('Download cancelled')
      else {
        flash('Opening the PDF instead')
        window.open(path, '_blank', 'noopener')
      }
    }
  }

  return (
    <span className="relative inline-flex">
      {dl ? (
        <Btn onClick={viaHost} variant={variant} icon={<Download className="h-4 w-4" />}>
          {text}
        </Btn>
      ) : (
        <Btn href={path} download={filename} variant={variant} icon={<Download className="h-4 w-4" />}>
          {text}
        </Btn>
      )}
      <AnimatePresence>
        {msg && (
          <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-volt" role="status">
            {msg}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
