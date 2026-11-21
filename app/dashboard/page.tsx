"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  GraduationCap,
  Layers,
  MapPin,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    const res = await fetch("/api/study-plan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, completed: !currentCompleted }),
    });

    if (res.ok) {
      await fetchDashboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 animate-spin text-blue-600" />
          <span>Synchronizing student action layer...</span>
        </div>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Please Sign In</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Sign in or load the instant demo to access your Campus Hub dashboard.
        </p>
        <Link
          href="/login"
          className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const { user, stats, subjects, todaySlots, tasks, priorityFeed, todayDayName } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Student Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>
              Year {user.year} • Semester {user.semester} • {user.branch}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hello, {user.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-normal">
            {user.college} • Target Threshold: {user.targetAttendance}% Attendance
          </p>
        </div>

        {/* Quick overall badge */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">
              Total Attendance
            </div>
            <div className="text-3xl font-black text-white mt-0.5">
              {stats.overallPercent}%
            </div>
            <div className="text-[11px] text-slate-400">
              {stats.attendedClasses}/{stats.totalClasses} classes
            </div>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
              stats.overallPercent >= 75
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-rose-500/20 text-rose-300"
            }`}
          >
            {stats.overallPercent >= 75 ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>

      {/* AI Smart Priority Feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Smart Priority Feed (Action Layer)</span>
          </h2>
          <span className="text-xs text-slate-400">Auto-prioritized by urgency</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {priorityFeed.map((feed: any) => {
            const isDanger = feed.type === "danger";
            const isWarning = feed.type === "warning";
            const isSuccess = feed.type === "success";

            return (
              <Link
                key={feed.id}
                href={feed.actionUrl}
                className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] flex items-start justify-between gap-3 ${
                  isDanger
                    ? "bg-rose-50/70 border-rose-200 hover:border-rose-300"
                    : isWarning
                    ? "bg-amber-50/70 border-amber-200 hover:border-amber-300"
                    : isSuccess
                    ? "bg-emerald-50/70 border-emerald-200 hover:border-emerald-300"
                    : "bg-blue-50/70 border-blue-200 hover:border-blue-300"
                }`}
              >
                <div>
                  <h3
                    className={`font-bold text-sm ${
                      isDanger
                        ? "text-rose-900"
                        : isWarning
                        ? "text-amber-900"
                        : isSuccess
                        ? "text-emerald-900"
                        : "text-blue-900"
                    }`}
                  >
                    {feed.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {feed.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Today's Schedule & High-Yield Study Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Today&apos;s Lectures & Labs ({todayDayName})</span>
              </h2>
              <Link
                href="/timetable"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                View Week <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {todaySlots.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No classes scheduled for today!
              </div>
            ) : (
              <div className="space-y-3">
                {todaySlots.map((slot: any, idx: number) => {
                  const sub = slot.subjectId;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-center font-mono font-bold text-xs text-slate-800 shrink-0">
                          {slot.startTime}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            {sub?.name || "Lecture"}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono">{sub?.code}</span>
                            {slot.room && (
                              <span className="flex items-center gap-0.5">
                                • <MapPin className="w-3 h-3" /> {slot.room}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          slot.type === "lab"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {slot.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <Link
              href="/attendance"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Log Today&apos;s Attendance →
            </Link>
          </div>
        </div>

        {/* Priority Study Checklist Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Today&apos;s High-Yield Study Tasks</span>
              </h2>
              <Link
                href="/syllabus"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                SyllabusOS <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                All study tasks completed! Auto-generate more in SyllabusOS.
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task: any) => {
                  const sub = task.subjectId;
                  const isCrit = task.priorityLevel === "critical";

                  return (
                    <div
                      key={task._id}
                      onClick={() => handleToggleTask(task._id, task.completed)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                        isCrit
                          ? "bg-rose-50/40 border-rose-200 hover:border-rose-300"
                          : "bg-slate-50 border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          className="text-slate-400 hover:text-blue-600 transition shrink-0"
                        >
                          <Circle className="w-4 h-4" />
                        </button>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            {task.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono font-semibold">
                              {sub?.code}
                            </span>{" "}
                            • {task.estimatedMinutes} mins
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                          isCrit
                            ? "bg-rose-100 text-rose-800 font-extrabold"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {task.priorityLevel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <Link
              href="/syllabus"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Analyze Past Papers (PYQ) →
            </Link>
          </div>
        </div>
      </div>

      {/* Courses Attendance Quick Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span>Attendance Safe-Zone Overview</span>
          </h2>
          <Link
            href="/attendance"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Open Bunk-o-Meter & Simulator →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub: any) => {
            const m = sub.metrics;
            const isSafe = m?.isSafe;

            return (
              <div
                key={sub._id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {sub.code}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isSafe
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {m?.currentPercent}%
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {sub.name}
                  </div>
                </div>

                <div className="mt-3 text-[11px] font-medium">
                  {isSafe ? (
                    <span className="text-emerald-700">
                      ✓ {m?.safeBunks} safe {m?.safeBunks === 1 ? "bunk" : "bunks"}{" "}
                      left
                    </span>
                  ) : (
                    <span className="text-rose-700 font-bold">
                      ⚠ Need {m?.classesNeededToRecover} classes to recover
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
