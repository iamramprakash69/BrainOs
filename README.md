# 🧠 Second Brain OS - The Execution Engine

> **Stop collecting ideas. Start executing them.**

[![Live Demo](https://img.shields.io/badge/Demo-Live-green)](https://kinetic-sable-beta.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Prisma%20%7C%20PostgreSQL-blue)](#tech-stack)

---

## 🌪️ What is Second Brain OS?

Most "Second Brain" apps are just digital cemeteries—places where ideas go to die. **Second Brain OS** is different. It's a proactive **Execution Engine** built for high-performance students and professionals.

It transforms vague ideas into structured, time-bound action plans using AI and enforces execution through behavioral psychology and gamification.

---

## 🚀 Key Features

### 1. 🔮 The Anti-Gravity Input
Type any idea, no matter how vague. Our AI breakdown engine transforms it into a **Day 1 Action Plan** with micro-steps, complexity scores, and future projections.

### 2. 🌀 The Focus Tunnel
A zero-distraction execution environment. Once you start a task, the UI "locks in," providing only a timer, your next action, and a "Break" button.

### 3. 📊 Friction Radar
A real-time "Mental Resistance" meter. If you procrastinate on a task, the radar turns Red, triggering **Atomic Breakdown Mode**—converting the task into a 2-minute version to lower the barrier to entry.

### 4. 💀 The Wall of Shame
Failed a commitment? Aborted a mission? You're added to the public Wall of Shame. Accountability is the best productivity hack.

### 5. 📡 Shadow Learner (Preview)
Integrations for **WhatsApp**, **Gmail**, and **Google Classroom**. The AI "listens" to your digital life and automatically pushes tasks to your board.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend:** Next.js API Routes, Prisma ORM.
- **Database:** PostgreSQL (Hosted on Neon.tech).
- **AI:** OpenAI GPT-4o (Task Breakdown & Future Projections).
- **Deployment:** Vercel.

---

## 📦 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/iamramprakash69/BrainOs.git
    cd BrainOs
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file with your `DATABASE_URL` (PostgreSQL) and `OPENAI_API_KEY`.

4.  **Push the database schema:**
    ```bash
    npx prisma db push
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

---

## 🤝 Roadmap

- [ ] **AI Voice Integration:** Speak to your Second Brain to log tasks.
- [ ] **Collaborative Missions:** Team-based execution with shared streaks.
- [ ] **Mobile Companion App:** For passive notification listening.

---

## 📄 License
MIT License. Built with ❤️ for the [Hackathon Name] 2026.
