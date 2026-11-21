import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 py-6 sm:py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Action Layer for Higher-Ed</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
          Information Everywhere. <br />
          <span className="text-blue-600">Clarity Nowhere.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal">
          College portals store the facts. Students still assemble the day themselves.
          Campus Hub turns passive academic records into an active operating system for your college life.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm transition flex items-center justify-center gap-2"
          >
            Launch Campus Hub
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-base border border-slate-300 transition flex items-center justify-center gap-2"
          >
            Create Student Profile
          </Link>
        </div>

        {/* Highlight Stats from AISHE */}
        <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-200 mt-10">
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="text-2xl font-black text-slate-900">43.3M</div>
            <div className="text-xs text-slate-500 font-medium">Students in Higher-Ed (AISHE)</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="text-2xl font-black text-blue-600">75%</div>
            <div className="text-xs text-slate-500 font-medium">Mandatory Attendance Gate</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="text-2xl font-black text-slate-900">78.9%</div>
            <div className="text-xs text-slate-500 font-medium">Undergraduate Share</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="text-2xl font-black text-amber-600">0 Days</div>
            <div className="text-xs text-slate-500 font-medium">Safe Bunk Guesswork</div>
          </div>
        </div>
      </section>

      {/* From Storage Layer to Action Layer */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="max-w-3xl mb-8">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
            Architectural Shift
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            From Storage Layer to Action Layer
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Campus Hub integrates existing academic data; it does not replace the institution&apos;s LMS or portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legacy Portal Card */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-red-400 mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
                EXISTING_PORTAL.HTML
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-4">Stores Academic Data</h3>
              <ul className="space-y-2.5 text-xs text-slate-400 font-mono">
                <li className="flex items-center gap-2">📄 ATTENDANCE_ARCHIVE.PDF (82%)</li>
                <li className="flex items-center gap-2">📄 INTERNAL_MARKS_TABLE.HTML (8.7 CGPA)</li>
                <li className="flex items-center gap-2">📄 UNFORMATTED_CIRCULARS.DOCX (12 New)</li>
                <li className="flex items-center gap-2">📄 STATIC_TIMETABLE_PHOTO.JPG (Lab @ 2)</li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-slate-400">
              ❌ Passive repository • Buried in WhatsApp & screenshots
            </div>
          </div>

          {/* Campus Hub Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/40 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-blue-400 mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block animate-pulse"></span>
                CAMPUS_HUB.APP
              </div>
              <h3 className="text-lg font-bold text-white mb-4">Turns Information Into Action</h3>
              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <strong>AI Bunk-o-Meter</strong> — Exact safe bunks & recovery classes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <strong>Smart Priority Feed</strong> — Actionable daily plan & time slots
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <strong>SyllabusOS Copilot</strong> — PYQ topic frequency & exam prep
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <strong>Unified Timetable Grid</strong> — Today&apos;s lectures & lab rooms
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-blue-800 text-xs text-blue-300 font-medium">
              ⚡ Actionable operating system for student success
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Both Achievement & Recovery
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Whether you&apos;re maintaining a 9+ CGPA like Riya or recovering weak subjects like Arjun.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Attendance Forecaster
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Never get debarred. Real-time calculation shows how many lectures you can bunk without breaching the 75% threshold, or exactly how many consecutive classes to attend to bounce back.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              SyllabusOS & PYQ Analyzer
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Prioritize topics based on historical question paper frequency and unit weightage. Generate realistic high-yield daily study sessions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Dynamic Weekly Timetable
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No more digging through WhatsApp group photos or saved phone gallery screenshots. View today&apos;s schedule with room numbers and class formats.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
