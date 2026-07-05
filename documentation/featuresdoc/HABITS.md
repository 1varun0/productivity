# Habits — Feature Discovery Report

> **Audience:** Marketing, Product Design, and Growth teams
> **Last Updated:** July 2026
> **Feature Status:** Shipped & Live

---

## 1. WHAT IS THIS FEATURE — ONE LINE

**A beautiful, visual matrix that helps you track daily habits, build streaks, and visualize your consistency over time without leaving your workspace.**

---

## 2. THE PROBLEM IT SOLVES

### The frustration it eliminates
Most habit trackers are either overly complex databases (like Notion templates that require manual maintenance) or overly simplistic mobile apps that are completely disconnected from where you actually do your work. Users forget to track their habits because the tracker isn't where their tasks and projects are. Furthermore, a single missed day in strict trackers can feel deeply discouraging.

### What the user was doing before
Before the Habits feature, users would:
- Try to maintain complex Notion habit-tracking templates that eventually break.
- Use a completely separate mobile app (like Streaks or Habitica) that requires context switching.
- Use a physical notebook or calendar, which can't be easily modified or reordered.
- Give up on tracking altogether because it felt like too much friction to log a simple "yes".

### Why it matters
Consistency is the foundation of productivity. By embedding a zero-friction, highly visual habit tracker directly into the productivity suite, users can log their daily wins in the exact same place they manage their tasks. The visual matrix provides immediate positive reinforcement, turning the chore of tracking into a rewarding daily ritual.

---

## 3. EVERY CAPABILITY — COMPLETE LIST

### Habit Creation & Management
- **Users can create a new habit inline** — click "CAPTURE", type a name, and press Enter. It appears immediately.
- **Users can assign custom colors to habits** — using a native color picker to make each habit visually distinct.
- **Users can drag and drop to reorder habits** — seamlessly reorganize the list to match morning-to-evening routines.
- **Users can archive or delete habits** — remove habits that are no longer relevant to keep the matrix clean.
- **Users have a 7-second undo window when deleting** — a premium toast notification appears, allowing them to reverse accidental deletions before they are permanent.

### Daily Tracking (The Matrix)
- **Users can log a habit with a single click** — clicking a cell instantly fills it with the habit's color.
- **Users can un-log a habit with another click** — completely forgiving if they make a mistake.
- **Users can view an entire month at a glance** — a horizontal matrix shows every day of the month side-by-side.
- **Users can navigate between months** — simple left/right arrows to review past consistency or prepare for the next month.
- **Users can easily identify "Today"** — the current day is subtly highlighted with an ambient gradient so they never lose their place.
- **Users cannot log habits in the future** — future dates are visually dimmed and unclickable, preventing accidental logging.
- **Users can scroll horizontally with their mouse wheel** — smooth, native-feeling navigation across the monthly timeline.
- **Users see a crosshair hover effect** — hovering over any cell subtly highlights both the specific habit row and the date column, making it easy to track alignment on large screens.

### Streaks & Motivation
- **Users can see their live streak for every habit** — dynamically calculated and displayed next to the habit name.
- **Users earn a "fire" (🔥) emoji when a streak hits 3 days** — an automatic micro-reward for building early momentum.
- **Users can see their daily summary at a glance** — the header displays the total number of active habits and exactly how many were completed today.

---

## 4. WHAT MAKES IT UNIQUE

### vs. Notion
Notion habit trackers require setting up complex relation databases, rollups, and formulas. Every new month often requires duplicating a template. This feature requires zero setup, automatically handles month transitions, and calculates streaks natively.

### vs. Todoist
Todoist treats habits as recurring tasks. They clutter up your daily to-do list and don't provide a long-term visual matrix of your consistency. This feature separates habits from actionable tasks, giving them their own dedicated visual space.

### vs. Dedicated Habit Apps (Streaks, Habitica)
Those apps are great, but they are isolated. The uniqueness here is the **integration**. Your habits live right next to your project tasks, focus mode, and timetable.

### The single most impressive thing
**The frictionless, optimistic UI.** Everything happens instantly. When you click a cell, it fills immediately before the server even responds. When you reorder a habit, it snaps into place. When you delete one, it vanishes smoothly but gives you a 7-second floating undo button. It feels less like a web app and more like a fluid, native desktop application.

---

## 5. THE BEST HEADLINE FOR THIS FEATURE

1. **Build better habits, one click at a time.**
2. **Your daily routines, beautifully visualized.**
3. **Don't break the chain. Track habits right where you work.**
4. **The habit tracker that actually feels good to use.**
5. **Turn consistency into a visual masterpiece.**

---

## 6. THE BEST SUBTEXT FOR THIS FEATURE

**Option A:**
Stop juggling separate habit apps and complex templates. Track your daily routines, build streaks, and visualize your consistency over time with a beautiful matrix built right into your workspace.

**Option B:**
Consistency shouldn't feel like a chore. Log your daily wins with a single click, reorder your routines with drag-and-drop, and watch your progress light up the board. It's habit tracking, elevated.

**Option C:**
Keep your goals in sight. Our integrated habits matrix lets you track your daily routines right next to your tasks and projects. Earn streaks, review past months, and build the consistency you need to succeed.

---

## 7. THREE THINGS TO SHOW IN A SCREENSHOT OR DEMO

### Screenshot 1: "The Active Matrix"
Show a nearly complete month where several habits are being tracked. The matrix should be populated with different colors. The user's cursor is hovering over a specific cell, triggering the subtle crosshair highlight on the row and column. The "Today" column is highlighted. The header shows "5 habits · 4 completed today". **This shows the core value: a beautiful, scannable history of consistency.**

### Screenshot 2: "The Streak Reward"
Zoom in on the left side of the matrix showing the habit names. Show a habit like "Morning Workout" with a `12d 🔥` badge next to it, contrasting with a newly started habit that just says `1d`. **This highlights the built-in motivation mechanics.**

### Screenshot 3: "The Premium Undo"
Show the bottom right corner of the screen with the dark, glassmorphic "Habit deleted — Undo" toast notification floating above the interface. **This communicates that the app is highly polished, forgiving, and designed with premium UX in mind.**

---

## 8. WHO WILL LOVE THIS FEATURE MOST

### 🎯 Primary: The "Atomic Habits" Reader
Professionals, creatives, and students who understand that small daily actions compound over time. They don't want a complex system; they just want a simple, satisfying way to "not break the chain."

**Their use case:** "I want to make sure I read for 20 minutes, drink water, and write 500 words every single day. I just want to click a button and see my streak grow."

### 🎨 Secondary: Visual Thinkers
People who are motivated by seeing their progress visually rather than reading numbers or checking off standard lists. The GitHub-style contribution graph aesthetic appeals deeply to them.

**Their use case:** "Seeing a solid row of colored blocks gives me a huge sense of accomplishment. An empty block bothers me enough to make me actually go do the habit."

---

## 9. POWER USER MOMENTS

- **Zero-Latency Interactions:** Clicking a cell to complete a habit feels instantaneous. The app uses optimistic UI updates, so the color fills immediately while the database syncs quietly in the background.
- **The 7-Second Safety Net:** When you delete a habit, it disappears from the list immediately (no annoying "Are you sure?" modal blocking your flow), but a sleek toast notification gives you exactly 7 seconds to click "Undo" before the database actually deletes it. 
- **Ghost Dragging:** When dragging to reorder a habit, the standard bulky browser ghost image is replaced with a transparent image, making the drag-and-drop feel incredibly clean and custom.
- **Smart Auto-Scrolling:** If you open the habits page midway through the month, the matrix automatically and smoothly scrolls horizontally to perfectly center "Today" in your view.
- **Native Horizontal Scroll:** The developer explicitly added support to translate standard vertical mouse wheel scrolling into smooth horizontal scrolling for the matrix, making it effortless to navigate without grabbing a scrollbar.

---

## 10. FEATURE STATS & FACTS

| Stat | Detail |
|------|--------|
| **Habit Limit** | Unlimited |
| **Delete Grace Period** | 7 seconds (background timer) |
| **Streak Fire Threshold** | 3 consecutive days |
| **View Scope** | One full calendar month at a time |
| **Save Latency** | 0ms (Optimistic UI) |
| **Custom Colors** | Full HEX support via native picker |
| **Default Colors** | 5 curated presets auto-assigned |
| **Date Boundaries** | Impossible to log future dates |

---

*This document was generated from a complete source code review of the Habits feature — covering the matrix logic, drag-and-drop implementation, optimistic store updates, and visual components.*
