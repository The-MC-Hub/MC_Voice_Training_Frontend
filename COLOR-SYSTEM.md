# MC Voice Training — Design System & Color Reference

> **Version:** 2.0 — Updated 2026-05-22  
> **Design Philosophy:** Apple / Linear — minimalist premium dark UI with purposeful gold accents.  
> This document is the single source of truth for all visual decisions in the MC Voice Training Frontend.

---

## Table of Contents

- [Design Principles](#design-principles)
- [Color Tokens](#color-tokens)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Component Patterns](#component-patterns)
- [Animation System](#animation-system)
- [Icon Usage](#icon-usage)
- [Accessibility](#accessibility)

---

## Design Principles

The MC Voice Training UI follows five core principles derived from the Apple/Linear design language:

| Principle | Rule | Rationale |
|---|---|---|
| **Restraint** | Gold (`#f5a623`) used only for CTAs, active states, and critical scores | Scarcity preserves attention value |
| **Depth through subtlety** | Borders at `rgba(255,255,255,0.06–0.12)`, no heavy shadows | Creates layering without visual noise |
| **Whitespace as content** | Generous padding (`p-6` to `p-8`), `max-w-6xl mx-auto` layout grid | Breathing room improves readability and perceived quality |
| **Typography hierarchy** | Size + weight contrast, never rely on color alone for hierarchy | Ensures accessibility and clarity |
| **Purposeful motion** | Animate only entry (fade+slide), hover (lift), and state changes | Animation earns attention — not decoration |

---

## Color Tokens

### CSS Variables (defined in `src/index.css`)

```css
:root {
  --bg-base:       #09090b;    /* App-wide background — near-black */
  --bg-surface:    #111113;    /* Cards, panels, modals */
  --bg-elevated:   #1a1a1e;    /* Dropdowns, hover states, tooltips */
  --border:        rgba(255, 255, 255, 0.06);   /* Default border */
  --border-hover:  rgba(255, 255, 255, 0.14);   /* Border on hover/focus */
  --text-primary:  #fafafa;    /* Headings, labels */
  --text-secondary: #a1a1aa;   /* Body text, descriptions */
  --text-muted:    #52525b;    /* Hints, timestamps, secondary labels */
  --gold:          #f5a623;    /* Primary accent — CTAs, active state */
  --gold-dim:      rgba(245, 166, 35, 0.10);    /* Gold tint background */
  --gold-border:   rgba(245, 166, 35, 0.20);    /* Gold border accent */
}
```

### Semantic Color Map

| Token | Hex / Value | Usage |
|---|---|---|
| `--bg-base` | `#09090b` | `<body>`, `<main>`, page-level backgrounds |
| `--bg-surface` | `#111113` | Cards, side panels, FAQ items, feature tiles |
| `--bg-elevated` | `#1a1a1e` | Stat icons, input backgrounds, dropdown menus |
| `--border` | `rgba(255,255,255,0.06)` | All card and component borders at rest |
| `--border-hover` | `rgba(255,255,255,0.14)` | Borders on hover / focus |
| `--text-primary` | `#fafafa` | H1–H4, bold labels, card titles |
| `--text-secondary` | `#a1a1aa` | Paragraphs, descriptions, body copy |
| `--text-muted` | `#52525b` | Date stamps, meta info, placeholder text |
| `--gold` | `#f5a623` | Primary CTA buttons, active nav links, score badges |
| `--gold-dim` | `rgba(245,166,35,0.10)` | Icon container backgrounds, selected state fills |
| `--gold-border` | `rgba(245,166,35,0.20)` | Badge borders, active card highlight |

### Score / Status Colors

These are reserved for data-driven coloring — never use for decorative purposes.

| Score Range | Color | Tailwind Classes | Usage |
|---|---|---|---|
| ≥ 80 (Excellent) | Emerald | `text-emerald-400 bg-emerald-500/[0.07] border-emerald-500/20` | High scores, success states |
| 50–79 (Average) | Amber | `text-amber-400 bg-amber-500/[0.07] border-amber-500/20` | Mid-range scores, warnings |
| < 50 (Needs work) | Red | `text-red-400 bg-red-500/[0.07] border-red-500/20` | Low scores, error states |

### Category Badge Colors

Used in `SessionCard`, `VoiceLibrary`, and lesson cards.

| Category | Label | Tailwind Classes |
|---|---|---|
| `WEDDING` | Đám cưới | `text-pink-400 bg-pink-500/[0.08] border-pink-500/20` |
| `NEWS` | Tin tức | `text-blue-400 bg-blue-500/[0.08] border-blue-500/20` |
| `PRESENTATION` | Thuyết trình | `text-violet-400 bg-violet-500/[0.08] border-violet-500/20` |
| `CEREMONY` | Lễ hội | `text-orange-400 bg-orange-500/[0.08] border-orange-500/20` |
| `GENERAL` | Tổng quát | `text-zinc-400 bg-zinc-500/[0.08] border-zinc-500/20` |

### Difficulty Colors

| Level | Label | Dot Color |
|---|---|---|
| `EASY` | Dễ | `bg-emerald-400` |
| `MEDIUM` | Trung bình | `bg-amber-400` |
| `HARD` | Khó | `bg-red-400` |

---

## Typography

### Font Stack

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Inter is loaded via Google Fonts or bundled. The system-font fallback chain ensures consistent rendering across platforms if Inter fails to load.

### Type Scale

| Role | Tailwind Class | Size | Weight | Usage |
|---|---|---|---|---|
| **Display** | `text-6xl lg:text-7xl font-bold tracking-tight` | 60–72px | 700 | Hero H1 only |
| **Heading 2** | `text-3xl lg:text-4xl font-bold tracking-tight` | 30–36px | 700 | Section headings |
| **Heading 3** | `text-xl font-semibold` | 20px | 600 | Card titles, modal headers |
| **Heading 4** | `text-[15px] font-semibold` | 15px | 600 | Component labels |
| **Body** | `text-[15px] text-zinc-400 leading-relaxed` | 15px | 400 | Paragraphs, descriptions |
| **Body Small** | `text-[13px] text-zinc-400` | 13px | 400 | Card text, secondary info |
| **Label** | `text-[11px] font-medium uppercase tracking-wider` | 11px | 500 | Section labels, badge text |
| **Micro** | `text-[10px] text-zinc-600` | 10px | 400 | Timestamps, meta info |

### Typography Rules

- **Never use UPPERCASE italic together** — choose one or the other. UPPERCASE is reserved for `LABEL` role only (badges, section tags, stat labels).
- **Tracking:** Use `tracking-tight` for large headings. `tracking-wider` for small uppercase labels only.
- **Line height:** `leading-snug` (1.375) for headings. `leading-relaxed` (1.625) for body text.
- **Color:** Use `text-white` only for headings and active/selected states. Body copy uses `text-zinc-400`. Never use pure black text on dark backgrounds.

---

## Spacing & Layout

### Grid System

All pages use an 8-column conceptual grid within a `max-w-6xl mx-auto px-6` container.

```
Content width: 1152px (max-w-6xl = 72rem)
Horizontal padding: 24px each side (px-6)
Column gap: 16px (gap-4) for tight grids, 24px (gap-6) for standard
```

### Vertical Rhythm

| Context | Class | Value |
|---|---|---|
| Section spacing | `py-24` | 96px top + bottom |
| Section spacing (compact) | `py-16` | 64px top + bottom |
| Card internal padding | `p-6` or `p-7` | 24–28px |
| Card internal padding (dense) | `p-4` or `p-5` | 16–20px |
| Component gap | `gap-4` or `gap-5` | 16–20px |
| List item gap | `gap-3` | 12px |
| Inline element gap | `gap-2` or `gap-2.5` | 8–10px |

### Border Radius Scale

| Context | Class | Value |
|---|---|---|
| Large cards, sections | `rounded-3xl` | 24px |
| Standard cards | `rounded-2xl` | 16px |
| Buttons, badges, inputs | `rounded-xl` | 12px |
| Small badges, tags | `rounded-md` | 6px |
| Dots, indicators | `rounded-full` | 50% |

---

## Component Patterns

### Card (Standard)

```jsx
<div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6
                hover:border-white/[0.14] transition-colors">
  {/* content */}
</div>
```

**Variants:**
- **With gold top accent line:** Add `relative overflow-hidden` + an `<div>` with `absolute top-0 inset-x-0 h-px` and gradient background
- **With hover lift:** Wrap in `<motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>`
- **Active/selected:** Replace border with `border-[#f5a623]/25 bg-[#f5a623]/[0.02]`

### Button — Primary (CTA)

```jsx
<button className="flex items-center gap-2 px-6 py-3 rounded-xl
                   bg-[#f5a623] text-black text-[14px] font-semibold
                   hover:bg-[#e09520] transition-colors
                   shadow-lg shadow-[#f5a623]/10">
  Label <ArrowRight size={16} />
</button>
```

### Button — Secondary (Outline)

```jsx
<button className="flex items-center gap-2 px-6 py-3 rounded-xl
                   border border-white/[0.10] text-zinc-300 text-[14px] font-medium
                   hover:border-white/[0.18] hover:text-white transition-colors">
  Label
</button>
```

### Badge — Category

```jsx
<span className="inline-flex items-center text-[10px] font-medium
                 px-2 py-0.5 rounded-md border
                 text-pink-400 bg-pink-500/[0.08] border-pink-500/20">
  Đám cưới
</span>
```

### Badge — Score

```jsx
// scoreColor(s) returns the right class set based on score value
<span className={`inline-flex items-center gap-1 text-[10px] font-semibold
                  px-2 py-0.5 rounded-md border ${scoreColor(overall)}`}>
  <Star size={8} strokeWidth={2.5} /> {overall}đ
</span>
```

### Stat Card (Dashboard)

```jsx
<div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
  <div className="flex items-center gap-3 mb-4">
    <div className="w-9 h-9 rounded-xl bg-[#f5a623]/[0.08] border border-[#f5a623]/15
                    flex items-center justify-center text-[#f5a623]">
      <Icon size={16} />
    </div>
    <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
      Label
    </p>
  </div>
  <p className="text-4xl font-bold text-white">42</p>
  <p className="text-[12px] text-zinc-600 mt-1">Sub-label</p>
</div>
```

### Section Label (Badge above heading)

```jsx
<span className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                 border border-[#f5a623]/20 bg-[#f5a623]/[0.05]
                 text-[#f5a623] text-[11px] font-semibold uppercase tracking-widest mb-5">
  <Icon size={10} /> Section Title
</span>
```

### Input / Search Bar

```jsx
<div className="relative">
  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
    <Search size={15} className="text-zinc-600" />
  </div>
  <input
    className="w-full bg-[#111113] border border-white/[0.08] rounded-xl
               pl-[44px] pr-4 py-2.5 text-[14px] text-white placeholder-zinc-600
               focus:outline-none focus:border-white/[0.18] transition-colors"
    placeholder="Tìm kiếm..."
  />
</div>
```

### Tab Navigation (Underline style)

```jsx
<div className="flex gap-1 border-b border-white/[0.06]">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`px-4 py-3 text-[13px] font-medium transition-colors relative ${
        activeTab === tab.id
          ? 'text-white'
          : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {tab.label}
      {activeTab === tab.id && (
        <motion.div
          layoutId="tab-underline"
          className="absolute bottom-0 inset-x-0 h-[2px] bg-[#f5a623]"
        />
      )}
    </button>
  ))}
</div>
```

---

## Animation System

All animations use three standardized presets. Do **not** invent new animation patterns — add only if genuinely needed and document here.

### Preset 1 — Fade Up (page entry, section reveal)

```jsx
const fadeUp = {
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

// With stagger for lists:
const stagger = (i) => ({
  ...fadeUp,
  transition: { ...fadeUp.transition, delay: i * 0.09 },
});
```

**When to use:** Page hero section, stat card lists, section headings on scroll entry.

### Preset 2 — Fade In (modals, overlays, tooltips)

```jsx
const fadeIn = {
  initial:    { opacity: 0 },
  animate:    { opacity: 1 },
  transition: { duration: 0.3 },
};
```

**When to use:** Modal backdrops, tooltip appearance, tab content swap.

### Preset 3 — Hover Lift (interactive cards)

```jsx
const hoverLift = {
  whileHover:  { y: -4 },
  transition:  { duration: 0.2 },
};
```

**When to use:** Feature cards, testimonial cards, MC carousel cards.

### Scroll-triggered animations (whileInView)

For sections below the fold. Always use `viewport={{ once: true }}` to prevent re-triggering.

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
>
  {/* content */}
</motion.div>
```

### AnimatePresence (conditional elements)

For accordion open/close, tab switching, modal mount/unmount.

```jsx
<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div
      key="content"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    />
  )}
</AnimatePresence>
```

### Rules

- **No** `scale` animations on hover — lift (`y: -4`) only
- **No** rotate or spin on interactive elements
- **No** multiple simultaneous animations on the same element
- **No** `duration` > 0.6s for micro-interactions
- Background blurs: maximum one `blur-[80px]` gold glow per section (Hero only)

---

## Icon Usage

All icons use **Lucide React** (`lucide-react`). Icon sizes follow a strict 3-tier system:

| Size | `size` prop | Usage |
|---|---|---|
| **Large** | `size={22}` | CTA button icons, empty state icons |
| **Medium** | `size={16}` | Card action icons, section icons |
| **Small** | `size={12}` or `size={13}` | Badge icons, inline text icons, meta info |
| **Micro** | `size={10}` or `size={11}` | Within small badges, score indicators |

Icon containers (rounded squares used for stat icons, feature icons):

```jsx
// Gold variant — for primary metrics, CTAs
<div className="w-9 h-9 rounded-xl bg-[#f5a623]/[0.08] border border-[#f5a623]/15
                flex items-center justify-center text-[#f5a623]">
  <Mic size={16} />
</div>

// Neutral variant — for secondary features
<div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07]
                flex items-center justify-center text-zinc-400">
  <BookOpen size={16} />
</div>
```

---

## Accessibility

### Color Contrast

- All text on `--bg-base` (#09090b): `--text-primary` (#fafafa) achieves **21:1** contrast ratio (AAA).
- `--text-secondary` (#a1a1aa) on `--bg-base`: **7.2:1** (AA Large passes, AA regular passes for ≥18px).
- `--text-muted` (#52525b): **4.7:1** — use only for non-essential decorative text (timestamps, hints), never for required information.
- Gold (`#f5a623`) on `--bg-base`: **8.9:1** (AAA). Safe for all text sizes.

### Focus States

All interactive elements must have a visible focus ring:

```css
/* Applied globally in index.css */
:focus-visible {
  outline: 2px solid #f5a623;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Motion

Users who prefer reduced motion should not see animations:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## What NOT to Do

| Pattern | Why it's wrong | Correct alternative |
|---|---|---|
| `blur-[120px]` on multiple elements | Destroys GPU performance on low-end devices | One `blur-[80px]` in Hero only |
| Gold text on gold background | Zero contrast | Use `text-black` on gold backgrounds |
| `text-yellow-*` for gold | Wrong shade — too saturated | Always use `text-[#f5a623]` |
| Uppercase + italic together | Aggressive, hard to read | Choose one: UPPERCASE label OR italic quote |
| `scale(1.05)` on card hover | Causes layout shift | Use `y: -4` (lift) only |
| Inline `style={{ color: ... }}` | Bypasses design system | Use Tailwind color classes or CSS vars |
| `border-white/50` or higher | Too bright, breaks dark aesthetic | Max `border-white/[0.20]` for interactive |
