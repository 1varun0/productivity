# Focus Mode — Feature Discovery Report

> **Audience:** Marketing, Product Design, and Growth teams
> **Last Updated:** July 2026
> **Feature Status:** Shipped & Live

---

## 1. WHAT IS THIS FEATURE — ONE LINE

**Focus Mode transforms your screen into a cinematic, distraction-free space environment where a glowing orb counts down your session while everything else disappears.**

---

## 2. THE PROBLEM IT SOLVES

### The frustration it eliminates
Every productivity app gives you a timer. But a timer sitting next to your task list, notifications, and a dozen open tabs is like trying to meditate in a shopping mall. Users don't just need to *track* focus time — they need to *feel* focused. The visual clutter of a regular interface undermines the very thing you're trying to achieve.

### What the user was doing before
Before Focus Mode, users would:
- Set a generic Pomodoro timer in another tab or app, constantly tab-switching to check time
- Lose important ideas that popped up mid-session because writing them down meant leaving their flow
- Have no way to adjust a session on the fly — if 25 minutes wasn't enough, they'd start a new timer
- Get no sense of ritual or transition between "working" and "deeply working"
- Close the browser mid-session and lose all progress and context

### Why it matters
Deep work isn't just about blocking time — it's about entering a *state*. Focus Mode is designed to feel like stepping into a different room. The environment itself signals to your brain: "We are doing one thing right now." That psychological shift is the real product.

---

## 3. EVERY CAPABILITY — COMPLETE LIST

### Getting Started
- **Users can choose any incomplete task to focus on** — so every session is anchored to real, meaningful work.
- **Users can start a "Deep Thinking" session without a task** — for when the work is reflection, brainstorming, or processing, not a checklist item.
- **Users can pick from preset durations (15, 25, 45, 60, or 90 minutes)** — covering everything from a quick sprint to an extended deep work block.
- **Users can type in any custom duration** — because real work doesn't fit neatly into round numbers.
- **Users can launch a session with just the Enter key** — no unnecessary clicking; one keystroke starts the clock.

### The Focus Chamber (Active Session)
- **Users are immersed in a full-screen space environment with 700 twinkling stars** — the entire app UI vanishes and is replaced by a dark, ambient cosmos that naturally calms the mind.
- **Users see their remaining time displayed inside a glowing orb at the center of the screen** — the timer becomes a living, breathing element, not a static number.
- **Users can pause and resume the timer by clicking the orb or pressing Space** — the most natural interaction possible, no hunting for buttons.
- **Users see the orb gently pulse when the timer is running** — a subtle heartbeat that confirms your session is alive without demanding attention.
- **Users see the orb's glow shift and respond to cursor movement** — the interface feels alive and reactive, like it's aware of your presence.

### Orbital System (Focus Modes)
- **Users can switch between 5 distinct focus modes by clicking orbiting planets** — Quick Task, Creative Flow, Deep Work, Expansion, and Reflection, each with its own visual atmosphere.
- **Users see planets that gravitationally react to their cursor** — planets are pulled toward your mouse when it gets close, creating a tactile, physical feel.
- **Each focus mode changes the ambient lighting, orbital speed, and glow intensity** — the environment adapts to match the *type* of work, not just the duration.
- **The planets orbit the central timer at different speeds and distances** — creating a living solar system that makes the interface feel cinematic.

### Time Controls ("Temporal Anchors")
- **Users can add time to a running session (+1, +5, +10 minutes, or custom)** — because flow states don't respect timers; when you're in the zone, you extend.
- **Users can subtract time from a running session (−1, −5, −10 minutes, or custom)** — for when a session needs to be shortened without fully abandoning it.
- **Time control buttons float near the orb and drift with subtle animations** — they feel like celestial objects, not toolbar buttons.
- **Time controls only appear when the cursor approaches them** — a proximity-based luminosity system keeps the interface minimal until you need it.
- **Users can type a custom number of minutes to add or subtract** — complete flexibility, confirmed with Enter, cancelled with Escape.

### Thought Parking (Capture Without Losing Focus)
- **Users can capture a fleeting thought mid-session without leaving focus mode** — type it, hit Enter, it's saved. Your flow stays intact.
- **Captured thoughts are saved to the Mental Inbox as real items** — they're not throwaway notes; they become actionable entries linked to the session.
- **Captured thoughts can be optionally linked to the active task** — so context travels with the thought.
- **A "Session Thoughts" list appears on the left panel showing all captures from the current session** — a running record of every idea that surfaced during deep work.
- **A particle animation fires toward the center orb when a thought is saved** — a micro-reward that confirms the capture without a loud notification.
- **Users can trigger thought parking globally with ⌘⇧P (Ctrl+Shift+P)** — accessible from anywhere inside the focus chamber.

### Contextual Side Panels
- **Users can view the current task's title, description, and priority by moving their cursor to the left edge** — context is always one gesture away, never cluttering the main view.
- **Users can view and open task attachments (images, PDFs, links, files) from the right panel** — reference materials are accessible without leaving the session.
- **Users can click images to open them in a full-screen lightbox** — for reviewing visual references in detail.
- **Panels appear and disappear based on cursor proximity with a 250px detection zone** — they slide in smoothly and fade out when you move away, so they're never in the way.
- **Both panels use glassmorphism with backdrop blur** — maintaining the immersive atmosphere even when showing information.

### Nexus Knowledge Base Overlay
- **Users can open their full Nexus knowledge base inside focus mode by pressing N** — access notes, documents, and references without ending the session.
- **The overlay shows a floating timer pill at the top** — so you never lose awareness of how much time remains, even while reading notes.
- **Users can close the overlay with Escape or N** — seamless toggling that respects your workflow.

### Session Completion & Exit
- **Users can end a session early via Escape, the stop button, or hold-to-end on the orb** — multiple intuitive paths, never trapped.
- **Hold-to-end triggers a "ritual" animation: the orb shrinks, destabilizes, and collapses** — ending a session feels deliberate and significant, not accidental.
- **The confirmation panel lets users mark the task as complete** — one-step task completion at the moment it matters most.
- **Users can choose to append all captured thoughts to today's Nexus journal** — session insights flow into your daily record automatically.
- **The session is saved to the database with full metadata** — duration, task, completion state, start/end timestamps, and thought count are all recorded.
- **Sessions that were interrupted vs. completed are tracked separately** — honest data about how you actually work.

### Session Recovery
- **If the user closes the browser or navigates away during a session, it's automatically recovered on return** — no lost sessions, ever.
- **A recovery banner shows the remaining time and lets users resume or end the session** — one click to pick up exactly where you left off.
- **Sessions that expired while the app was closed are automatically moved to "reflection" state** — nothing falls through the cracks.
- **All session state is persisted to localStorage** — the session survives page refreshes, browser restarts, and accidental tab closures.

### Deep Work Stats
- **Users see their total focused minutes for the day** — a running tally that builds motivation.
- **Users see how many sessions they've completed today** — gamified progress without being obnoxious.
- **Users can track their streak of consecutive focus days** — a quiet incentive to show up daily.

### Keyboard-First Design
- **Space** pauses or resumes the timer.
- **Escape** ends the session (with confirmation).
- **Enter** starts a session from setup, or confirms session end.
- **N** toggles the Nexus knowledge base overlay.
- **⌘⇧P / Ctrl+Shift+P** opens thought parking from anywhere.
- **Number keys + Enter** set custom time adjustments on temporal anchors.

---

## 4. WHAT MAKES IT UNIQUE

### vs. Notion
Notion has no focus mode at all. You're always staring at your entire workspace. There's no concept of "entering" a focused state.

### vs. Todoist
Todoist recently added a focus mode, but it's a stripped-down timer overlay on top of the same task list. There's no environmental change, no thought capture, no session persistence.

### vs. Linear
Linear is built for teams, not personal deep work. There's no timer, no immersive mode, and no concept of individual focus sessions.

### vs. Obsidian
Obsidian's focus mode just hides the sidebar. It's a UI toggle, not an experience. No timer, no ambient environment, no thought parking.

### vs. Forest / generic Pomodoro apps
These give you a timer and nothing else. No task linkage, no thought capture, no knowledge base access, no session analytics, no recovery if you close the app.

### The single most impressive thing
**The entire interface is a living solar system.** The timer is a glowing orb at the center. Focus modes are orbiting planets you can click. Time controls are celestial nodes that respond to cursor proximity. Thoughts you capture launch as particles toward the center. It's not a productivity tool with a pretty skin — the *metaphor itself is the interface*. Nothing else in the market does this.

---

## 5. THE BEST HEADLINE FOR THIS FEATURE

1. **Your screen becomes a universe. Your task becomes the sun.**
2. **Focus isn't a timer. It's a place.**
3. **Step into the chamber. Leave distractions in orbit.**
4. **One task. One orb. Zero distractions.**
5. **The most beautiful way to do deep work.**

---

## 6. THE BEST SUBTEXT FOR THIS FEATURE

**Option A:**
Focus Mode replaces your entire screen with an immersive space environment built around a single countdown. Pick a task, set your time, and watch everything else disappear — your ideas are captured, your progress is tracked, and your flow stays unbroken.

**Option B:**
Enter a cinematic focus chamber where your timer lives inside a glowing orb, orbiting planets let you shift focus modes, and fleeting thoughts are captured without breaking your flow. It's deep work, designed like a ritual.

**Option C:**
Most apps give you a timer. We give you a world. Focus Mode transforms your workspace into a living cosmos where your task is the only thing that exists. Capture ideas mid-session, access your notes without leaving, and build a daily focus streak — all inside an interface that makes concentration feel effortless.

---

## 7. THREE THINGS TO SHOW IN A SCREENSHOT OR DEMO

### Screenshot 1: "The Chamber"
Show the full-screen focus environment at its most cinematic moment: the dark space background filled with twinkling stars, the glowing cyan orb in the center displaying "23:47", orbiting planets visible at varying distances, and the control dock faintly visible below the orb. No sidebar, no taskbar, no browser chrome — pure immersion. **This is the hero image.**

### Screenshot 2: "Thought Capture in Action"
Show the left contextual panel slid into view with the task title "Redesign Landing Page" at the top, two captured session thoughts listed below ("Try the gradient approach from Stripe" and "Ask Sarah about the illustration budget"), and the "Capture a thought..." input field at the bottom with a cursor blinking. The right side still shows the orb and stars. **This shows the product is smart, not just pretty.**

### Screenshot 3: "Temporal Controls Expanded"
Show the orb with the "+" temporal anchor clicked, revealing the floating constellation of time presets (1m, 5m, 10m, custom) drifting near the orb with subtle animations. The custom input mode should be active, showing "+12 min" being typed. **This is the "power user" moment that makes people lean forward.**

---

## 8. WHO WILL LOVE THIS FEATURE MOST

### 🎯 Primary: Solo knowledge workers & indie developers
People who spend 4–8 hours a day writing, coding, designing, or thinking. They've tried Pomodoro apps, website blockers, and "do not disturb" modes — and none of them change how the work *feels*. Focus Mode gives them an actual environment shift.

**Their use case:** "I need to write the technical spec for this feature. I'm going to enter a 45-minute Deep Work session, capture stray ideas as they surface, and not touch Slack until the orb hits zero."

### 🎨 Secondary: Students & researchers
People doing sustained reading, writing, or studying. The ability to capture thoughts mid-session (without opening another app) and have them auto-appended to a daily journal is uniquely powerful for academic work.

**Their use case:** "I'm reading through 30 pages of research papers. Every time I have an insight, I park the thought — and at the end, all of it flows into my daily Nexus note."

### 🧘 Tertiary: Mindful productivity enthusiasts
People who care about *how* they work, not just *how much* they work. The ritual of entering the chamber, the deliberate hold-to-end mechanic, the cinematic exit — these resonate with users who treat focus as a practice, not just a habit.

**Their use case:** "I start every morning with a 15-minute Reflection session — no task, just thinking. The calm environment helps me set my intention for the day."

---

## 9. POWER USER MOMENTS

- **Proximity-based luminosity:** Controls are nearly invisible until your cursor approaches them, then they glow into existence. This isn't just aesthetics — it means the interface is *genuinely empty* during focus, yet fully controllable when needed. A power user notices this and thinks: "They actually thought about visual noise."

- **The hold-to-end ritual:** You can't accidentally end a session. You have to hold the orb for 1.5 seconds, watching it shrink and destabilize with a plasma-fill animation. When you commit to ending, it feels like detonating a star. This is premium interaction design.

- **Session recovery across browser restarts:** A user who closes Chrome mid-session and returns 10 minutes later to find their session waiting with accurate time is genuinely delighted. The state is persisted to localStorage with surgical precision — even pause duration is recalculated.

- **Temporal anchors with custom keyboard input:** Instead of a modal or dropdown, you click "+" near the orb, see tiny preset labels float into view like a constellation, and if none fit, you type a number directly into a floating capsule and press Enter. It's a text editor's precision applied to time controls.

- **Captured thoughts auto-append to today's journal:** At session end, the user sees a checkbox: "Append captures to today's Journal." Toggle it, and every parked thought from the session flows into their Nexus daily note under a focus session header. Zero manual copy-paste.

- **The orb responds to your mouse position:** The glow layer inside the orb shifts its radial gradient center and intensity based on your cursor coordinates. It's not a static animation — it's a living, reactive light source. Most users won't consciously notice, but they'll *feel* that the interface is alive.

- **Pause recalculates the end time, not the duration:** When you pause, the system records *when* you paused. When you resume, it adds the paused duration to the end timestamp. This means pausing for 5 minutes genuinely gives you 5 minutes back — no timer drift.

---

## 10. FEATURE STATS & FACTS

| Stat | Detail |
|------|--------|
| **Focus modes available** | 5 (Quick Task, Creative Flow, Deep Work, Expansion, Reflection) |
| **Preset durations** | 15, 25, 45, 60, 90 minutes + unlimited custom input |
| **Stars in the background** | 700 individually animated, twinkling stars |
| **Orbital layers** | 5 concentric orbits with independently rotating planets |
| **Time adjustment presets** | ±1, ±5, ±10 minutes, plus custom minute entry |
| **Panels** | 2 contextual side panels (left: task + thoughts, right: nexus + attachments) |
| **Keyboard shortcuts** | 6 dedicated shortcuts for full keyboard-only operation |
| **Session data tracked** | Duration, task, intention, completion state, thought count, start/end timestamps |
| **Attachment types supported** | Images, PDFs, links, generic files — all viewable in-session |
| **Session persistence** | Full state survives page refresh, tab close, and browser restart |
| **Animations running simultaneously** | Star twinkle (700), orbital rotation (5), orb pulse (1), planet gravity (5), temporal anchor drift (3), glow reactivity (real-time) |
| **Proximity detection range** | 250px for side panels, 150px for planet gravity, 180–280px for control luminosity |
| **Hold-to-end duration** | 1.5 seconds to trigger the exit ritual |
| **Session recovery** | Automatic — detects active sessions on app load and offers resume |
| **Journal integration** | Optional one-click append of all session thoughts to daily Nexus note |

---

*This document was generated from a complete source code review of the Focus Mode feature — covering 20+ component files, 2 custom hooks, 3 theme modules, and 1 global state store across ~2,500 lines of production code.*
