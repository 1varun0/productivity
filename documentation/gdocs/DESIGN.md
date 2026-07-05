# DESIGN.md — Visual Identity & Design System

> Design tokens and visual patterns for the Peak Hub productivity app.
> Sourced from `src/index.css`, `src/types/profile.ts`, and `src/features/timetable/types.ts`.

---

## 1. Design Philosophy

Dark-mode-first, celestial-inspired aesthetic. Priorities:
- Near-black backgrounds with subtle luminance separation
- Glassmorphism on modals/overlays (backdrop-blur, semi-transparent BGs)
- Minimal chrome — borders near-invisible, using opacity + gradients
- Premium shadows with inset light edges (beveled surfaces)
- Micro-animations via Framer Motion and CSS keyframes
- Celestial metaphors in Focus Chamber (orbital systems, star fields, pulsing orbs)

---

## 2. Color Palette

### 2.1 Semantic Tokens (`:root` in `src/index.css`)

| Token | Hex | Usage |
|---|---|---|
| `--background` | `#050505` | App background |
| `--foreground` | `#fcfcfc` | Primary text |
| `--card` | `#131316` | Card/panel backgrounds |
| `--card-foreground` | `#fcfcfc` | Text on cards |
| `--popover` | `#18181b` | Popover/dropdown BG |
| `--primary` | `#fcfcfc` | Primary action (overridden by accent) |
| `--primary-foreground` | `#0d0d0f` | Text on primary |
| `--secondary` | `#1a1a1e` | Secondary surface |
| `--muted` | `#1e1e24` | Muted/disabled BG |
| `--muted-foreground` | `#8a8a93` | Subdued text, labels |
| `--accent` | `#1e1e22` | Accent surface (hover) |
| `--destructive` | `#ff453a` | Destructive/error |
| `--border` | `#222228` | Borders, dividers |
| `--input` | `#222228` | Input borders |
| `--ring` | `#fcfcfc` | Focus ring |

### 2.2 User-Selectable Accent Colors

| Label | Hex | Context |
|---|---|---|
| White | `#FFFFFF` | Default monochrome |
| Purple | `#534AB7` | Default for projects |
| Blue | `#185FA5` | "Work" category |
| Green | `#0F6E56` | "Health" category |
| Amber | `#BA7517` | "Meals" category |
| Pink | `#993556` | "Personal" category |
| Red | `#D85A30` | Error, deadlines |

### 2.3 Timetable Block Colors

| Name | Hex | Usage |
|---|---|---|
| primary | `#c5c0ff` | Default block accent (lavender) |
| secondary | `#a4c9ff` | Study/class |
| tertiary | `#84d6b9` | Health/exercise |
| error | `#ffb4ab` | Overdue/missed |
| outline | `#928f9e` | Neutral text |
| sky | `#a3c8ff` | Alternate blue |
| neutral | `#353534` | Empty/free-time |

### 2.4 Timetable Category Colors (border / bg / text)

| Category | Border | BG | Text |
|---|---|---|---|
| sleep | `#4A4A6A` | `#0d0d18` | `#9090B0` |
| class | `#534AB7` | `#1a1730` | `#AFA9EC` |
| work | `#185FA5` | `#0d1a26` | `#85B7EB` |
| health | `#0F6E56` | `#0e1f18` | `#5DCAA5` |
| meals | `#BA7517` | `#1f1708` | `#EF9F27` |
| personal | `#993556` | `#1a1015` | `#ED93B1` |
| commute | `#7A4010` | `#1a1008` | `#C47A3A` |
| free | `#3A3A3A` | `#161616` | `#666666` |

---

## 3. Typography

### 3.1 Font Families

| Usage | Family | Weights |
|---|---|---|
| Body/UI | `Inter`, system-ui fallback | 400, 500, 600, 700 |
| Monospace | `JetBrains Mono` | 400 |
| Icons | `Material Symbols Outlined` | Variable |

### 3.2 Type Scale

| Element | Size | Weight | Tracking | Transform |
|---|---|---|---|---|
| Page title (h1) | 24px | 500 | tight | — |
| Section header (h2) | 18px | 500 | tight | — |
| Body text | 14px | 400 | normal | — |
| Label/caption | 11px | 600 | `0.2em` | uppercase |
| Small label | 10px | 600 | `0.15em` | uppercase |
| Button text | 12–13px | 500–600 | tight | — |
| Sidebar nav | 14px | 500 | tight | — |

---

## 4. Spacing, Radii, Shadows

### Border Radius
| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `0.25rem` | Chips, badges |
| `--radius-md` | `0.5rem` | Buttons, inputs |
| `--radius-lg` | `0.75rem` | Cards, panels |
| `--radius-xl` | `1rem` | Modals, overlays |
| `rounded-full` | `9999px` | Avatars, swatches |

### Shadows
```css
--shadow-premium:       0 4px 24px -8px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.05);
--shadow-premium-hover: 0 8px 32px -8px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.1);
--shadow-inset-edge:    inset 0 1px 0 0 rgba(255,255,255,0.04), inset 0 0 0 1px rgba(255,255,255,0.02);
```

Modal: `0 32px 64px -12px rgba(0,0,0,0.8)`
Dropdown: `0 16px 32px -8px rgba(0,0,0,0.8)`

---

## 5. Glassmorphism

| Element | BG | Backdrop | Border |
|---|---|---|---|
| Settings modal | `#0a0a0a/95` | `blur(40px)` | `white/5` + ring |
| Dropdown | `#0a0a0a/95` | `blur(24px)` | `white/5` |
| Overlay backdrop | `background/90` | `blur(12px)` | — |

---

## 6. Animations

### Framer Motion
| Pattern | Duration | Easing |
|---|---|---|
| Page enter | 1.2s | `[0.16, 1, 0.3, 1]` |
| Modal enter | spring | stiffness:300, damping:25 |
| Focus transition | 1.5s | easeInOut |
| Dropdown | 0.2s | easeOut |

### CSS Keyframes (in `@theme`)
| Name | Duration | Purpose |
|---|---|---|
| `sunPulse` | 8s | Focus Orb glow |
| `opacityBreathing` | 8s | Text breathing |
| `orbit` | 120–400s | Orbital rings (5 speeds) |
| `twinkle` | 6s | Star opacity |

All celestial animations respect `prefers-reduced-motion: reduce`.

---

## 7. Component States

| State | Visual Treatment |
|---|---|
| Default | `text-muted-foreground`, transparent border |
| Hover | `bg-white/5`, `text-foreground` |
| Active | `bg-card`, `shadow-inset-edge`, `border-border/40` |
| Focus | `border-ring`, `ring-1 ring-ring` |
| Disabled | `opacity-50`, `cursor-not-allowed` |
| Loading | Spinning border-ring (`animate-spin`) |

---

## 8. Scrollbars

Webkit: 6px thin, `rgba(255,255,255,0.03)` thumb, transparent track.
Firefox: `scrollbar-width: thin`.

## 9. Layout

- Sidebar: `w-64` (256px), `hidden md:flex`
- Responsive: `md:768px`, `lg:1024px`
- Compact mode: `body.compact` reduces padding on task/nav/time/habit rows
