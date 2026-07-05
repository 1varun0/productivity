# Peak Hub: Project Overview & Goals

## Executive Summary
Peak Hub is a premium, highly-interactive productivity application designed for deep work, habit tracking, and workspace collaboration. It aims to provide a "celestial", distraction-free experience, unifying disparate productivity tools (to-do lists, daily planners, notes, timers, and team chat) into a single, cohesive interface.

The application leverages a modern Single Page Application (SPA) architecture backed by a robust Backend-as-a-Service (BaaS) infrastructure, allowing for real-time collaboration and secure data management.

## Purpose and Scope
Modern knowledge workers and students often suffer from "tool fatigue," jumping between a task manager, a habit tracker, a calendar, a Pomodoro timer, and a team communication app. 

Peak Hub's purpose is to consolidate these domains into a single environment that emphasizes focus and minimalism. The scope includes personal productivity (tasks, habits, timetable, focus timer) and team productivity (shared workspaces, real-time chat, shared documents, and file attachments).

## Goals and Success Criteria
- **User Engagement**: Users should feel encouraged to return daily through the use of habit streaks and a visually rewarding "Focus Chamber".
- **Performance**: The application must remain highly responsive, utilizing optimistic UI updates to mask network latency.
- **Security**: User data must be strictly isolated. Users can only access their own data or data belonging to workspaces they are explicitly invited to.
- **Scalability**: The backend architecture must gracefully handle real-time WebSocket connections for chat and presence, leveraging scalable cloud infrastructure.

## Major Features
- **Dashboard**: A unified view of the day's pending tasks, active habits, and recent notes.
- **Tasks & Lists**: Comprehensive task management with priority flagging, due dates, and categorization into custom "spaces".
- **Habit Tracker**: Daily habit tracking with streak visualization and soft-delete capabilities.
- **Timetable**: A weekly, drag-and-drop 24/7 grid planner for scheduling blocks of time (e.g., Deep Work, Sleep, Classes).
- **Focus Chamber**: An immersive, full-screen deep work environment featuring a breathing celestial orb animation, designed to minimize distractions. Includes a "Mental Inbox" for capturing stray thoughts without breaking focus.
- **Nexus (Notes)**: A markdown-based document editor supporting tagging, collections, version history, and public sharing.
- **Workspaces (Projects)**: Collaborative environments for teams, featuring real-time chat, shared files, shared documents, and role-based access control (Owner, Member, Viewer).
- **Profile & Appearance**: Extensive customization including dark/light modes, compact/comfortable UI density, and user-defined accent colors that apply globally.

## High-Level Architecture Overview
Peak Hub follows a thick-client architecture. 
- **Frontend**: A React 19 SPA built with Vite, styled with Tailwind CSS v4, and using Zustand for complex client-side state management (like the Timetable grid and Focus Timer).
- **Backend**: Supabase handles all backend responsibilities. The Postgres database is the source of truth, secured by Row Level Security (RLS). Supabase Auth manages user sessions (OAuth + Magic Links). Supabase Realtime powers the workspace chat.
- **Serverless**: Supabase Edge Functions (Deno) execute secure, server-side logic, such as dispatching emails for workspace invitations via third-party providers (e.g., Resend).

For more detailed architectural diagrams, refer to `ARCHITECTURE.md`.
