# Design System Document: The Sovereign Intelligence

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Jurist"**
This design system moves beyond the "chatbot" trope to establish a high-stakes, authoritative digital environment. It rejects the cluttered, line-heavy interfaces of traditional legal software in favor of **Atmospheric Authority**. 

The aesthetic is inspired by high-end editorial layouts and advanced command centers. We achieve "Modern Professionalism" not through generic components, but through intentional asymmetry, massive typographic contrast, and a sophisticated layering of dark tones. The goal is to make the user feel like they are interacting with a sovereign intelligence—one that is precise, fast, and impeccably organized.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a Dominican heritage but elevated for a global, high-tech legal context. We move away from "flat black" into a world of "deep obsidian" and "chromatic grays."

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Layout boundaries must be established via background color shifts. A `surface-container-low` card sitting on a `surface` background provides enough contrast to be felt without the visual "noise" of a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical, stacked layers of smoked glass and matte metal.
*   **Base Layer (`surface` / `#131313`):** The foundational canvas.
*   **Secondary Layer (`surface-container-low` / `#1c1b1b`):** Large structural areas (sidebars, secondary panels).
*   **Elevated Layer (`surface-container-high` / `#2a2a2a`):** Interactive cards or floating panels.
*   **The "Glass & Gradient" Rule:** Main CTAs or active chat states should utilize a subtle linear gradient from `primary` (#c6c6c7) to `primary-container` (#151718) at a 135-degree angle to provide a metallic, premium sheen.

---

## 3. Typography: Editorial Precision
We utilize **Inter** not as a system font, but as a Swiss-inspired architectural tool.

*   **Display (Large/Medium):** Used for landing page hero moments. Set with tight letter-spacing (-0.02em) to evoke a sense of "High-Tech Brutalism."
*   **Headline & Title:** Use these to command attention. They should always be `on-surface` (#e5e2e1) to ensure the highest contrast against the dark background.
*   **Body & Labels:** Use `on-surface-variant` (#c4c7c7) for long-form reading to reduce eye strain.
*   **Hierarchy Note:** Use dramatic scale shifts. A `display-lg` headline paired with a `label-md` metadata tag creates an "Editorial" look that feels custom and premium.

---

## 4. Elevation & Depth
In this system, depth is felt, not seen.

*   **Tonal Layering:** Avoid shadows for static elements. Simply shift the surface tier. Place a `surface-container-lowest` (#0e0e0e) input field inside a `surface-container-high` (#2a2a2a) card.
*   **Ambient Shadows:** For floating modals, use a shadow with a 40px-60px blur, 4% opacity, using the `on-surface` color. It should feel like a soft glow, not a drop shadow.
*   **The Ghost Border:** If accessibility requires a stroke (e.g., in high-glare environments), use `outline-variant` (#444748) at **15% opacity**.
*   **Glassmorphism:** Floating action bars or "Source Citation" popovers must use `backdrop-filter: blur(12px)` and a semi-transparent `surface-container` background to allow the content beneath to bleed through subtly.

---

## 5. Components

### Chat & Message Bubbles
*   **User Bubbles:** `surface-container-highest` (#353534). No borders. `xl` (0.75rem) roundedness.
*   **Assistant Bubbles:** No background. Content sits directly on the `surface`. Use a secondary accent (Dominican Red `#EF3340`) only for the AI icon or a thin vertical "intent" line on the left.
*   **Source Citations:** Styled as "Micro-Cards." Use `surface-container-lowest`, `label-sm` typography, and a `tertiary` (#abc7ff) text color to denote interactivity.

### Buttons
*   **Primary:** Background: `primary` (#c6c6c7); Text: `on-primary` (#2f3131). Use for the "Send" or "Submit" actions.
*   **Secondary (The Dominican Accent):** Background: `secondary_container` (#bf0124); Text: `on-secondary_fixed`. Use sparingly for high-value legal alerts or critical calls to action.
*   **Tertiary:** Ghost style. No background, `outline` color for text.

### Input Fields (Shadcn-Inspired)
*   **Default State:** `surface-container-lowest` background, `md` (0.375rem) corner radius.
*   **Focus State:** No thick borders. Increase the background to `surface-container-highest` and add a subtle `tertiary` (#abc7ff) "Ghost Border" at 20% opacity.

### Navigation & Lists
*   **The "No-Divider" Rule:** Forbid the use of horizontal lines. Use 16px or 24px of vertical white space (from the Spacing Scale) to separate list items. Use a `surface-container-low` background on hover to indicate selection.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts on the landing page (Aceternity-style) to guide the eye toward the "Red" Dominican accent.
*   **Do** use "Breathing Room." Legal data is dense; the interface should be the opposite.
*   **Do** use `tertiary` (#abc7ff) for all links and citations to maintain a "High-Tech" feel.

### Don't
*   **Don't** use pure black (#000000). It kills the depth of the "Digital Jurist" aesthetic.
*   **Don't** use standard 1px grey borders. It makes the app look like a generic dashboard.
*   **Don't** use vibrant colors for backgrounds. Dominican Red and Blue are high-energy; use them only for small accents, icons, or status indicators to maintain a professional "Sovereign" tone.
*   **Don't** use standard drop shadows. If it doesn't look like light hitting frosted glass, it's too heavy.