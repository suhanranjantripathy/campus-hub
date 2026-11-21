"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Plus,
  RotateCw,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";

export default function SyllabusPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);

  // New topic form
  const [topicForm, setTopicForm] = useState({
    subjectId: "",
    unitNumber: 1,
    unitTitle: "Unit 1: Fundamentals",
    topicName: "",
    weightagePercent: 15,
    pyqFrequency: 5,
    status: "not_started",
  });

  const fetchData = async () => {
    try {
      const [topRes, taskRes, subRes] = await Promise.all([
        fetch("/api/syllabus"),
        fetch("/api/study-plan"),
        fetch("/api/subjects"),
      ]);

      if (topRes.ok) {
        const d = await topRes.json();
        setTopics(d.topics || []);
      }
      if (taskRes.ok) {
        const d = await taskRes.json();
        setTasks(d.tasks || []);
      }
      if (subRes.ok) {
        const d = await subRes.json();
        setSubjects(d.subjects || []);
        if (d.subjects?.length > 0 && !topicForm.subjectId) {
          setTopicForm((prev) => ({ ...prev, subjectId: d.subjects[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (
    topicId: string,
    currentStatus: "not_started" | "in_progress" | "mastered"
  ) => {
    const nextStatus =
      currentStatus === "not_started"
        ? "in_progress"
        : currentStatus === "in_progress"
        ? "mastered"
        : "not_started";

    const res = await fetch("/api/syllabus", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, status: nextStatus }),
    });

    if (res.ok) {
      await fetchData();
    }
  };

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    const res = await fetch("/api/study-plan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, completed: !currentCompleted }),
    });

    if (res.ok) {
      await fetchData();
    }
  };

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auto_generate" }),
      });
      const data = await res.json();
      alert(data.message || "Generated study plan!");
      await fetchData();
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicForm.subjectId || !topicForm.topicName) {
      alert("Please fill in the subject and topic name");
      return;
    }

    const res = await fetch("/api/syllabus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(topicForm),
    });

    if (res.ok) {
      setShowAddTopicModal(false);
      setTopicForm({
        subjectId: subjects[0]?._id || "",
        unitNumber: 1,
        unitTitle: "Unit 1",
        topicName: "",
        weightagePercent: 15,
        pyqFrequency: 5,
        status: "not_started",
      });
      await fetchData();
    }
  };

  const filteredTopics =
    selectedSubjectId === "all"
      ? topics
      : topics.filter((t) => t.subjectId?._id === selectedSubjectId);

  const masteredCount = topics.filter((t) => t.status === "mastered").length;
  const inProgressCount = topics.filter((t) => t.status === "in_progress").length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SyllabusOS Academic Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            PYQ Weightage & Study Planner
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Reverse-engineered from past 5 years question papers to maximize exam yield per hour
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? "Generating..." : "⚡ Auto-Generate Study Plan"}</span>
          </button>
          <button
            onClick={() => setShowAddTopicModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Topic</span>
          </button>
        </div>
      </div>

      {/* Progress Counter Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Tracked Topics
          </div>
          <div className="text-3xl font-black text-slate-900 mt-1">{topics.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">Across your engineering subjects</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Mastered Concepts
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-1">
            {masteredCount}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {topics.length > 0
              ? `${Math.round((masteredCount / topics.length) * 100)}% of total syllabus`
              : "0% complete"}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
            Active Study Tasks
          </div>
          <div className="text-3xl font-black text-amber-600 mt-1">
            {tasks.filter((t) => !t.completed).length}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Pending high-yield sessions</div>
        </div>
      </div>

      {/* Prioritized Study Tasks (Interactive Action Checklist) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Priority Action Checklist (Today&apos;s Recommended Study)</span>
          </h2>
          <span className="text-xs text-slate-500">
            {tasks.filter((t) => t.completed).length} / {tasks.length} Done
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No study sessions generated yet. Click &quot;Auto-Generate Study Plan&quot; above to create high-yield tasks!
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
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                    task.completed
                      ? "bg-slate-50 border-slate-200 opacity-60 line-through"
                      : isCrit
                      ? "bg-rose-50/50 border-rose-200 hover:border-rose-400"
                      : "bg-white border-slate-200 hover:border-blue-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-blue-600 transition shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-snug">
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono font-semibold text-slate-700">
                          {sub?.code || "SUB"}
                        </span>
                        <span>• {task.estimatedMinutes} mins</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isCrit
                          ? "bg-rose-100 text-rose-800 font-extrabold"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {task.priorityLevel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Syllabus Topics Ranked by Exam Frequency */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Syllabus Matrix & Past Year Paper (PYQ) Frequency</span>
          </h2>

          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>

        {filteredTopics.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            No syllabus topics found. Add topics using the button above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTopics.map((topic: any) => {
              const sub = topic.subjectId;
              const isCrit = topic.priorityScore >= 60;

              return (
                <div
                  key={topic._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-200 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: sub?.color || "#2563eb" }}
                        />
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {sub?.code || ""}
                        </span>
                        <span className="text-xs text-slate-400">• {topic.unitTitle}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isCrit
                              ? "bg-rose-100 text-rose-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          <Flame className="w-3 h-3" />
                          <span>{topic.pyqFrequency}x in PYQs</span>
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-tight mb-2">
                      {topic.topicName}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                      <span>Weightage: <strong>{topic.weightagePercent}%</strong></span>
                      <span>Priority Index: <strong>{topic.priorityScore}/100</strong></span>
                    </div>
                  </div>

                  {/* Status Toggle Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Status:</span>
                    <button
                      onClick={() => handleStatusChange(topic._id, topic.status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        topic.status === "mastered"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : topic.status === "in_progress"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <RotateCw className="w-3 h-3" />
                      <span className="capitalize">
                        {topic.status === "not_started"
                          ? "Not Started (Click to Advance)"
                          : topic.status === "in_progress"
                          ? "In Progress (Click to Master)"
                          : "Mastered ✓"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Topic Modal */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-lg">Add Syllabus Topic</h3>
              <button
                onClick={() => setShowAddTopicModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject
                </label>
                <select
                  required
                  value={topicForm.subjectId}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, subjectId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic Title / Concept
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dijkstra's Shortest Path Algorithm"
                  value={topicForm.topicName}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, topicName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Unit 3: Graph Algorithms"
                    value={topicForm.unitTitle}
                    onChange={(e) =>
                      setTopicForm({ ...topicForm, unitTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PYQ Appearance Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 6"
                    value={topicForm.pyqFrequency}
                    onChange={(e) =>
                      setTopicForm({
                        ...topicForm,
                        pyqFrequency: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Exam Weightage (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={topicForm.weightagePercent}
                  onChange={(e) =>
                    setTopicForm({
                      ...topicForm,
                      weightagePercent: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTopicModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
