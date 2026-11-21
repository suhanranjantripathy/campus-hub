# Campus Hub 🎓

> **The Student Operating System for Indian Higher-Ed**  
> Turning passive academic data into an actionable operating system: AI Bunk-o-Meter, SyllabusOS PYQ Analyzer, Dynamic Timetable, and Smart Priority Feed.

---

## ⚡ Core Features

### 1. 🛡️ Attendance & Bunk-o-Meter (Safe-Zone Engine)
- **75% Mandatory AICTE/UGC Threshold Protection**: Real-time calculation of safe bunk buffer vs. deficit debarment risk.
- **Safe Bunk Calculator**: Calculates exactly how many classes you can skip without falling below your institution's minimum attendance.
- **Debarment Recovery Forecaster**: For subjects under 75%, calculates the exact consecutive classes needed to return to the safe zone.
- **Interactive "What-If" Bunk Simulator**: Adjust sliders to simulate future bunks or attendances and project attendance percentages before skipping a class.
- **1-Click Quick Logging**: Mark Present, Bunked, or Cancelled with instant history logs.

### 2. 📖 SyllabusOS & PYQ Analyzer (Academic Copilot)
- **High-Yield Past Question Paper (PYQ) Frequency**: Tracks how many times each concept appeared across 5 years of university exams.
- **Exam Priority Index**: Mathematical scoring weighting unit importance against historical question frequency.
- **Mastery Tracker**: Move concepts through `Not Started` → `In Progress` → `Mastered`.
- **1-Click Automated Study Plan Generator**: Analyzes unmastered high-yield topics and generates an action checklist for the day with estimated time allocations.

### 3. 🕒 Dynamic Weekly Timetable
- **Active Schedule**: Replaces buried WhatsApp group photos and lost gallery screenshots.
- **Slot Builder**: Add lectures, labs, and tutorials with room numbers and faculty details.
- **Day Selector & Today Auto-Detection**: Highlights today's active schedule automatically.

### 4. 🚀 Unified Command Center & Smart Priority Feed
- **Dynamic AI Priority Feed**: High-urgency alerts (debarment risks, upcoming classes, high-yield exam topics, attendance buffers).
- **Today's Timeline & Action Checklist**: Everything a student needs for the day in one screen.
- **1-Click Demo Sandbox**: Instant demo student profile (Arjun, CS 2nd Year) pre-loaded with engineering subjects and real data.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router, Server & Client Components)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT cookies with bcrypt password hashing
- **Styling**: Tailwind CSS & Modern Glassmorphism UI
- **Icons**: Lucide React
- **Language**: TypeScript (strict mode)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Local MongoDB running on `mongodb://127.0.0.1:27017/` (or MongoDB Atlas URI)

### 2. Installation
```bash
git clone https://github.com/suhanranjantripathy/campus-hub.git
cd campus-hub
npm install
```

### 3. Environment Configuration
Create `.env.local`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/campushub
JWT_SECRET=your_jwt_secret_key_change_in_production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

Click **"🚀 Load 1-Click Demo Student"** on the Sign In page to instantly load pre-populated engineering courses, timetable, syllabus topics, and attendance records!

---

## 📂 Project Structure

```
campus-hub/
├── app/
│   ├── api/
│   │   ├── auth/          # login, register, me, logout
│   │   ├── attendance/    # logs, mark, bunk forecast simulator
│   │   ├── dashboard/     # unified priority feed & schedule summary
│   │   ├── seed/          # 1-click engineering demo seeder
│   │   ├── study-plan/    # high-yield task generator & toggles
│   │   ├── subjects/      # CRUD subjects & calculated metrics
│   │   ├── syllabus/      # topics, PYQ frequencies & status
│   │   └── timetable/     # weekly slot scheduling
│   ├── attendance/        # Bunk-o-Meter UI
│   ├── dashboard/         # Command Center
│   ├── login/             # Auth UI
│   ├── register/          # Profile onboarding
│   ├── syllabus/          # SyllabusOS UI
│   ├── timetable/         # Schedule grid UI
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           # Value proposition & landing page
├── components/
│   ├── AttendanceCard.tsx
│   ├── BunkOMeter.tsx
│   └── Navbar.tsx
├── lib/
│   ├── auth.ts            # JWT verification & cookies
│   ├── mongodb.ts         # Cached Mongoose connection
│   └── utils.ts           # Bunk calculation math & tailwind merge
└── models/
    ├── AttendanceLog.ts
    ├── StudyTask.ts
    ├── Subject.ts
    ├── SyllabusTopic.ts
    ├── Timetable.ts
    └── User.ts
```
