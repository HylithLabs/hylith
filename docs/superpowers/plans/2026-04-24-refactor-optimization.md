# Project Refactor and Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor Hylith.com for mobile-first responsiveness, SEO, and performance while strictly preserving the desktop design.

**Architecture:** Mobile-first Tailwind v4 utility migration with custom breakpoints. Next.js Metadata API and Image optimization.

**Tech Stack:** Next.js 15+, React 19, Tailwind CSS v4, GSAP, Lenis.

---

### Task 1: Tailwind v4 Breakpoint Configuration

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Define custom breakpoints in CSS variables**

```css
@theme inline {
  /* ... existing variables ... */
  --breakpoint-md: 769px;
  --breakpoint-lg: 1025px;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "config: set custom breakpoints for mobile-first migration"
```

### Task 2: Global Typography & Utility Cleanup

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Optimize global typography and overflow**

```css
/* Update html and body for better stability */
html {
  font-family: var(--font-dm-sans), sans-serif;
  -webkit-font-smoothing: antialiased;
  font-optical-sizing: auto;
  overflow-x: clip;
  scroll-behavior: auto; /* Required for Lenis */
}

body {
  overflow-x: clip;
  min-height: 100vh;
  position: relative;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "style: optimize global typography and scroll stability"
```

### Task 3: HeroSection Refactor (Mobile-First + SEO)

**Files:**
- Modify: `pages/HeroSection.tsx`

- [ ] **Step 1: Convert Desktop-first to Mobile-first**
  - Use `px-4 md:px-8 lg:px-0` instead of `max-[1024px]:px-8`.
  - Ensure `lg:` classes match exactly the current desktop values.

- [ ] **Step 2: Implement Semantic HTML**
  - Wrap in `<section aria-labelledby="hero-heading">`.
  - Ensure the `h1` is clean and contains relevant keywords.

- [ ] **Step 3: Commit**

```bash
git add pages/HeroSection.tsx
git commit -m "refactor: mobile-first HeroSection and semantic HTML"
```

### Task 4: Second Section Refactor (Image Optimization)

**Files:**
- Modify: `pages/Second.tsx`

- [ ] **Step 1: Optimize Next.js Image**
  - Add `priority` to the main image.
  - Set `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 55vw"`.

- [ ] **Step 2: Mobile-First Layout Migration**
  - Invert `max-` utilities to `lg:` prefixes for desktop preservation.

- [ ] **Step 3: Commit**

```bash
git add pages/Second.tsx
git commit -m "perf: optimize images and refactor Second section"
```

### Task 5: Third & Forth Section Optimization

**Files:**
- Modify: `pages/Third.tsx`
- Modify: `pages/Forth.tsx`

- [ ] **Step 1: Memoize Third Section**
  - Wrap component in `React.memo` as it is mostly static text.

- [ ] **Step 2: Refactor Forth Section Accordion & Marquee**
  - Convert accordion spacing to mobile-first.
  - Optimize Marquee performance with `will-change: transform`.

- [ ] **Step 3: Commit**

```bash
git add pages/Third.tsx pages/Forth.tsx
git commit -m "refactor: optimize Third and Forth sections"
```

### Task 6: Fifth Section & Footer Refactor

**Files:**
- Modify: `pages/Fifth.tsx`

- [ ] **Step 1: Mobile-First Column Layout**
  - Use base styles for single column, `lg:grid-cols-2` for desktop.

- [ ] **Step 2: Semantic Footer**
  - Change generic `footer` to actual `<footer>` tag (already partially done, but verify accessibility).

- [ ] **Step 3: Commit**

```bash
git add pages/Fifth.tsx
git commit -m "refactor: mobile-first Fifth section and footer"
```

### Task 7: Metadata & Structured Data Audit

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/site-config.ts`

- [ ] **Step 1: Expand JSON-LD**
  - Add more detailed services and brand information to `jsonLd` object.

- [ ] **Step 2: Verify Metadata alternates**
  - Ensure canonical URLs are correctly generated.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx app/site-config.ts
git commit -m "seo: expand structured data and verify metadata"
```

### Task 8: Performance Verification & Cleanup

- [ ] **Step 1: Remove unused assets**
  - Delete unused SVG files from `public/`.

- [ ] **Step 2: Audit Bundle**
  - Ensure no large libraries are imported unnecessarily.

- [ ] **Step 3: Commit**

```bash
git commit -m "cleanup: remove unused assets and verify performance"
```
