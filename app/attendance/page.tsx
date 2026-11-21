"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  Clock,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AttendanceCard from "@/components/AttendanceCard";

export default function AttendancePage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  // Form state
  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    facultyName: "",
    targetAttendance: 75,
    totalClasses: 20,
    attendedClasses: 16,
    color: "#2563eb",
    credits: 4,
  });

  // Simulator state
  const [simSubjectId, setSimSubjectId] = useState<string>("");
  const [simBunks, setSimBunks] = useState(3);
  const [simAttends, setSimAttends] = useState(4);
  const [simResult, setSimResult] = useState<any>(null);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
        if (data.subjects?.length > 0 && !simSubjectId) {
          setSimSubjectId(data.subjects[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/attendance");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchSubjects(), fetchLogs()]).finally(() => setLoading(false));
  }, []);

  const handleMarkAttendance = async (
    subjectId: string,
    status: "present" | "absent" | "cancelled"
  ) => {
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId, status }),
    });
    if (res.ok) {
      await fetchSubjects();
      await fetchLogs();
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    const res = await fetch(`/api/subjects/${subjectId}`, { method: "DELETE" });
    if (res.ok) {
      await fetchSubjects();
      await fetchLogs();
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSubject),
    });
    if (res.ok) {
      setShowAddModal(false);
      setNewSubject({
        name: "",
        code: "",
        facultyName: "",
        targetAttendance: 75,
        totalClasses: 0,
        attendedClasses: 0,
        color: "#2563eb",
        credits: 4,
      });
      await fetchSubjects();
    }
  };

  // Run simulation
  useEffect(() => {
    if (!simSubjectId || subjects.length === 0) return;
    const selected = subjects.find((s) => s._id === simSubjectId);
    if (!selected) return;

    fetch("/api/attendance/forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attended: selected.attendedClasses,
        total: selected.totalClasses,
        targetPercent: selected.targetAttendance,
        simulatedBunks: simBunks,
        simulatedAttends: simAttends,
      }),
    })
      .then((res) => res.json())
      .then((data) => setSimResult(data));
  }, [simSubjectId, simBunks, simAttends, subjects]);

  // Aggregate stats
  const totalClassesSum = subjects.reduce((acc, s) => acc + s.totalClasses, 0);
  const attendedClassesSum = subjects.reduce((acc, s) => acc + s.attendedClasses, 0);
  const overallPercent =
    totalClassesSum === 0 ? 100 : Math.round((attendedClassesSum / totalClassesSum) * 100 * 10) / 10;
  const atRiskCount = subjects.filter((s) => !s.metrics?.isSafe).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Attendance & Bunk-o-Meter
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time safe-zone forecasting and debarment protection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition"
          >
            <Calculator className="w-4 h-4" />
            <span>{showSimulator ? "Hide Simulator" : "Bunk Simulator"}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Aggregate Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall Attendance
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {overallPercent}%
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {attendedClassesSum} / {totalClassesSum} aggregate classes
            </div>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
              overallPercent >= 75 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}
          >
            {overallPercent >= 75 ? <ShieldCheck className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Subjects at Risk
            </div>
            <div className="text-3xl font-black text-rose-600 mt-1">
              {atRiskCount}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {atRiskCount === 0 ? "All subjects above safe zone" : "Require recovery attendances"}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Courses
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {subjects.length}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Enrolled engineering subjects
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            Sem
          </div>
        </div>
      </div>

      {/* Interactive What-If Simulator Drawer */}
      {showSimulator && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-slate-900 text-base">
                Interactive Bunk & Recovery Simulator
              </h2>
            </div>
            <span className="text-xs font-mono text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
              What-If Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Choose Subject to Test
              </label>
              <select
                value={simSubjectId}
                onChange={(e) => setSimSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium"
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.code} - {s.name} ({s.metrics?.currentPercent}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Simulate Bunking Next:</span>
                <span className="text-rose-600 font-bold">{simBunks} classes</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={simBunks}
                onChange={(e) => setSimBunks(Number(e.target.value))}
                className="w-full accent-rose-600"
              />
              <div className="mt-2 text-xs text-slate-600">
                Projected %:{" "}
                <strong
                  className={
                    simResult?.simulation?.afterBunk?.isSafe
                      ? "text-emerald-600 font-bold"
                      : "text-rose-600 font-bold"
                  }
                >
                  {simResult?.simulation?.afterBunk?.resultPercent}%
                </strong>{" "}
                ({simResult?.simulation?.afterBunk?.isSafe ? "Still Safe" : "Debarred!"})
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Simulate Attending Next:</span>
                <span className="text-emerald-600 font-bold">{simAttends} classes</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={simAttends}
                onChange={(e) => setSimAttends(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="mt-2 text-xs text-slate-600">
                Projected %:{" "}
                <strong className="text-emerald-600 font-bold">
                  {simResult?.simulation?.afterAttend?.resultPercent}%
                </strong>{" "}
                (Boosted)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject Cards Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Courses</h2>
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Loading attendance cards...
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No subjects added yet.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white"
            >
              Add Your First Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((sub) => (
              <AttendanceCard
                key={sub._id}
                subject={sub}
                onMark={handleMarkAttendance}
                onDelete={handleDeleteSubject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Attendance Activity Log */}
      {logs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Recent Attendance History
          </h2>
          <div className="divide-y divide-slate-100">
            {logs.slice(0, 8).map((log: any) => (
              <div key={log._id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      log.status === "present"
                        ? "bg-emerald-500"
                        : log.status === "absent"
                        ? "bg-rose-500"
                        : "bg-slate-400"
                    }`}
                  />
                  <span className="font-semibold text-slate-800">
                    {log.subjectId?.name || "Subject"}
                  </span>
                  <span className="font-mono text-slate-400">
                    ({log.subjectId?.code || ""})
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-0.5 rounded font-bold capitalize ${
                      log.status === "present"
                        ? "bg-emerald-50 text-emerald-700"
                        : log.status === "absent"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {log.status}
                  </span>
                  <span className="text-slate-400">
                    {new Date(log.date).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-lg">Add New Subject</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Networks"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS-301"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Faculty Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sharma"
                    value={newSubject.facultyName}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, facultyName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Attended
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSubject.attendedClasses}
                    onChange={(e) =>
                      setNewSubject({
                        ...newSubject,
                        attendedClasses: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Classes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSubject.totalClasses}
                    onChange={(e) =>
                      setNewSubject({
                        ...newSubject,
                        totalClasses: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target %
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={newSubject.targetAttendance}
                    onChange={(e) =>
                      setNewSubject({
                        ...newSubject,
                        targetAttendance: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
