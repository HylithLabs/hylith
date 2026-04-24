# Design Doc: Remove Systemic Colors (shadcn/MagicUI)

This document outlines the strategy for decoupling the application from the shadcn and MagicUI color systems, reverting to a cleaner state where colors are inherited or manually controlled.

## 1. Problem Statement
The current application uses shadcn's CSS variables and MagicUI's hardcoded Tailwind classes (including dark mode variants) to control its visual appearance. The user wants to remove these systemic color controls while keeping custom animations and hex-coded styles intact.

## 2. Proposed Changes

### 2.1 Global Style Cleanup (`app/globals.css`)
- **Remove Theme Mapping**: Delete the `@theme inline` block which maps Tailwind utility classes (e.g., `bg-background`, `text-foreground`) to shadcn CSS variables.
- **Remove Variable Definitions**: Delete the `:root` and `.dark` blocks containing all oklch color variables.
- **Remove Layer Overrides**:
    - Update `@layer base` to remove `@apply border-border` and `@apply bg-background text-foreground`.
    - Retain structural/font settings like `@apply font-sans`.
- **Remove Imports**: Remove `@import "shadcn/tailwind.css"` if it's strictly color-related (verify if it includes essential layout styles first).

### 2.2 Component Sanitization
- **`components/ui/text-reveal.tsx`**:
    - Remove opacity-based colors: `text-black/20`, `dark:text-white/20`.
    - Remove explicit word colors: `text-black`, `dark:text-white`.
    - Transition to using inherited colors or simpler opacity changes on the parent.
- **`pages/Third.tsx`**: Remove the `text-black` class from the section wrapper.

### 2.3 Layout Adjustments (`app/layout.tsx`)
- Ensure the `body` tag in the `RootLayout` doesn't rely on `bg-background` (already checked, it uses `min-h-screen antialiased`).

## 3. Preservation
The following will **NOT** be modified:
- GSAP animations in `pages/Second.tsx` that use explicit hex codes (`#0F0B0A`, `#EFEFED`).
- Hardcoded background/border styles in `components/Navbar.tsx` and `pages/HeroSection.tsx`.

## 4. Verification Plan
- **Visual Check**: Run `npm run dev` and ensure the page defaults to browser colors (usually black text on white background) except where custom styles are applied.
- **Dark Mode Test**: Ensure that switching the OS/browser to dark mode no longer triggers automatic color shifts in the sanitized components.
- **Build Test**: Run `npm run build` to ensure no broken references to removed CSS variables.
