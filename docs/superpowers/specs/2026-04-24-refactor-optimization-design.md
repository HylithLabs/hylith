# Spec: Project Refactor and Optimization (April 2026)

This document outlines the strategy for refactoring the Hylith.com project to implement mobile-first responsiveness, SEO best practices, and performance optimizations while preserving the existing desktop design.

## 1. Responsiveness (Mobile-First)

### 1.1 Breakpoints
We will use custom breakpoints that align with the user's requirements:
- **Mobile**: `base` (0px - 768px)
- **Tablet**: `md` (769px - 1024px)
- **Desktop**: `lg` (1025px+)

### 1.2 Migration Strategy
- **Base styles**: All elements will have mobile-first styles by default.
- **Overwrites**: Current `max-[1024px]` and `max-[768px]` utilities will be inverted.
- **Desktop Preservation**: The `lg:` prefix will be used to encapsulate ALL current desktop-specific styles (padding, margin, font sizes, etc.) to ensure zero visual regression on screens ≥1025px.
- **Fluid UI**: Use `clamp()` for typography where not already implemented to ensure smooth scaling between mobile and tablet.

## 2. SEO & Semantic HTML

### 2.1 Heading Structure
- Audit all sections (`HeroSection`, `Second`, etc.) to ensure a single `h1` (currently in `HeroSection`).
- Update other section headers to `h2` and sub-headers to `h3`.

### 2.2 Semantic Tags
- Replace `div` wrappers in `pages/*.tsx` with semantic tags:
  - `<section>` for major blocks.
  - `<header>` for the navigation/hero top.
  - `<footer>` for the bottom section in `Fifth.tsx`.
  - `<article>` or `<nav>` where appropriate.

### 2.3 Metadata & Structured Data
- Review `app/page.tsx` JSON-LD and expand it with more detailed service descriptions and brand keywords.
- Ensure `generateMetadata` in `app/page.tsx` correctly pulls from `site-config.ts`.

## 3. Performance & Optimization

### 3.1 Next.js Image Optimization
- Add `priority` to the main image in `HeroSection` or `Second` (whichever is largest in the initial viewport).
- Implement `sizes` attribute for all `next/image` instances:
  - Example: `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"`
- Ensure `avif` and `webp` are utilized (already in `next.config.ts`).

### 3.2 Code Quality & Splitting
- **Dynamic Imports**: Use `dynamic()` for heavy components or those requiring `window` access (e.g., GL wrappers).
- **Cleanup**: Remove unused assets in `public/` (boilerplate SVGs).
- **Memoization**: Apply `React.memo` to static sections like `Third.tsx` to prevent redundant re-renders during smooth scrolling.

## 4. GSAP + Lenis

### 4.1 Scroll Stability
- Ensure `ScrollTrigger.refresh()` is called after images load or components mount.
- Maintain current `matchMedia` logic in `Second.tsx` to keep animations disabled on mobile/tablet for performance.

### 4.2 GPU Acceleration
- Selectively apply `will-change: transform` to active GSAP targets.
- Ensure `force3D: true` (GSAP default) is respected for smoother hardware acceleration.

## 5. Verification Plan
- **Desktop Match**: Compare the new version with the current production layout at 1920x1080 to ensure 1:1 parity.
- **Mobile/Tablet Layout**: Test at 375px (iPhone SE) and 768px (iPad) to ensure no overflow and proper scaling.
- **Lighthouse/Core Web Vitals**: Run audit to verify LCP < 2.5s and CLS < 0.1.
- **SEO Audit**: Verify metadata and structured data using Schema Markup Validator.
