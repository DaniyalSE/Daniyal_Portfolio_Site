# Syed Daniyal Haider Naqvi — Portfolio

React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion + GSAP (intro) + Three.js (hero) + Lenis.

```bash
npm install
npm run dev        # local
npm run build      # static build in dist/ — deploy to Vercel, Netlify, GitHub Pages, …
```

## Contact form (needs credentials to send directly)
Without configuration the form validates and hands the message to the visitor's email app (mailto) — it never claims a message was sent.
To send directly, create `.env`:

```
VITE_CONTACT_ENDPOINT=https://formspree.io/f/<your-form-id>
# or Web3Forms:
# VITE_CONTACT_ENDPOINT=https://api.web3forms.com/submit
# VITE_CONTACT_ACCESS_KEY=<your-access-key>
```

## Content
All facts live in `src/data/content.ts` (from the CV). CVs: `public/cv/`. Visuals in `public/img/` include generated artwork and personal photos.

## Tests
`python3 e2e-test.py` (Playwright, expects `npx vite preview --port 4174`).
