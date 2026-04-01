# 🏗️ Second Brain OS - Technical Specification

This document provides a deep-dive into the architecture, data models, and core logic of the **Second Brain OS**.

---

## 🏗️ Architecture Overview

The application is built on **Next.js 15 (App Router)** with a serverless-first mindset.

- **Frontend:** React with **Framer Motion** for high-performance animations and **Lucide** for iconography.
- **Backend:** Next.js API Routes for server-side logic and OpenAI integration.
- **Data Layer:** **Prisma ORM** connecting to a **PostgreSQL** database (Hosted on Neon.tech).
- **Driver Adapters:** We use `pg` (node-postgres) instead of SQLite to ensure compatibility with serverless compute environments.

---

## 🗄️ Data Models

### User Model
Tracks the user's execution progress, energy levels, and commitment streaks.
- `executionScore`: A 0–100 metric calculated from completed vs. failed tasks.
- `currentStreak`: The number of consecutive days with at least one task completed.
- `peakEnergyStart/End`: A user-defined window (stored as hours) used for the **Smart Time-Blocking** feature.

### Task Model
The core execution unit. Supports recursive sub-tasking for complex missions.
- `mode`: Enum (`QUICK`, `DEEP`, `HABIT`) determining the execution context.
- `allocatedMinutes`: The user's commitment during **The Tunnel** phase.
- `actualSeconds`: Real-time tracking of the time taken to complete the task.
- `breakSeconds`: Total duration of pauses during execution.
- `futureProjection`: AI-generated text describing the impact of completing this task.

### Wall of Shame Model
A simple log of failed Task entries, used for accountability-based gamification.

---

## 🧠 Core Logic & Algorithms

### 1. Execution Score Calculation
The score is dynamic. Completing a task adds `+12` points (up to 100), while failing a task or aborting a mission resets the `currentStreak` and adds an entry to the `WallOfShame`.

### 2. The Friction Radar
The `frictionResistance` (0–100%) is a composite score based on:
- User's historical interaction with similar task types.
- The number of times a task's "Start" button was clicked but cancelled.
- The task's complexity vs. user's current energy peak.

### 3. Atomic Breakdown Mode
When triggered, the system invokes a specialized OpenAI prompt to "simplify the task until it can be done in 2 minutes." This is based on the **Two-Minute Rule** from GTD (Getting Things Done).

---

## 📡 Shadow Learner Integration (Webhook Layer)

The application provides a robust webhook ingestion layer:
- **WhatsApp Webhook:** A `/api/webhook/whatsapp` endpoint capable of receiving raw Meta Cloud API payloads.
- **Gmail OAuth Flow:** A pre-built `/api/webhook/gmail` route for handling Google OAuth handshakes and token exchange.
- **Google Classroom Prep:** A structure designed to ingest Classroom API announcements and convert them into `Task` records.

---

## 🛠️ Performance & Scalability
- **Prisma Client Caching:** Implemented in `lib/prisma.ts` to prevent database connection exhaustion in serverless environments.
- **Optimistic UI:** Tasks are instantly moved to their new state in the UI while the database update runs in the background.
- **Suspense & Streaming:** Heavy components like the AI strategist feed use Next.js Suspense for a faster Initial Page Load.
