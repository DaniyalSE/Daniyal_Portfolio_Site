import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { SKILLS, projectsUsing } from '../data/content'

interface Node {
  id: string
  label: string
  x: number
  y: number
  groups: string[]
  hub?: boolean
  color: string
}

const W = 1000
const H = 640

/** Builds a deterministic layout: category hubs on an ellipse, skills orbiting their hub. Shared skills sit between hubs. */
function useLayout() {
  return useMemo(() => {
    const hubs: Node[] = SKILLS.map((g, i) => {
      const a = (i / SKILLS.length) * Math.PI * 2 - Math.PI / 2
      return { id: `hub-${g.id}`, label: g.label, x: W / 2 + Math.cos(a) * 330, y: H / 2 + Math.sin(a) * 215, groups: [g.id], hub: true, color: g.color }
    })
    const map = new Map<string, Node>()
    SKILLS.forEach((g, gi) => {
      const hub = hubs[gi]
      g.items.forEach((s, si) => {
        const ex = map.get(s)
        if (ex) {
          ex.groups.push(g.id)
          return
        }
        const n = g.items.length
        const a = (si / n) * Math.PI * 2 + gi * 0.9
        const r = 62 + (si % 3) * 26
        map.set(s, { id: s, label: s, x: hub.x + Math.cos(a) * r * 1.15, y: hub.y + Math.sin(a) * r * 0.78, groups: [g.id], color: g.color })
      })
    })
    // Shared skills: place them on the bridge between their hubs, spread out so labels never collide.
    const shared = [...map.values()].filter((n) => n.groups.length > 1)
    shared.forEach((n, k) => {
      const hs = n.groups.map((id) => hubs.find((h) => h.id === `hub-${id}`)!)
      const [a, b] = [hs[0], hs[hs.length - 1]]
      const t = 0.38 + (k % 3) * 0.12
      const dx = b.x - a.x,
        dy = b.y - a.y,
        len = Math.hypot(dx, dy) || 1
      const off = ((k % 2) * 2 - 1) * (18 + (k % 3) * 10)
      n.x = a.x + dx * t + (-dy / len) * off
      n.y = a.y + dy * t + (dx / len) * off
    })
    // Label-aware relaxation: treat each skill as a box (dot + label to its right) and resolve overlaps,
    // including the category labels that sit above each hub.
    const all = [...map.values()]
    const lw = (n: Node) => 16 + n.label.length * 7.4
    const boxes = () => [
      ...all.map((n) => ({ n, x0: n.x - 6, x1: n.x + lw(n), y0: n.y - 11, y1: n.y + 11, fixed: false })),
      ...hubs.map((h) => ({ n: h, x0: h.x - h.label.length * 4.6 - 8, x1: h.x + h.label.length * 4.6 + 8, y0: h.y - 34, y1: h.y + 18, fixed: true })),
    ]
    for (let it = 0; it < 140; it++) {
      const bs = boxes()
      let moved = false
      for (let i = 0; i < bs.length; i++)
        for (let j = i + 1; j < bs.length; j++) {
          const A = bs[i],
            B = bs[j]
          if (A.fixed && B.fixed) continue
          const ox = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0)
          const oy = Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0)
          if (ox > 0 && oy > 0) {
            moved = true
            const dir = (A.y0 + A.y1) / 2 <= (B.y0 + B.y1) / 2 ? -1 : 1
            const step = Math.min(oy, 8) / (A.fixed || B.fixed ? 1 : 2) + 0.5
            if (!A.fixed) A.n.y += dir * step
            if (!B.fixed) B.n.y -= dir * step
          }
        }
      all.forEach((n) => {
        n.x = Math.max(24, Math.min(W - lw(n) - 8, n.x))
        n.y = Math.max(24, Math.min(H - 20, n.y))
      })
      if (!moved) break
    }
    const nodes = [...map.values()]
    const edges: [Node, Node][] = []
    nodes.forEach((n) => n.groups.forEach((g) => edges.push([hubs.find((h) => h.id === `hub-${g}`)!, n])))
    return { hubs, nodes, edges }
  }, [])
}

export default function Constellation({ compact = false }: { compact?: boolean }) {
  const { hubs, nodes, edges } = useLayout()
  const [active, setActive] = useState<string | null>(null) // skill id or hub id
  const [group, setGroup] = useState<string | null>(null)
  const wrap = useRef<HTMLDivElement>(null)

  const activeNode = nodes.find((n) => n.id === active)
  const isLit = (n: Node) => {
    if (group) return n.groups.includes(group)
    if (!active) return true
    if (active.startsWith('hub-')) return n.groups.includes(active.slice(4))
    return n.id === active
  }
  const hubLit = (h: Node) => {
    if (group) return h.groups[0] === group
    if (!active) return true
    if (active.startsWith('hub-')) return h.id === active
    return activeNode?.groups.includes(h.groups[0]) ?? false
  }

  return (
    <div ref={wrap} className="relative">
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter skill categories">
        <button onClick={() => setGroup(null)} aria-pressed={!group} className={`shrink-0 rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] ring-1 ring-inset transition ${!group ? 'bg-bone text-void ring-bone' : 'text-mist ring-white/15 hover:text-bone'}`}>
          All
        </button>
        {SKILLS.map((g) => (
          <button
            key={g.id}
            onClick={() => setGroup((x) => (x === g.id ? null : g.id))}
            aria-pressed={group === g.id}
            className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] ring-1 ring-inset transition ${group === g.id ? 'bg-bone text-void ring-bone' : 'text-mist ring-white/15 hover:text-bone'}`}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: g.color }} />
            {g.label}
          </button>
        ))}
      </div>

      <div className={`relative overflow-hidden rounded-[28px] bg-[radial-gradient(ellipse_at_center,#141826_0%,#0B0C10_70%)] ring-1 ring-inset ring-white/[0.06] ${compact ? '' : ''}`}>
        <div className="no-scrollbar overflow-x-auto" data-lenis-prevent>
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[860px] md:min-w-0" role="img" aria-label="Interactive constellation of technical skills grouped by category">
          <defs>
            <radialGradient id="hubglow">
              <stop offset="0%" stopColor="#537BFF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#537BFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* background star dust */}
          {Array.from({ length: 70 }).map((_, i) => (
            <circle key={i} cx={(i * 137.5) % W} cy={(i * 89.3) % H} r={((i * 7) % 3) * 0.35 + 0.3} fill="#8BA4FF" opacity={0.18} />
          ))}
          {edges.map(([a, b], i) => {
            const lit = hubLit(a) && isLit(b)
            return (
              <motion.line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={a.color}
                strokeWidth={lit && (active || group) ? 1.2 : 0.6}
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: lit ? (active || group ? 0.75 : 0.28) : 0.05 }}
                viewport={{ once: false }}
                transition={{ duration: 1.2, delay: (i % 12) * 0.03 }}
              />
            )
          })}
          {hubs.map((h) => (
            <g
              key={h.id}
              onPointerEnter={() => setActive(h.id)}
              onPointerLeave={() => setActive(null)}
              onClick={() => setGroup((x) => (x === h.groups[0] ? null : h.groups[0]))}
              style={{ cursor: 'pointer', opacity: hubLit(h) ? 1 : 0.25, transition: 'opacity .4s' }}
              data-cursor="link"
            >
              <circle cx={h.x} cy={h.y} r={46} fill="url(#hubglow)" opacity={0.6} />
              <circle cx={h.x} cy={h.y} r={7} fill={h.color} />
              <circle cx={h.x} cy={h.y} r={13} fill="none" stroke={h.color} strokeOpacity={0.5} />
              <text x={h.x} y={h.y - 22} textAnchor="middle" className="fill-bone font-mono" style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {h.label}
              </text>
            </g>
          ))}
          {nodes.map((n, i) => (
            <g
              key={n.id}
              tabIndex={0}
              role="button"
              aria-label={`${n.label}${projectsUsing(n.label).length ? `, used in ${projectsUsing(n.label).join(', ')}` : ''}`}
              onPointerEnter={() => setActive(n.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(n.id)}
              onBlur={() => setActive(null)}
              style={{ cursor: 'pointer', opacity: isLit(n) ? 1 : 0.18, transition: 'opacity .35s', animation: `float-${i % 3} ${6 + (i % 5)}s ease-in-out ${(i % 7) * -0.8}s infinite` }}
            >
              <circle cx={n.x} cy={n.y} r={active === n.id ? 6 : n.groups.length > 1 ? 4.5 : 3.2} fill={active === n.id ? '#F4F4F0' : n.color} style={{ transition: 'r .3s' }} />
              <text x={n.x + 9} y={n.y + 4} className="fill-bone/80" style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', fill: active === n.id ? '#F4F4F0' : 'rgba(244,244,240,0.7)' }}>
                {n.label}
              </text>
            </g>
          ))}
          <style>{`
            @keyframes float-0 { 50% { transform: translate(0px, -5px) } }
            @keyframes float-1 { 50% { transform: translate(4px, 3px) } }
            @keyframes float-2 { 50% { transform: translate(-4px, 2px) } }
            @media (prefers-reduced-motion: reduce) { g { animation: none !important } }
          `}</style>
        </svg>
        </div>
        <p className="label absolute right-4 top-4 md:hidden">Swipe to explore →</p>

        {/* info panel */}
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:w-80">
          <AnimatePresence mode="wait">
            {activeNode ? (
              <motion.div key={activeNode.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="rounded-2xl bg-void/80 p-4 ring-1 ring-inset ring-white/10 backdrop-blur-xl">
                <p className="font-display text-lg">{activeNode.label}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-mist">{activeNode.groups.map((g) => SKILLS.find((s) => s.id === g)!.label).join(' · ')}</p>
                {projectsUsing(activeNode.label).length > 0 ? (
                  <p className="mt-3 text-xs text-bone/70">Used in: {projectsUsing(activeNode.label).join(', ')}</p>
                ) : (
                  <p className="mt-3 text-xs text-dim">Coursework & general use</p>
                )}
              </motion.div>
            ) : (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="label">
                Hover a star · tap a category
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
