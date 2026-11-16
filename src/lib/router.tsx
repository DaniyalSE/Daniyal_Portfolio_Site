import { createContext, useCallback, useContext, useEffect, useState, type ReactNode, type MouseEvent, type AnchorHTMLAttributes } from 'react'

/**
 * Plain-hash router — works on any static host (Netlify, GitHub Pages) without rewrite rules.
 * The root URL (no hash) is the About page: it is the landing page.
 *   #about  #projects  #project-<id>  #skills  #education  #contact
 * Legacy hashes from the previous version are redirected so old links keep working.
 */
export type Route = { name: 'about' | 'projects' | 'skills' | 'education' | 'contact' } | { name: 'project'; id: string } | { name: 'notfound' }

const SIMPLE = ['about', 'projects', 'skills', 'education', 'contact'] as const
const LEGACY: Record<string, string> = { home: 'about', stack: 'skills', journey: 'education', work: 'projects' }

export function parse(hash: string): Route {
  let h = hash.replace(/^#\/?/, '')
  if (!h) return { name: 'about' }
  if (LEGACY[h]) h = LEGACY[h]
  if (h.startsWith('project-')) return { name: 'project', id: h.slice(8) }
  if ((SIMPLE as readonly string[]).includes(h)) return { name: h as (typeof SIMPLE)[number] }
  return { name: 'notfound' }
}

export const routeKey = (r: Route) => (r.name === 'project' ? `project-${r.id}` : r.name)

const Ctx = createContext<{ route: Route; go: (to: string) => void } | null>(null)

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parse(location.hash))
  useEffect(() => {
    // normalise legacy hashes in the address bar
    const h = location.hash.replace(/^#\/?/, '')
    if (LEGACY[h]) history.replaceState(null, '', `#${LEGACY[h]}`)
    const on = () => setRoute(parse(location.hash))
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  const go = useCallback((to: string) => {
    const t = to.startsWith('#') ? to : `#${to}`
    const current = location.hash || '#about'
    if (current === t) {
      window.dispatchEvent(new CustomEvent('folio:top'))
      return
    }
    location.hash = t
  }, [])
  return <Ctx.Provider value={{ route, go }}>{children}</Ctx.Provider>
}

export function useRouter() {
  const c = useContext(Ctx)
  if (!c) throw new Error('RouterProvider missing')
  return c
}

export function Link({ to, children, onClick, ...rest }: { to: string; children: ReactNode; onClick?: () => void } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>) {
  const { go } = useRouter()
  const href = to.startsWith('#') ? to : `#${to}`
  return (
    <a
      href={href}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
        e.preventDefault()
        onClick?.()
        go(href)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
