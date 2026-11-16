import { AnimatePresence, MotionConfig } from 'framer-motion'
import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { Btn } from './components/fx'
import CommandPalette from './components/CommandPalette'
import { Ambient, Cursor, Footer, Header, Loader, Page, Progress, Wipe, useSmoothScroll } from './components/Shell'
import { PROJECTS } from './data/content'
import { RouterProvider, routeKey, useRouter, type Route } from './lib/router'
import About from './pages/About'

const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Skills = lazy(() => import('./pages/Stack'))
const Education = lazy(() => import('./pages/Journey'))
const Contact = lazy(() => import('./pages/Contact'))

const META: Record<string, [string, string]> = {
  about: ['Daniyal Naqvi — Data Science Student & Software Developer, Chemnitz', "Hi, I'm Daniyal — a Data Science student at TU Chemnitz building intelligent systems and software. Open to Werkstudent roles in Data Science, AI, ML and Software Development."],
  projects: ['Projects — Daniyal Naqvi', 'CipherLink, Hospital DBMS Console, Brain Tumor Segmentation with YOLOv11 & SAM, a DBMS from scratch and more — with real GitHub repositories.'],
  skills: ['Skills — Daniyal Naqvi', 'Python, Java, C++, TypeScript, PyTorch, YOLOv11, SAM, React, FastAPI, Node.js, MongoDB and more — mapped to real projects.'],
  education: ['Education — Daniyal Naqvi', 'B.Sc. Data Science at TU Chemnitz, B.S. Computer Science at COMSATS University Islamabad, awards and volunteering.'],
  contact: ['Contact — Daniyal Naqvi', 'Werkstudent opportunities, collaborations, AI and data science projects — get in touch.'],
  notfound: ['Not found — Daniyal Naqvi', 'This page does not exist.'],
}

function setMeta(r: Route) {
  let [t, d] = META[r.name] ?? META.about
  if (r.name === 'project') {
    const p = PROJECTS.find((x) => x.id === r.id)
    if (p) [t, d] = [`${p.title} — Case study | Daniyal Naqvi`, `${p.summary} ${p.stack.join(', ')}.`]
  }
  document.title = t
  for (const sel of ['meta[name="description"]', 'meta[property="og:description"]']) document.querySelector(sel)?.setAttribute('content', d)
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', t)
}

function View({ r }: { r: Route }) {
  switch (r.name) {
    case 'about':
      return <About />
    case 'projects':
      return <Projects />
    case 'project':
      return <ProjectDetail id={r.id} />
    case 'skills':
      return <Skills />
    case 'education':
      return <Education />
    case 'contact':
      return <Contact />
    default:
      return (
        <section className="wrap flex min-h-[85vh] flex-col items-center justify-center gap-8 pt-24 text-center">
          <p className="h-display text-gradient text-[clamp(6rem,24vw,18rem)]">404</p>
          <p className="text-mist">This route doesn't exist.</p>
          <Btn to="#about">Back to About</Btn>
        </section>
      )
  }
}

function Shell() {
  const { route } = useRouter()
  const key = routeKey(route)
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('sdn.loaded')
    } catch {
      return true
    }
  })
  const [first, setFirst] = useState(true)
  useSmoothScroll()
  const done = useCallback(() => {
    setLoading(false)
    try {
      sessionStorage.setItem('sdn.loaded', '1')
    } catch {
      /* ignore */
    }
  }, [])
  useEffect(() => setMeta(route), [key]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = setTimeout(() => setFirst(false), 60)
    return () => clearTimeout(t)
  }, [])
  // warm the route chunks after first paint
  useEffect(() => {
    const t = setTimeout(() => {
      import('./pages/Projects')
      import('./pages/ProjectDetail')
      import('./pages/Contact')
      import('./pages/Stack')
      import('./pages/Journey')
    }, 2500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="noise relative">
      <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }} className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-bone focus:px-4 focus:py-2 focus:text-void">
        Skip to content
      </a>
      <Ambient />
      <Progress />
      <Cursor />
      {loading && <Loader onDone={done} />}
      <Header />
      <CommandPalette />
      {!first && <Wipe id={key} />}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <Page id={key} key={key}>
            <Suspense fallback={<div className="min-h-screen" />}>
              <View r={route} />
            </Suspense>
          </Page>
        </AnimatePresence>
        <Footer />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider>
        <Shell />
      </RouterProvider>
    </MotionConfig>
  )
}
