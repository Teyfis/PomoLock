<div align="center">

# 🍅 PomoLock

**A modern Pomodoro timer with hyperfocus mode, visual statistics, and cloud sync.**

🌐 **[Try PomoLock](https://pomolock.vercel.app)**

*[🇧🇷 Versão em português](./README.md)*

</div>

---

## 💡 Motivation

I wanted a simple Pomodoro app, but one that had something most don't: **visual statistics in a habit tracker style**, inspired by [YeolPumTa (열품타)](https://play.google.com/store/apps/details?id=com.pallo.passiontimerscoped&hl=pt_BR), a Korean study app. The idea was to visualize daily progress through a **heatmap** — similar to GitHub's contribution graph — to stay motivated and consistent with my studies.

Another key requirement was **cross-device synchronization**: I wanted to access my statistics from both my personal computer and the university computers, without losing any data. That's why PomoLock features Google login and cloud storage, ensuring everything is always up to date regardless of where I access it.

Since I couldn't find anything that met my exact needs, I decided to build my own, using **artificial intelligence as a development assistant** to speed up the process.

## ✨ Features

- ⏱️ **Pomodoro Timer** — Configurable Focus, Short Break, and Long Break
- 🧠 **Hyperfocus Mode** — When enabled, the timer won't interrupt your focus when a Pomodoro ends. The counter keeps running until you feel tired and decide to start your break manually
- 📊 **Statistics Heatmap** — Visualize your productivity GitHub/YeolPumTa style
- 🔐 **Google Login** — OAuth authentication (optional)
- ☁️ **Cloud Sync** — Your data follows you across devices
- 📱 **PWA** — Installable on mobile and desktop, works offline
- 🎨 **Customizable Colors** — Personalize colors for each mode
- 🔊 **Configurable Alarms** — Choose sound and volume
- 🌙 **Dark Interface** — Modern, minimalist design

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) |
| State | [Zustand](https://zustand.docs.pmnd.rs/) (with localStorage persistence) |
| Auth & Database | [Supabase](https://supabase.com/) (Google OAuth + PostgreSQL) |
| Deploy | [Vercel](https://vercel.com/) |
| Icons | [Lucide React](https://lucide.dev/) |

## 🤖 Built with AI Assistance

This project was **developed with artificial intelligence assistance** as a pair programming tool. AI helped with architecture, feature implementation, debugging, and best practices — significantly accelerating development without compromising code quality.

## 📦 Running Locally

```bash
# Clone the repository
git clone https://github.com/Teyfis/PomoLock.git
cd PomoLock

# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your Supabase credentials

# Run
pnpm dev
```

## 📄 License

This project is for personal and educational use. Feel free to get inspired!

---

<div align="center">

Developed by **Tiago Luterbach** — Computer Science Student at UFF

</div>
