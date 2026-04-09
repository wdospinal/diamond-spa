# Design System Specification: The Midnight Sanctuary

## 1. Overview & Creative North Star

The Creative North Star for this design system is **"The Midnight Sanctuary."** 

This system rejects the cluttered, utility-first approach of standard wellness apps. Instead, it adopts a "High-End Editorial" aesthetic, drawing inspiration from luxury horology and boutique hotel signage. We prioritize quiet confidence over loud calls to action. By utilizing intentional asymmetry, oversized serif typography, and a deep, monochromatic foundation, we create an interface that feels less like a tool and more like a private concierge. 

The design breaks the "template" look by treating the screen as a canvas. We use generous whitespace (negative space) as a luxury asset, allowing the rich navy and metallic tones to breathe. Every interaction should feel deliberate, heavy, and expensive.

---

## 2. Colors & Tonal Architecture

The palette is rooted in deep obsidian and metallic blues, designed to evoke a sense of late-night calm and professional precision.

### The "No-Line" Rule
To maintain a premium, seamless feel, **1px solid borders are strictly prohibited for sectioning.** Physical boundaries must be defined solely through background color shifts. For example, a content block should sit on `surface-container-low` against a `surface` background. This creates a sophisticated, architectural transition rather than a digital "box."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following hierarchy to define depth:
*   **Base:** `surface` (#001524) for the main background.
*   **Secondary Content:** `surface-container-low` (#071d2d) for subtle sectioning.
*   **Elevated Elements:** `surface-container-high` (#172c3c) for cards and interactive containers.
*   **Overlays:** `surface-bright` (#273b4c) for floating menus or modals.

### The "Glass & Gradient" Rule
Standard flat colors often feel "out-of-the-box." To elevate the experience:
*   **Glassmorphism:** Use semi-transparent `surface-container-high` with a 20px-40px `backdrop-blur` for navigation bars and floating action elements.
*   **Signature Textures:** Apply subtle linear gradients (135°) transitioning from `primary` (#a5cce6) to `primary_container` (#7fa5be) on primary CTAs. This mimics the light-catch on brushed steel.

---

## 3. Typography: The Editorial Voice

The typographic system relies on the high-contrast pairing of **Noto Serif** and **Manrope**.

*   **The Display Scale (Noto Serif):** Used for headlines and hero statements. The `display-lg` (3.5rem) and `headline-lg` (2rem) levels should be used to anchor the page. These serif fonts represent the "Diamond" heritage—sharp, classic, and authoritative.
*   **The Functional Scale (Manrope):** Used for all body text, labels, and titles. Manrope’s geometric clarity provides a modern, masculine counter-balance to the serif headers.
*   **Visual Weight:** Always maintain a high contrast between the `on-surface` (cool silver) and the `background`. Use `label-sm` in all-caps with 0.1rem letter spacing for "over-line" categories to create a sense of premium categorization.

---

## 4. Elevation & Depth

In this design system, depth is a whisper, not a shout. We move away from traditional drop shadows in favor of **Tonal Layering.**

### The Layering Principle
Achieve hierarchy by "stacking" container tiers. A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural inset look, mimicking high-end joinery in furniture design.

### Ambient Shadows
If an element must float (like a modal), use an **Ambient Shadow**:
*   **Color:** Use a tinted version of `on-surface` at 6% opacity.
*   **Blur:** Extra-diffused (30px–60px).
*   **Offset:** 8px–12px Y-axis only to simulate overhead lighting.

### The "Ghost Border" Fallback
If accessibility requires a container boundary, use a **Ghost Border**. This is a 1px stroke using the `outline-variant` token at **15% opacity**. This provides a guide for the eye without breaking the "No-Line" rule's aesthetic intent.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary` background with `on-primary` text. No border. Use `md` (0.375rem) roundedness for a sharp, tailored look.
*   **Secondary:** Ghost style. `on-surface` text with a 15% opacity `outline` border.
*   **Tertiary:** Text only in `primary`, using `label-md` for a sophisticated, minimalist link.

### Cards & Lists
*   **Prohibition:** Never use divider lines.
*   **Separation:** Use 32px of vertical whitespace (spacing scale) or a background shift to `surface-container-high` to separate services or list items.
*   **Interactive Cards:** On hover, shift the background from `surface-container-high` to `surface-bright`.

### Input Fields
*   **Style:** Minimalist. Use a `surface-container-highest` background with a 1px bottom stroke in `outline` only. 
*   **Focus State:** The bottom stroke transitions to `primary`, and the label (`label-sm`) shifts to `primary`.

### Navigation & Booking (Specialized)
*   **Floating Navigation:** A bottom-docked navigation bar using glassmorphism (`surface-container-high` at 80% opacity) to allow page content to shimmer behind it.
*   **Booking Grid:** Use a monochromatic calendar view using `surface-container-lowest` for inactive dates and `primary` for selected slots.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Asymmetry:** Place a `display-lg` headline on the left with a small `body-md` description offset to the right. It feels curated, not generated.
*   **Use Metallic Accents:** Use the `tertiary` (#f0bd8d) color sparingly for "exclusive" status indicators or gold-tier service badges.
*   **Prioritize Breathing Room:** If a screen feels crowded, increase the spacing between sections by 24px. Luxury is the luxury of space.

### Don't:
*   **No Floral/Soft Imagery:** Avoid rounded, "bubbly" UI elements. Keep corners at `md` (0.375rem) or `none`.
*   **No High-Contrast Dividers:** Never use a white or light gray line to separate content; it shatters the immersion of the dark "Sanctuary" vibe.
*   **No Generic Icons:** Use thin-stroke, geometric icons. Avoid filled, playful, or "friendly" icon sets. They should look like architectural symbols.