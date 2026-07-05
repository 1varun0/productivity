# Timetable — Feature Discovery Report

> **Audience:** Marketing, Product Design, and Growth teams
> **Last Updated:** July 2026
> **Feature Status:** Shipped & Live

---

## 1. WHAT IS THIS FEATURE — ONE LINE

**A visual, drag-and-drop weekly planner that merges your task list and habits directly into a 24-hour time-blocked schedule.**

---

## 2. THE PROBLEM IT SOLVES

### The frustration it eliminates
Task lists tell you *what* to do, but they don't tell you *when* you actually have the time to do it. Google Calendar is great for meetings, but terrible for deep work planning because it's completely disconnected from your to-do app. Time-blocking is the most effective productivity method, but doing it manually by copying tasks into a calendar is tedious and frustrating.

### What the user was doing before
Before the Timetable feature, users would:
- Keep a task list open on one monitor and Google Calendar on the other.
- Manually create calendar events like "Work on Project X" to block out time.
- Get overwhelmed because their to-do list exceeded the actual hours available in the day.
- Use spreadsheets to plan out weekly routines (like classes or gym time).

### Why it matters
This feature bridges the gap between intention and reality. By allowing users to drag tasks directly onto a visual timeline, it forces realistic planning. It turns a theoretical, overwhelming to-do list into a concrete, achievable weekly schedule. 

---

## 3. EVERY CAPABILITY — COMPLETE LIST

### Grid & Navigation
- **Users can view a full 7-day, 24-hour weekly grid** — providing a complete picture of the week from Monday to Sunday.
- **Users can navigate between weeks seamlessly** — using quick arrow buttons to plan ahead or review past weeks.
- **Users can jump back to the current day** — with a dedicated "TODAY" button that appears whenever they navigate away from the current week.
- **Users can toggle "Compact View"** — shrinking the grid columns to fit more of the week on smaller laptop screens without horizontal scrolling.
- **Users can see exactly where they are right now** — a "Now Indicator" line automatically scrolls into view and tracks the current time across the grid.
- **Users can see an aggregated week summary** — a footer automatically calculates and displays the total hours allocated to each category (e.g., Work, Health, Study) for the entire week.

### Time Blocking & Scheduling
- **Users can create time blocks by clicking any empty slot** — easily title it, choose a duration, and assign a category.
- **Users can color-code blocks using 8 distinct categories** — (Sleep, Class, Work, Health, Meals, Personal, Commute, Free) with beautifully curated dark-mode compatible palettes.
- **Users are protected from scheduling conflicts** — the system detects overlapping blocks and prevents accidental double-booking.
- **Users can copy a block to multiple days** — right-click a block and choose the exact days to duplicate it (perfect for repeating routines like "Morning Gym").
- **Users can edit or delete existing blocks** — click to open a modal with full block details, or hit delete.

### Seamless Integration (The Tray)
- **Users can drag tasks directly onto the schedule** — a collapsible "Premade Blocks Tray" at the bottom shows all incomplete tasks.
- **Users can drag habits directly onto the schedule** — habits also appear in the tray, allowing users to schedule exactly *when* they will do them.
- **Users can filter the tray** — a fast search input instantly filters the tasks and habits list so users can find what they want to schedule without scrolling.

### Deadlines & Markers
- **Users can add global deadlines directly to the timetable** — click "+ Deadline" to pin important due dates to the top of the grid.
- **Users can see task deadlines as visual markers** — tasks with due dates automatically place a visual indicator on the corresponding day in the timetable.
- **Users can hover over markers to see details** — a clean tooltip reveals exactly what is due on that day.

### Power & Export
- **Users can export the entire timetable as an image** — one click generates a high-resolution PNG of the schedule to print or use as a desktop background.
- **Users can "Undo" mistakes with standard keyboard shortcuts** — pressing `Ctrl+Z` (or `Cmd+Z`) instantly undoes accidental block deletions or moves.
- **Users can save manually or trust auto-save** — a status icon shows exactly when the schedule was last saved to the cloud.

---

## 4. WHAT MAKES IT UNIQUE

### vs. Notion
Notion's calendar views are clunky and don't support true drag-and-drop duration blocking natively on a 24-hour grid. This timetable feels like a native desktop app with fluid interactions, hover states, and conflict resolution.

### vs. Todoist / Linear
They don't have built-in time-blocking. They are pure task lists. You have to integrate them with Google Calendar, which is often a buggy, one-way sync. This timetable *owns* the data natively.

### vs. Google Calendar
Google Calendar is isolated from your actual work (tasks and habits). It also lacks the specific productivity categories (Sleep, Deep Work, Commute) and the weekly aggregation analytics (total hours spent on X).

### The single most impressive thing
**The "Premade Blocks Tray" combined with Global Undo.** Opening the bottom tray, filtering for a specific task, dragging it onto Tuesday at 2 PM, realizing you made a mistake, and just hitting `Ctrl+Z` to undo it. It brings the power of professional design tools (like Figma) into daily scheduling.

---

## 5. THE BEST HEADLINE FOR THIS FEATURE

1. **Stop making lists. Start blocking time.**
2. **Where your to-do list meets reality.**
3. **The ultimate canvas for your week.**
4. **Drag, drop, and conquer your schedule.**
5. **Plan your week down to the hour, effortlessly.**

---

## 6. THE BEST SUBTEXT FOR THIS FEATURE

**Option A:**
A to-do list without a schedule is just a wish list. Drag and drop your tasks and habits directly onto a beautifully designed 24-hour grid. Detect conflicts, track your time visually, and know exactly what you need to do and when.

**Option B:**
Take control of your time with a visual weekly planner built for deep work. Categorize your routines, drag tasks into open slots, and export your perfect schedule with a single click. 

**Option C:**
Merge your calendar and your task manager into one powerful view. Our Timetable feature lets you build your ideal week block by block. With built-in category analytics and global undo, time-blocking has never been this smooth.

---

## 7. THREE THINGS TO SHOW IN A SCREENSHOT OR DEMO

### Screenshot 1: "The Active Grid"
Show a richly populated Wednesday, Thursday, and Friday. Blocks should use various category colors (Deep blue for Work, Emerald for Health, Amber for Meals). The glowing red "Now Indicator" line should be cutting horizontally across the current time. **This showcases the beautiful, premium aesthetic of the grid.**

### Screenshot 2: "The Drag and Drop Workflow"
Show the bottom "Premade Blocks Tray" expanded. The cursor should be clicking and dragging a task (e.g., "Write Q3 Report") from the tray upwards onto an empty slot on Tuesday afternoon. **This demonstrates the core unique value proposition: seamless integration.**

### Screenshot 3: "The Week Summary Analytics"
Zoom in on the bottom footer section. Show the aggregated pills: "WORK: 24h", "HEALTH: 5h", "CLASS: 12h". Next to it, show the top header toolbar with the "Compact" toggle and the "Export PNG" button. **This highlights the data-driven and utility-focused nature of the tool.**

---

## 8. WHO WILL LOVE THIS FEATURE MOST

### 🎯 Primary: Students and Academics
People whose lives revolve around strict, repeating weekly schedules (classes, lectures, labs) mixed with flexible work (studying, writing papers). 

**Their use case:** "I use the copy-to-multiple-days feature to map out my entire semester's class schedule in 2 minutes. Then I drag my reading assignments from the bottom tray into the empty gaps between classes."

### 🎨 Secondary: Freelancers & Deep Workers
People who implement the "Time-boxing" method (championed by Cal Newport and Elon Musk). They need to ensure they are spending enough hours on high-value tasks.

**Their use case:** "I use the week summary footer to make sure I'm allocating exactly 20 hours to client work and 10 hours to personal projects. If the analytics show I'm over-indexing on admin work, I shift the blocks around."

---

## 9. POWER USER MOMENTS

- **Native Keyboard Undo (`Ctrl+Z`):** Building a complex web grid that natively supports global undo history is exceptionally rare. Power users will try it out of muscle memory and be delighted when it actually works.
- **The PNG Export:** The ability to render the entire complex DOM grid into a high-res image instantly, so you can set your schedule as your iPad lock screen or print it for your wall.
- **Smart Scroll on Load:** When you open the timetable, it doesn't just load at midnight. It automatically calculates the current time and scrolls the grid so the "Now Indicator" is perfectly positioned in the center of your screen.
- **Multi-Day Copying:** Right-clicking a "Gym" block and checking "Mon", "Wed", "Fri" to duplicate it across the week instantly, instead of creating three separate blocks manually.
- **Compact View Toggle:** A single button that shrinks the entire UI to accommodate 13-inch laptop screens without breaking the grid layout or requiring horizontal scrolling.

---

## 10. FEATURE STATS & FACTS

| Stat | Detail |
|------|--------|
| **Grid Resolution** | 24 hours x 7 days |
| **Category Colors** | 8 curated, semantic dark-mode palettes |
| **Conflict Detection** | Real-time (prevents dropping overlapping blocks) |
| **Integration Sources** | Pulls dynamically from Tasks and Habits |
| **Undo Stack** | Global keyboard listener (`Ctrl+Z` / `Cmd+Z`) |
| **Export Format** | High-resolution PNG via Canvas rendering |
| **Analytics Engine** | Real-time aggregation of hours per category |
| **Save Mechanism** | Manual sync + auto-dirty state tracking |

---

*This document was generated from a complete source code review of the Timetable feature — covering the grid renderer, drag-and-drop tray, week summary analytics, high-res export engine, and undo store logic.*
