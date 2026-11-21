"use client";

import { AlertTriangle, CheckCircle, Flame, ShieldAlert, Sparkles } from "lucide-react";

interface BunkOMeterProps {
  currentPercent: number;
  targetPercent: number;
  safeBunks: number;
  classesNeededToRecover: number;
  isSafe: boolean;
}

export default function BunkOMeter({
  currentPercent,
  targetPercent,
  safeBunks,
  classesNeededToRecover,
  isSafe,
}: BunkOMeterProps) {
  return (
    <div
      className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
        isSafe
          ? currentPercent >= targetPercent + 5
            ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
            : "bg-amber-50/70 border-amber-200 text-amber-950"
          : "bg-rose-50/80 border-rose-200 text-rose-950 animate-pulse-subtle"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 shadow-xs ${
            isSafe
              ? currentPercent >= targetPercent + 5
                ? "bg-emerald-600 text-white"
                : "bg-amber-500 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {currentPercent}%
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Target: {targetPercent}%
            </span>
            {isSafe ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle className="w-3 h-3" /> Safe Zone
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                <ShieldAlert className="w-3 h-3" /> Debarment Risk
              </span>
            )}
          </div>

          <div className="text-sm font-medium mt-0.5">
            {isSafe ? (
              safeBunks > 0 ? (
                <span className="text-emerald-700 font-semibold">
                  You can safely bunk{" "}
                  <strong className="underline decoration-2">{safeBunks}</strong> more{" "}
                  {safeBunks === 1 ? "class" : "classes"}.
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">
                  On the edge! Missing the next class will breach {targetPercent}%.
                </span>
              )
            ) : (
              <span className="text-rose-700 font-semibold">
                Must attend next{" "}
                <strong className="underline decoration-2">{classesNeededToRecover}</strong>{" "}
                consecutive {classesNeededToRecover === 1 ? "class" : "classes"} to recover!
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between text-xs text-slate-500 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
        <span>Bunk-o-Meter</span>
        <span className="font-mono text-[11px]">
          {isSafe ? `+${safeBunks} buffer` : `-${classesNeededToRecover} deficit`}
        </span>
      </div>
    </div>
  );
}
