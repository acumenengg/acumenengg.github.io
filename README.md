# Acumen Engineering Services — Website

Modern, 3D-animated static website for **Acumen Engineering Services** — built with React, Vite, Three.js, and GSAP.

**Live URL:** [https://acumenengineeringservices.github.io/home/](https://acumenengineeringservices.github.io/home/)

## Features

- 3D BIM-style building models (Three.js / React Three Fiber)
- GSAP scroll animations with ScrollTrigger
- Dark / light mode toggle
- Responsive design (mobile-first)
- SEO meta tags & structured data
- Contact form (Formspree integration)
- WhatsApp floating button & back-to-top
- GitHub Pages ready

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173/home/](http://localhost:5173/home/)

## Build & Deploy

```bash
npm run build
```

Output goes to the `docs/` folder. Push to `main` and enable GitHub Pages:

1. Go to **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main`, folder: `/docs`

## Configuration

| Item | Location |
|------|----------|
| Contact form endpoint | `src/data/content.js` → `formEndpoint` |
| Company content | `src/data/content.js` |
| Logo | `public/logo-dark.png`, `logo-light.png`, `logo-stacked-dark.png`, `logo-stacked-light.png` |
| GitHub Pages base path | `vite.config.js` → `base` |

## Tech Stack

- React 18 + Vite 6
- Three.js + @react-three/fiber + @react-three/drei
- GSAP + ScrollTrigger
- CSS custom properties (theming)

## Brand

- **Tagline:** Insight | Precision | Delivered
- **Accent:** `#FF8C00`
- **Font:** Poppins
