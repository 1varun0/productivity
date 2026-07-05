# Workspaces & Projects — Feature Discovery Report

> **Audience:** Marketing, Product Design, and Growth teams
> **Last Updated:** July 2026
> **Feature Status:** Shipped & Live

---

## 1. WHAT IS THIS FEATURE — ONE LINE

**Workspaces let you create shared projects where your team can manage tasks, write documents, chat in real time, and share files — all in one unified space.**

---

## 2. THE PROBLEM IT SOLVES

### The frustration it eliminates
Collaboration is currently scattered across five different apps. Tasks live in Todoist. Docs live in Google Docs. Chat lives in Slack. Files live in Google Drive. Project settings live in a spreadsheet. Switching between them burns time, drops context, and creates information silos. Users need *one room* for one project.

### What the user was doing before
Before Workspaces, users would:
- Duplicate task lists across personal and team tools, manually syncing status
- Send file attachments through chat apps where they get buried in conversation history
- Maintain separate document editors that aren't linked to the project's task list
- Lose track of who's working on what because presence is invisible
- Send invite links through email, with no way to control access levels

### Why it matters
The cost of context-switching isn't just time — it's cognitive load. Every tab switch is a micro-interruption. Workspaces solve this by putting every project artifact — tasks, docs, chat, and files — inside one view with one set of permissions. The project *becomes* the workspace.

---

## 3. EVERY CAPABILITY — COMPLETE LIST

### Project Creation & Setup
- **Users can create a new project in under 10 seconds** — name it, pick a color, pick an icon, and you're in.
- **Users can choose from 6 curated color themes** — every project gets its own visual identity in the sidebar.
- **Users can choose from 6 project icons (briefcase, rocket, star, globe, code, boxes)** — instantly recognizable at a glance.
- **Projects appear immediately in the sidebar after creation** — optimistic updates mean zero wait time.
- **Users can create the project by pressing Enter** — keyboard-first interaction, no unnecessary clicking.

### Real-Time Presence
- **Users can see who else is online in the project right now** — live avatar dots in the header showing who's actively viewing the same workspace.
- **Presence updates happen in real time via Supabase Realtime** — no polling, no refresh needed. When someone opens the project, they appear instantly.
- **Overlapping avatar stack shows up to 4 members with a "+N" overflow** — clean and compact, even for larger teams.
- **A "Just you" label appears when you're the only one online** — a simple, honest status that sets expectations.
- **Green dots indicate active online status** — the universal visual cue that someone is present.
- **Multi-tab presence is deduplicated** — if a member has the project open in 3 tabs, they only appear once.

### Team Invitations & Roles
- **Users can invite teammates by email** — type an email, pick a role, and an invitation is sent automatically.
- **Invitations are sent via email using a Supabase Edge Function** — recipients get a real email with a link to join.
- **Users can assign one of 3 roles to invitees: Owner, Member, or Viewer** — granular access control out of the box.
- **Owners can manage members, change roles, and remove people** — full administrative control without a separate admin panel.
- **Members can add tasks, write docs, send messages, and upload files** — the right level of contribution access.
- **Viewers can see everything but can't modify anything** — perfect for stakeholders, clients, or read-only collaborators.
- **Invite links expire after 7 days** — security-first approach to team access.
- **Duplicate invitations are caught and flagged** — no accidental double-sends.
- **Pending invitations are visible and revocable by the project owner** — full transparency over outstanding invites.
- **Recipients see a dedicated invite acceptance page** — a polished, branded page showing who invited them, to which project, and what role they'll have.
- **Users who are already members are gracefully redirected** — clicking an old invite link just takes you to the project.
- **After accepting, the project immediately appears in the sidebar** — no page refresh needed.
- **Users can view and respond to their pending invitations** — accept or decline right from the app, with the inviter's name and project details visible.

### Task Management (Tasks Tab)
- **Users can add tasks to a shared project board** — one input field, press Enter, task appears for everyone.
- **Tasks sync in real time across all members** — when one person adds or completes a task, every other member sees it instantly via Supabase Realtime.
- **Tasks are automatically organized into "In Progress" and "Completed" sections** — clean separation without manual sorting.
- **Users can assign tasks to any project member** — click the assignee and pick from a dropdown of all members.
- **Users can set due dates with a native date picker** — dates display as "Today", "Tomorrow", or "3 days overdue" for clarity.
- **Users can write rich task descriptions** — a full text area with auto-saving via debounced updates (500ms).
- **Users can mark tasks as high priority** — a red "HIGH" badge makes priority tasks visually distinct.
- **Users can toggle task completion with a single click** — checkbox interaction is immediate and optimistic.
- **Users can view a detailed task panel** — click any task to see its full description, assignee, due date, attachments, and activity feed.
- **The activity feed shows who created the task and when** — with relative timestamps ("3h ago", "just now").
- **Task attachments are fully integrated with the file system** — uploading a file to a task automatically creates a dedicated folder in the project's file storage.
- **Upload progress is visible with a real-time progress bar** — users never wonder if their file is actually uploading.
- **Failed uploads can be retried or dismissed** — error handling that doesn't block workflow.
- **Files attached to tasks show file type icons, size, and uploader name** — full context without leaving the task view.
- **Attached files can be viewed, downloaded, or deleted inline** — hover to reveal action buttons.
- **Viewers can see all tasks but cannot add, edit, or complete them** — read-only access is enforced consistently.

### Document Editor (Docs Tab)
- **Users can create unlimited project documents** — click the "+" and start writing immediately.
- **Documents use a full Markdown editor with slash commands** — type "/" to insert headings, lists, code blocks, and more.
- **The editor supports a floating format bar** — select text to see bold, italic, and other formatting options.
- **Documents auto-save with a 800ms debounce** — changes are persisted quietly without a save button.
- **Each document shows "last edited by [name]" and relative timestamp** — full editorial attribution.
- **Documents can be toggled between Edit and View mode** — one-click switch between raw Markdown editing and rendered preview.
- **The rendered view uses the same Markdown renderer as the Nexus knowledge base** — full formatting fidelity including code blocks, tables, and embedded media.
- **Viewers see documents in read-only mode with an "AUTO-SAVED" or "READ ONLY" badge** — clear status at all times.
- **Document titles are inline-editable** — click and type, no modal needed.
- **Untitled documents auto-focus the title field** — so you can start naming immediately.
- **Documents can be deleted with a confirmation dialog** — protection against accidental loss.
- **The document list shows titles with hover-to-reveal "last edited" timestamps** — progressive disclosure keeps the sidebar clean.

### Real-Time Chat (Chat Tab)
- **Users can send messages to the project's built-in chat** — no need for Slack, Teams, or Discord.
- **Messages appear in real time for all members** — powered by Supabase Realtime with instant delivery.
- **Consecutive messages from the same person within 10 minutes are visually grouped** — reducing visual clutter and making conversations easier to scan.
- **Date dividers ("Today", "Yesterday", "Aug 12, 2024") separate conversations by day** — clear temporal context.
- **Each user gets a deterministic, unique avatar color** — consistent visual identity across the chat.
- **Users can edit their own messages** — inline editing with "ESC to cancel" guidance.
- **Edited messages show an "(edited)" label** — honest communication.
- **Users can delete their own messages** — soft-delete that removes the message from view.
- **Edit and delete controls appear on hover** — clean UI that only shows actions when needed.
- **Users can attach files to messages** — images, documents, and any file type.
- **Image attachments render inline as previews** — no need to click through to see what someone shared.
- **Non-image attachments show as download cards with file name and size** — clean, scannable presentation.
- **Chat files are automatically added to the project's file storage** — everything shared in chat is also accessible from the Files tab.
- **The input supports multi-line messages with Shift+Enter** — for longer, structured messages.
- **Enter sends the message immediately** — fast, chat-native interaction.
- **A "New message" pill appears when scrolled up and a message arrives** — so you never miss something without being force-scrolled.
- **Auto-scroll behavior is smart: it scrolls down only if you're already near the bottom** — respecting your reading position.
- **The last 100 messages are loaded initially** — fast load without overwhelming the UI.
- **A send button appears only when there's content to send** — minimal, intentional UI.
- **Pending attachments are previewed before sending** — with the option to remove individual files.
- **Viewers see a "You have view-only access" placeholder in the input** — clear, non-intrusive permission feedback.
- **Optimistic message insertion prevents perceived latency** — your message appears instantly while syncing in the background.

### File Management (Files Tab)
- **Users can upload files by clicking or by dragging and dropping** — both interaction patterns are fully supported.
- **Drag-and-drop triggers a visual overlay ("Drop files here to upload")** — clear feedback that the drop zone is active.
- **Files are organized in a nested folder system with unlimited depth** — create as many subfolders as you need.
- **A sidebar folder tree shows the full directory structure** — navigate with expand/collapse chevrons.
- **A breadcrumb trail at the top shows the current path** — click any segment to jump to that folder level.
- **The file list shows name, uploaded by, size, and date** — a proper file explorer with all the metadata you'd expect.
- **Files can be viewed inline (opens in new tab), downloaded, or deleted** — full lifecycle management.
- **Folders can be created, renamed, and deleted** — with inline name editing and duplicate-name validation.
- **Folder deletion requires confirmation and cascades to all contents** — no accidental data loss.
- **Upload progress is shown in a floating panel in the bottom-right corner** — multiple concurrent uploads with individual progress bars.
- **Failed uploads show error status with Retry and Dismiss options** — graceful error recovery.
- **Successful uploads auto-dismiss after 2 seconds** — keeping the UI clean.
- **File type icons are context-aware** — images, documents, code files, and archives all get their own icon.
- **Duplicate folder names within the same parent are prevented** — clear error messages when it happens.
- **Every file tracks who uploaded it** — uploader name is displayed in the file list and task attachment views.
- **Files uploaded in chat automatically appear in the Files tab** — one unified file store for the entire project.

### Project Settings & Administration
- **Owners can rename the project, change its color, and change its icon** — all saved with a single "Save Changes" button.
- **The settings modal has a clean sidebar navigation: General, Members, Danger Zone** — organized like a professional admin panel.
- **The Members section shows all members with their roles** — with inline role-change dropdowns for owners.
- **Owners can remove any non-owner member** — with a confirmation prompt.
- **The Danger Zone is visually separated with red warning styling** — signaling the destructive nature of these actions.
- **Projects can be archived** — hidden from the sidebar but restorable at any time.
- **Archived projects show a banner with a "Restore" button** — one click to bring it back.
- **Projects can be permanently deleted** — with a "type the project name to confirm" safety mechanism.
- **Permanent deletion cleans up all files from storage** — no orphaned data left behind.
- **Project name input is capped at 50 characters** — preventing UI overflow issues.

### Navigation & Sidebar
- **Each project appears in the main app sidebar with its color dot and name** — always one click away.
- **The active project is highlighted with a left border accent** — clear visual indication of where you are.
- **Clicking a project in the sidebar routes you directly to it** — URL-based navigation (`/app/workspace/{id}`).
- **The workspace view includes 4 tabs: Tasks, Docs, Chat, Files** — organized by content type, switchable via the header.
- **Tab navigation uses uppercase labels with an underline indicator** — consistent with the app's design system.
- **Empty workspace state shows a centered call-to-action to create your first project** — with a decorative grid background and subtle technical-aesthetic text.

---

## 4. WHAT MAKES IT UNIQUE

### vs. Notion
Notion has team workspaces with docs and databases, but no built-in real-time chat and no native file manager with folder hierarchy. You can't see who's online at a glance.

### vs. Todoist
Todoist is pure task management. No docs, no chat, no file storage, no real-time presence. "Shared projects" means a shared task list, not a shared workspace.

### vs. Linear
Linear is built for engineering teams with issues and cycles. It has no general-purpose docs editor, no built-in team chat, and no file storage. Roles are far more complex than owner/member/viewer.

### vs. Obsidian
Obsidian is a single-player note-taking tool. It has no real collaboration, no task management, no chat, and no file sharing. The recent "Publish" feature is one-way — not interactive.

### vs. Slack + Google Drive + Asana (the stack)
Most teams use 3+ apps to get what this one feature provides. The unique advantage is **everything is in one view with one set of permissions**. Files shared in chat appear in the file manager. Tasks have attachments from the file system. Docs are written by the same members who are chatting. There's no integration to set up, no permissions to sync, no tab-switching tax.

### The single most impressive thing
**Real-time presence + real-time task sync + real-time chat in a single unified view.** When your teammate adds a task, you see it appear. When they start typing in chat, you read it live. When they come online, their avatar dot appears. All of this happens without a single page refresh — and without installing a separate app. The workspace is alive.

---

## 5. THE BEST HEADLINE FOR THIS FEATURE

1. **One project. One room. Everyone on the same page.**
2. **Tasks, docs, chat, files — in a single shared space.**
3. **Your team's workspace, not another tool.**
4. **Collaborate without the tab-switching tax.**
5. **Everything your project needs. Nothing it doesn't.**

---

## 6. THE BEST SUBTEXT FOR THIS FEATURE

**Option A:**
Create a project, invite your team, and start working — all in one place. Shared tasks update in real time, documents auto-save, chat lives right next to your work, and files stay organized in folders everyone can access. No integrations to set up, no tabs to juggle.

**Option B:**
Workspaces bring your tasks, documents, team chat, and file storage into a single unified view. See who's online, assign tasks, write collaboratively, and share files — all with role-based permissions that just work. It's the shared office your distributed team never had.

**Option C:**
Stop bouncing between Slack, Google Drive, and your task manager. Workspaces give every project its own room with real-time tasks, a Markdown doc editor, team chat with file attachments, and a full folder-based file system — all powered by instant sync.

---

## 7. THREE THINGS TO SHOW IN A SCREENSHOT OR DEMO

### Screenshot 1: "The Full Workspace"
Show the project view with the Tasks tab active. The header should display the project name with its color-coded icon, the tabbed navigation (TASKS · DOCS · CHAT · FILES) with TASKS underlined, and the presence bar showing 3 online avatars with green dots. The left panel should list 4–5 tasks in the "In Progress" section with assignee avatars and due dates visible. The right panel should show a selected task's detail view with title, description, "ASSIGNED TO" with a member name, and "DUE DATE" with "Tomorrow". **This is the hero image — it says "this is a real workspace, not a toy."**

### Screenshot 2: "Live Chat with Attachments"
Show the Chat tab with a natural 4–5 message conversation between two users. Include a date divider ("Today"), grouped consecutive messages, and one message with an inline image attachment preview. The input area at the bottom should show the attachment button, a partially typed message, and the purple send arrow. One message should have the "(edited)" label visible. **This shows the product is genuinely collaborative, not just shared.**

### Screenshot 3: "The Invite Flow"
Show the invite acceptance page — the full-screen branded card with the project icon (color-coded), the headline "You've been invited", the text showing "[Sarah] invited you to join [Website Redesign] as a MEMBER", and the purple "Accept Invite" button. **This is the "first impression" moment that makes the product feel professional and trustworthy.**

---

## 8. WHO WILL LOVE THIS FEATURE MOST

### 🎯 Primary: Small teams and startup crews (2–8 people)
Teams where everyone wears multiple hats. They don't want to configure Jira, pay for Notion Teams, and maintain a Slack workspace. They want one place where the project *lives* — tasks, notes, conversations, and files included. 

**Their use case:** "We're building a product launch. I need to assign tasks, share the brand guidelines PDF, discuss the landing page copy, and write the launch checklist — all without leaving this project."

### 🎨 Secondary: Freelancers working with clients
Freelancers who need a shared space with a client but don't want to invite them into their personal productivity system. The viewer role is perfect for giving clients read-only access to project progress.

**Their use case:** "I create a workspace for each client. They can see task progress, read the project brief, and download deliverables — but they can't edit anything. If they want to discuss something, they message me in the chat tab."

### 📚 Tertiary: Study groups and student projects
Students working on group assignments who need to coordinate tasks, share notes, discuss ideas, and submit files — all without the overhead of corporate tools.

**Their use case:** "Our group has a workspace for the semester project. We assign research sections, share annotated PDFs, discuss findings in chat, and everyone can see who's done what."

---

## 9. POWER USER MOMENTS

- **Optimistic updates everywhere:** When you create a project, add a task, send a message, or remove a member, the UI updates *instantly* — before the server confirms. If the server rejects the action, the change rolls back silently. This eliminates perceived latency entirely.

- **Task attachments auto-create folder structure:** When you attach a file to a task for the first time, the system automatically creates a "Task Attachments" parent folder and a "Task: [Task Name]" subfolder in the file system. Subsequent uploads go into the same folder. This means task files are always organized, even if the user never thinks about folder structure.

- **Chat files appear in the Files tab automatically:** Every file uploaded as a chat attachment is also registered in the project's file store. This means nothing shared in conversation gets lost — it's always browsable in the Files tab.

- **Type-to-confirm delete for permanent actions:** Deleting a project requires typing the project's exact name. This isn't just a checkbox — it's an intentional friction pattern that prevents catastrophic mistakes. Power users recognize this from GitHub and Heroku and immediately trust the product.

- **Smart auto-scroll in chat:** The chat only auto-scrolls to new messages if you're already near the bottom. If you've scrolled up to read older messages, new messages trigger a "↓ New message" pill instead. This is the same behavior as Discord and Slack — and users notice when it's missing.

- **Consecutive message grouping with time threshold:** If the same user sends multiple messages within 10 minutes, their name and avatar are shown only once. The timestamp is hidden but revealed on hover. This makes long conversations significantly more readable.

- **The invite acceptance page is a standalone, branded experience:** It validates the token, checks for expiration, detects if you're already a member, handles the "not logged in" case, and auto-redirects to the project after acceptance. It even refetches the sidebar so the project appears without a reload. Every edge case is covered.

- **800ms debounce on document saves:** The doc editor doesn't save on every keystroke — it waits 800ms after you stop typing. This prevents server thrashing during rapid editing while still feeling like "instant save". Users who type fast will appreciate the lack of lag.

- **Breadcrumb navigation in the file manager:** Clicking any segment of the breadcrumb path jumps to that folder. This is standard in OS file managers but surprisingly rare in web apps. Users who work with deeply nested folders will notice and appreciate it.

- **Role-aware UI throughout:** The entire interface adapts to your role. Owners see settings gear icons and role dropdowns. Members see edit fields and upload buttons. Viewers see read-only states with clear badges. This isn't a single permission check — it's woven into every component, every button, every input field.

---

## 10. FEATURE STATS & FACTS

| Stat | Detail |
|------|--------|
| **Tabs per project** | 4 (Tasks, Docs, Chat, Files) |
| **Roles available** | 3 (Owner, Member, Viewer) |
| **Project colors** | 6 curated options |
| **Project icons** | 6 options (briefcase, rocket, star, globe, code, boxes) |
| **Online presence avatars displayed** | Up to 4 + overflow counter |
| **Invite expiry** | 7 days from creation |
| **Chat messages loaded** | Last 100 messages on initial load |
| **Consecutive message grouping** | Within 10 minutes of same sender |
| **Document auto-save debounce** | 800ms |
| **Task description auto-save debounce** | 500ms |
| **Project name max length** | 50 characters |
| **Folder nesting** | Unlimited depth |
| **File types supported** | All — with smart icons for images, docs, code, and archives |
| **Real-time channels per project** | 3 (presence, messages, tasks) |
| **Upload progress granularity** | 10% increments with visual progress bar |
| **Failed upload recovery** | Retry with preserved file reference, or dismiss |
| **Successful upload cleanup** | Progress toast auto-dismisses after 2 seconds |
| **Optimistic update coverage** | Project creation, task add/toggle/update, member removal, role change, invite revoke, message send/edit/delete, folder/file operations |
| **Delete safety mechanism** | Type-to-confirm project name before permanent deletion |
| **Archival support** | Archive/restore toggle with dedicated banner |
| **Markdown editor features** | Slash commands, floating format bar, keyboard shortcuts, live preview toggle |
| **Attachment cross-linking** | Chat uploads auto-register in Files tab; task uploads auto-create folder structure |
| **Presence deduplication** | Multi-tab/window sessions consolidated to single presence entry |

---

*This document was generated from a complete source code review of the Workspaces & Projects feature — covering 22 component files, 7 custom hooks, 1 global store, and 1 type module across ~3,800 lines of production code.*
