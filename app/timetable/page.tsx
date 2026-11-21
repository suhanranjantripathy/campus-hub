"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Layers,
  MapPin,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  CheckCircle,
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<string>("Monday");
  const [showAddModal, setShowAddModal] = useState(false);

  // New slot form
  const [slotForm, setSlotForm] = useState({
    startTime: "09:00",
    endTime: "10:00",
    subjectId: "",
    room: "LT-101",
    type: "lecture",
  });

  const fetchData = async () => {
    try {
      const [ttRes, subRes] = await Promise.all([
        fetch("/api/timetable"),
        fetch("/api/subjects"),
      ]);
      if (ttRes.ok) {
        const ttData = await ttRes.json();
        setTimetable(ttData.timetable || []);
      }
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubjects(subData.subjects || []);
        if (subData.subjects?.length > 0 && !slotForm.subjectId) {
          setSlotForm((prev) => ({ ...prev, subjectId: subData.subjects[0]._id }));
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

    // Set today's day of week automatically
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = dayNames[new Date().getDay()];
    if (DAYS.includes(today)) {
      setActiveDay(today);
    }
  }, []);

  const currentDayEntry = timetable.find((t) => t.dayOfWeek === activeDay) || {
    dayOfWeek: activeDay,
    slots: [],
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.subjectId) {
      alert("Please select a subject or create one first in the Attendance tab");
      return;
    }

    const currentSlots = [...(currentDayEntry.slots || [])];
    currentSlots.push(slotForm);

    // Sort slots by startTime
    currentSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: activeDay,
        slots: currentSlots,
      }),
    });

    if (res.ok) {
      setShowAddModal(false);
      await fetchData();
    }
  };

  const handleDeleteSlot = async (index: number) => {
    const updatedSlots = [...(currentDayEntry.slots || [])];
    updatedSlots.splice(index, 1);

    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: activeDay,
        slots: updatedSlots,
      }),
    });

    if (res.ok) {
      await fetchData();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Dynamic Timetable
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Replace buried WhatsApp photos and lost screenshots with an active schedule
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class to {activeDay}</span>
        </button>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {DAYS.map((day) => {
          const count =
            timetable.find((t) => t.dayOfWeek === day)?.slots?.length || 0;
          const isSelected = activeDay === day;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{day}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isSelected
                    ? "bg-slate-700 text-slate-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slots for the selected day */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{activeDay}&apos;s Schedule</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {currentDayEntry.slots?.length || 0} scheduled sessions
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Loading timetable...
          </div>
        ) : !currentDayEntry.slots || currentDayEntry.slots.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No classes on {activeDay}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Enjoy your free day or add lectures/labs using the button above.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white"
            >
              Add First Period
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentDayEntry.slots.map((slot: any, idx: number) => {
              const sub = slot.subjectId;
              const typeBadge =
                slot.type === "lab"
                  ? "bg-purple-100 text-purple-800 border-purple-200"
                  : slot.type === "tutorial"
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : "bg-blue-100 text-blue-800 border-blue-200";

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 transition"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Time pill */}
                    <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0 min-w-[100px]">
                      <div className="text-xs font-black text-slate-900 font-mono">
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">
                        {slot.type}
                      </div>
                    </div>

                    {/* Subject details */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: sub?.color || "#2563eb" }}
                        />
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {sub?.code || "COURSE"}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeBadge}`}
                        >
                          {slot.type}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {sub?.name || "Subject Name"}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        {slot.room && (
                          <span className="flex items-center gap-1 font-mono">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {slot.room}
                          </span>
                        )}
                        {sub?.facultyName && <span>• {sub.facultyName}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <button
                      onClick={() => handleDeleteSlot(idx)}
                      title="Remove Slot"
                      className="text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-lg">
                Add Slot to {activeDay}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject
                </label>
                <select
                  required
                  value={slotForm.subjectId}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, subjectId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Select Subject
                  </option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={slotForm.startTime}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={slotForm.endTime}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room / Hall / Lab
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LT-102 or Lab-3"
                    value={slotForm.room}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, room: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Type
                  </label>
                  <select
                    value={slotForm.type}
                    onChange={(e: any) =>
                      setSlotForm({ ...slotForm, type: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  >
                    <option value="lecture">Lecture</option>
                    <option value="lab">Lab</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
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
                  Add Class Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
