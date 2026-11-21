"use client";

import { useState } from "react";
import { Check, X, Ban, MoreVertical, Trash2 } from "lucide-react";
import BunkOMeter from "./BunkOMeter";

interface AttendanceCardProps {
  subject: any;
  onMark: (subjectId: string, status: "present" | "absent" | "cancelled") => Promise<void>;
  onDelete: (subjectId: string) => Promise<void>;
}

export default function AttendanceCard({ subject, onMark, onDelete }: AttendanceCardProps) {
  const [loading, setLoading] = useState(false);
  const { metrics } = subject;

  const handleAction = async (status: "present" | "absent" | "cancelled") => {
    setLoading(true);
    try {
      await onMark(subject._id, status);
    } finally {
      setLoading(false);
    }
  };

  const progressColor =
    metrics.currentPercent >= metrics.targetPercent + 5
      ? "bg-emerald-500"
      : metrics.currentPercent >= metrics.targetPercent
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: subject.color || "#2563eb" }}
            />
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {subject.code}
            </span>
          </div>

          <button
            onClick={() => onDelete(subject._id)}
            title="Delete Subject"
            className="text-slate-400 hover:text-rose-600 transition p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">
          {subject.name}
        </h3>
        {subject.facultyName && (
          <p className="text-xs text-slate-500 mb-3">{subject.facultyName}</p>
        )}

        {/* Attendance Counter */}
        <div className="flex items-baseline justify-between text-xs text-slate-500 mt-3 mb-1.5">
          <span>
            Attended:{" "}
            <strong className="text-slate-900 font-bold text-sm">
              {subject.attendedClasses}
            </strong>{" "}
            / {subject.totalClasses} classes
          </span>
          <span className="font-bold text-sm text-slate-900">
            {metrics.currentPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-4">
          <div
            className={`h-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(100, metrics.currentPercent)}%` }}
          />
        </div>

        {/* Bunk-o-Meter Pill */}
        <BunkOMeter
          currentPercent={metrics.currentPercent}
          targetPercent={metrics.targetPercent}
          safeBunks={metrics.safeBunks}
          classesNeededToRecover={metrics.classesNeededToRecover}
          isSafe={metrics.isSafe}
        />
      </div>

      {/* Quick Mark Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500">Log Today:</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleAction("present")}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition border border-emerald-200"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Present</span>
          </button>
          <button
            onClick={() => handleAction("absent")}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition border border-rose-200"
          >
            <X className="w-3.5 h-3.5" />
            <span>Bunked</span>
          </button>
          <button
            onClick={() => handleAction("cancelled")}
            disabled={loading}
            title="Class Cancelled"
            className="p-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          >
            <Ban className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
