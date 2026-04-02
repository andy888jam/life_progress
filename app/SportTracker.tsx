// SportTracker.tsx — 運動追蹤元件：Log/Dashboard/History 子標籤、健身 Push/Pull/Legs 記錄、週間圖表

"use client";

import { useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useLocalStorage } from "./useLocalStorage";
import type { SportEntry, WorkoutSet } from "./types";

const SPORT_TYPES = [
  "Running",
  "Cycling",
  "Swimming",
  "Workout",
  "Yoga",
  "Walking",
  "Hiking",
  "Basketball",
  "Tennis",
  "Other",
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const TYPE_COLORS: Record<string, string> = {
  Running: "#e4007c",
  Cycling: "#00b4d8",
  Swimming: "#34d399",
  Workout: "#fbbf24",
  Yoga: "#a78bfa",
  Walking: "#f97316",
  Hiking: "#14b8a6",
  Basketball: "#ec4899",
  Tennis: "#8b5cf6",
  Other: "#6b7280",
};

const EXERCISES_BY_CATEGORY: Record<string, string[]> = {
  Push: [
    "Bench Press",
    "Incline Bench Press",
    "Dumbbell Press",
    "Overhead Press",
    "Dumbbell Shoulder Press",
    "Dips",
    "Tricep Pushdown",
    "Lateral Raise",
    "Cable Fly",
    "Push-Up",
    "Other",
  ],
  Pull: [
    "Deadlift",
    "Pull-Up",
    "Chin-Up",
    "Barbell Row",
    "Dumbbell Row",
    "Lat Pulldown",
    "Seated Cable Row",
    "Face Pull",
    "Bicep Curl",
    "Hammer Curl",
    "Other",
  ],
  Legs: [
    "Squat",
    "Front Squat",
    "Leg Press",
    "Romanian Deadlift",
    "Lunges",
    "Bulgarian Split Squat",
    "Leg Extension",
    "Leg Curl",
    "Hip Thrust",
    "Calf Raise",
    "Other",
  ],
};

export default function SportTracker() {
  const { data, save, isLoaded } = useLocalStorage();
  const [sportType, setSportType] = useState(SPORT_TYPES[0]);
  const [customType, setCustomType] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [distance, setDistance] = useState("");
  const [comment, setComment] = useState("");
  const [logDate, setLogDate] = useState(getTodayString());
  const [weekOffset, setWeekOffset] = useState(0);
  const [sportSubTab, setSportSubTab] = useState<"log" | "dashboard" | "history">("log");
  const [workoutExerciseFilter, setWorkoutExerciseFilter] = useState("");
  const [workoutCategory, setWorkoutCategory] = useState<"Push" | "Pull" | "Legs">("Push");
  const [workoutSets, setWorkoutSets] = useState<WorkoutSet[]>([
    { exercise: "", weight: 0, sets: 0, reps: 0 },
  ]);

  function updateWorkoutSet(index: number, field: keyof WorkoutSet, value: string | number) {
    setWorkoutSets((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, [field]: typeof s[field] === "number" ? Number(value) : value } : s
      )
    );
  }

  function addWorkoutSetRow() {
    setWorkoutSets((prev) => [...prev, { exercise: "", weight: 0, sets: 0, reps: 0 }]);
  }

  function removeWorkoutSetRow(index: number) {
    setWorkoutSets((prev) => prev.filter((_, i) => i !== index));
  }

  function addSportEntry() {
    const dur = Number(durationMinutes);
    if (isNaN(dur) || dur <= 0) {
      alert("Please enter a valid duration in minutes.");
      return;
    }
    const type = sportType === "Other" && customType.trim() ? customType.trim() : sportType;
    const dist = distance ? Number(distance) : undefined;
    const entry: SportEntry = {
      id: generateId(),
      date: logDate,
      type,
      durationMinutes: dur,
      distance: dist && !isNaN(dist) ? dist : undefined,
      comment: comment.trim(),
      ...(type === "Workout"
        ? {
            workoutCategory,
            workoutSets: workoutSets.filter((s) => s.exercise.trim()),
          }
        : {}),
    };
    save({ ...data, sportEntries: [...data.sportEntries, entry] });
    setDurationMinutes("");
    setDistance("");
    setComment("");
    setLogDate(getTodayString());
    setWorkoutSets([{ exercise: "", weight: 0, sets: 0, reps: 0 }]);
  }

  function deleteEntry(entryId: string) {
    save({
      ...data,
      sportEntries: data.sportEntries.filter((e) => e.id !== entryId),
    });
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#a5a5ad] uppercase tracking-[0.3em] text-sm font-light">
          Loading...
        </p>
      </div>
    );
  }

  const entries = data.sportEntries;

  // Weekly summary for the bar chart (7-day window with offset)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7 - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const weeklyData = last7Days.map((date) => {
    const dayEntries = entries.filter((e) => e.date === date);
    const row: Record<string, string | number> = {
      date: new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    };
    dayEntries.forEach((e) => {
      row[e.type] = ((row[e.type] as number) || 0) + e.durationMinutes;
    });
    return row;
  });

  // Collect unique sport types present in the current week
  const weekSportTypes = Array.from(
    new Set(
      entries
        .filter((e) => last7Days.includes(e.date))
        .map((e) => e.type)
    )
  );

  // Activity breakdown
  const typeBreakdown = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + e.durationMinutes;
    return acc;
  }, {});

  const totalMinutes = entries.reduce((s, e) => s + e.durationMinutes, 0);
  const totalSessions = entries.length;
  const totalRunningKm = entries
    .filter((e) => e.type === "Running" && e.distance)
    .reduce((s, e) => s + (e.distance ?? 0), 0);

  // Workout progress: aggregate latest weight per exercise per category
  const workoutEntries = entries.filter(
    (e) => e.type === "Workout" && e.workoutSets && e.workoutSets.length > 0
  );
  const workoutProgressByCategory = (["Push", "Pull", "Legs"] as const).map((cat) => {
    const catEntries = workoutEntries
      .filter((e) => e.workoutCategory === cat)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const exerciseMap = new Map<string, { weight: number; sets: number; reps: number; date: string }>();
    for (const entry of catEntries) {
      for (const ws of entry.workoutSets!) {
        if (!exerciseMap.has(ws.exercise)) {
          exerciseMap.set(ws.exercise, { weight: ws.weight, sets: ws.sets, reps: ws.reps, date: entry.date });
        }
      }
    }
    return { category: cat, exercises: Array.from(exerciseMap.entries()) };
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
    <div className="space-y-8">
      {/* Sub-tabs */}
      <div className="flex gap-0 border-b border-[#5a5a63]">
        {(["log", "dashboard", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSportSubTab(tab)}
            className={`px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors border-b-2 cursor-pointer ${
              sportSubTab === tab
                ? "border-[#e4007c] text-[#e4007c]"
                : "border-transparent text-[#a5a5ad] hover:text-[#f5f0eb]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ===== LOG TAB ===== */}
      {sportSubTab === "log" && (
        <div className="border border-[#5a5a63] bg-[#3b3b42] p-6">
          <h3 className="text-xs uppercase tracking-[0.3em] text-[#a5a5ad] mb-6">
            Log Activity
          </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addSportEntry();
          }}
          className="space-y-5"
        >
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[#a5a5ad]">
                Date
              </label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#323238] border border-[#5a5a63] text-[#f5f0eb] focus:outline-none focus:border-[#e4007c] transition-colors text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[#a5a5ad]">
                Activity
              </label>
              <select
                value={sportType}
                onChange={(e) => setSportType(e.target.value)}
                className="w-full px-4 py-3 bg-[#323238] border border-[#5a5a63] text-[#f5f0eb] focus:outline-none focus:border-[#e4007c] transition-colors text-sm"
              >
                {SPORT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {sportType === "Other" && (
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[#a5a5ad]">
                Custom Activity Name
              </label>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="e.g. Rock Climbing"
                className="w-full px-4 py-3 bg-[#323238] border border-[#5a5a63] text-[#f5f0eb] placeholder-[#6a6a72] focus:outline-none focus:border-[#e4007c] transition-colors text-sm"
              />
            </div>
          )}
          {sportType === "Workout" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[#a5a5ad]">
                  Category
                </label>
                <div className="flex gap-2">
                  {(["Push", "Pull", "Legs"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setWorkoutCategory(cat)}
                      className={`flex-1 py-2.5 text-xs uppercase tracking-[0.2em] border transition-colors cursor-pointer ${
                        workoutCategory === cat
                          ? "bg-[#e4007c] border-[#e4007c] text-white"
                          : "bg-[#323238] border-[#5a5a63] text-[#a5a5ad] hover:border-[#e4007c]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[#a5a5ad]">
                  Exercises
                </label>
                <div className="border border-[#5a5a63] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#323238] text-[#a5a5ad] text-[10px] uppercase tracking-[0.2em]">
                        <th className="text-left px-3 py-2">Exercise</th>
                        <th className="text-center px-3 py-2 w-20">Weight</th>
                        <th className="text-center px-3 py-2 w-16">Sets</th>
                        <th className="text-center px-3 py-2 w-16">Reps</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {workoutSets.map((ws, i) => (
                        <tr key={i} className="border-t border-[#5a5a63]">
                          <td className="px-1 py-1">
                            <select
                              value={ws.exercise}
                              onChange={(e) => updateWorkoutSet(i, "exercise", e.target.value)}
                              className="w-full px-2 py-2 bg-transparent text-[#f5f0eb] focus:outline-none text-sm"
                            >
                              <option value="" className="bg-[#323238]">Select exercise</option>
                              {(EXERCISES_BY_CATEGORY[workoutCategory] || []).map((ex) => (
                                <option key={ex} value={ex} className="bg-[#323238]">{ex}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-1 py-1">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={ws.weight || ""}
                              onChange={(e) => updateWorkoutSet(i, "weight", e.target.value)}
                              placeholder="kg"
                              className="w-full px-2 py-2 bg-transparent text-[#f5f0eb] placeholder-[#6a6a72] focus:outline-none text-sm text-center"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <input
                              type="number"
                              min="0"
                              value={ws.sets || ""}
                              onChange={(e) => updateWorkoutSet(i, "sets", e.target.value)}
                              placeholder="0"
                              className="w-full px-2 py-2 bg-transparent text-[#f5f0eb] placeholder-[#6a6a72] focus:outline-none text-sm text-center"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <input
                              type="number"
                              min="0"
                              value={ws.reps || ""}
                              onChange={(e) => updateWorkoutSet(i, "reps", e.target.value)}
                              placeholder="0"
                              className="w-full px-2 py-2 bg-transparent text-[#f5f0eb] placeholder-[#6a6a72] focus:outline-none text-sm text-center"
                            />
                          </td>
                          <td className="px-1 py-1 text-center">
                            {workoutSets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeWorkoutSetRow(i)}
                                className="text-[#6a6a72] hover:text-[#e4007c] transition-colors cursor-pointer"
                              >
                                ×
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={addWorkoutSetRow}
                  className="mt-2 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] border border-[#5a5a63] text-[#a5a5ad] hover:border-[#e4007c] hover:text-[#e4007c] transition-colors cursor-pointer"
                >
                  + Add Exercise
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[#a5a5ad]">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="e.g. 30"
                className="w-full px-4 py-3 bg-[#323238] border border-[#5a5a63] text-[#f5f0eb] placeholder-[#6a6a72] focus:outline-none focus:border-[#e4007c] transition-colors text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[#a5a5ad]">
                Distance (km, optional)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="e.g. 5.0"
                className="w-full px-4 py-3 bg-[#323238] border border-[#5a5a63] text-[#f5f0eb] placeholder-[#6a6a72] focus:outline-none focus:border-[#e4007c] transition-colors text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[#a5a5ad]">
              Comment / Details
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did it go?"
              rows={3}
              className="w-full px-4 py-3 bg-[#323238] border border-[#5a5a63] text-[#f5f0eb] placeholder-[#6a6a72] focus:outline-none focus:border-[#e4007c] transition-colors text-sm resize-vertical"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3 bg-[#e4007c] hover:bg-[#ff3da1] text-white text-xs uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer"
          >
            Log Activity
          </button>
        </form>
      </div>
      )}

      {/* ===== DASHBOARD TAB ===== */}
      {sportSubTab === "dashboard" && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-[#5a5a63] bg-[#3b3b42] p-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#a5a5ad] mb-1">
                Total Time
              </p>
              <span
                className="text-3xl font-bold text-[#e4007c]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {formatDuration(totalMinutes)}
              </span>
            </div>
            <div className="border border-[#5a5a63] bg-[#3b3b42] p-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#a5a5ad] mb-1">
                Running Total
              </p>
              <span
                className="text-3xl font-bold text-[#34d399]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {totalRunningKm.toFixed(1)} km
              </span>
            </div>
            <div className="border border-[#5a5a63] bg-[#3b3b42] p-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#a5a5ad] mb-1">
                Sessions
              </p>
              <span
                className="text-3xl font-bold text-[#00b4d8]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {totalSessions}
              </span>
            </div>
          </div>

          {/* Weekly Activity Chart */}
          {entries.length > 0 && (
            <div className="border border-[#5a5a63] bg-[#3b3b42] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs uppercase tracking-[0.3em] text-[#a5a5ad]">
                  {weekOffset === 0
                    ? "Last 7 Days"
                    : `${last7Days[0].slice(5)} — ${last7Days[6].slice(5)}`}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWeekOffset((o) => o - 1)}
                    className="w-7 h-7 flex items-center justify-center border border-[#5a5a63] text-[#a5a5ad] hover:border-[#e4007c] hover:text-[#e4007c] transition-colors text-sm"
                  >
                    ←
                  </button>
                  {weekOffset !== 0 && (
                    <button
                      onClick={() => setWeekOffset(0)}
                      className="px-2 h-7 flex items-center justify-center border border-[#5a5a63] text-[#a5a5ad] hover:border-[#e4007c] hover:text-[#e4007c] transition-colors text-[10px] uppercase tracking-wider"
                    >
                      Today
                    </button>
                  )}
                  <button
                    onClick={() => setWeekOffset((o) => Math.min(o + 1, 0))}
                    disabled={weekOffset === 0}
                    className={`w-7 h-7 flex items-center justify-center border border-[#5a5a63] text-sm transition-colors ${
                      weekOffset === 0
                        ? "opacity-30 cursor-not-allowed text-[#a5a5ad]"
                        : "text-[#a5a5ad] hover:border-[#e4007c] hover:text-[#e4007c]"
                    }`}
                  >
                    →
                  </button>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#5a5a63" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#a5a5ad" }}
                      stroke="#5a5a63"
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#a5a5ad" }}
                      stroke="#5a5a63"
                      tickLine={false}
                      tickFormatter={(v) => `${v}m`}
                    />
                    <Tooltip
                      formatter={(value, name) => [`${value} min`, name]}
                      contentStyle={{
                        backgroundColor: "#46464e",
                        border: "1px solid #5a5a63",
                        borderRadius: "0",
                        color: "#f5f0eb",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "10px", letterSpacing: "0.1em" }}
                    />
                    {weekSportTypes.map((type) => (
                      <Bar
                        key={type}
                        dataKey={type}
                        stackId="a"
                        fill={TYPE_COLORS[type] || TYPE_COLORS.Other}
                        radius={[0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Activity Breakdown */}
          {Object.keys(typeBreakdown).length > 0 && (
            <div className="border border-[#5a5a63] bg-[#3b3b42] p-6">
              <h3 className="text-xs uppercase tracking-[0.3em] text-[#a5a5ad] mb-4">
                Activity Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(typeBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, minutes]) => (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{type}</span>
                        <span className="text-[#a5a5ad]">
                          {formatDuration(minutes)}
                        </span>
                      </div>
                      <div className="h-[3px] bg-[#5a5a63] overflow-hidden">
                        <div
                          className="h-full transition-all duration-700"
                          style={{
                            width: `${(minutes / totalMinutes) * 100}%`,
                            backgroundColor:
                              TYPE_COLORS[type] || TYPE_COLORS.Other,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Workout Progress Table */}
          {workoutProgressByCategory.some((c) => c.exercises.length > 0) && (
            <div className="border border-[#5a5a63] bg-[#3b3b42] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs uppercase tracking-[0.3em] text-[#a5a5ad]">
                  Workout Progress
                </h3>
                <select
                  value={workoutExerciseFilter}
                  onChange={(e) => setWorkoutExerciseFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#323238] border border-[#5a5a63] text-[#f5f0eb] text-xs focus:outline-none focus:border-[#e4007c] transition-colors"
                >
                  <option value="">All Exercises</option>
                  {Array.from(
                    new Set(
                      workoutProgressByCategory.flatMap((c) =>
                        c.exercises.map(([name]) => name)
                      )
                    )
                  )
                    .sort()
                    .map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-6">
                {workoutProgressByCategory
                  .map(({ category, exercises }) => ({
                    category,
                    exercises: workoutExerciseFilter
                      ? exercises.filter(([name]) => name === workoutExerciseFilter)
                      : exercises,
                  }))
                  .filter((c) => c.exercises.length > 0)
                  .map(({ category, exercises }) => (
                    <div key={category}>
                      <h4 className="text-xs uppercase tracking-[0.2em] text-[#fbbf24] mb-3">
                        {category} Day
                      </h4>
                      <div className="border border-[#5a5a63] overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[#323238] text-[#a5a5ad] text-[10px] uppercase tracking-[0.2em]">
                              <th className="text-left px-3 py-2">Exercise</th>
                              <th className="text-center px-3 py-2 w-20">Weight</th>
                              <th className="text-center px-3 py-2 w-16">Sets</th>
                              <th className="text-center px-3 py-2 w-16">Reps</th>
                              <th className="text-right px-3 py-2 w-24">Last Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {exercises.map(([exercise, info]) => (
                              <tr key={exercise} className="border-t border-[#5a5a63]">
                                <td className="px-3 py-2 text-[#f5f0eb]">{exercise}</td>
                                <td className="px-3 py-2 text-center text-[#fbbf24] font-bold">{info.weight}kg</td>
                                <td className="px-3 py-2 text-center text-[#a5a5ad]">{info.sets}</td>
                                <td className="px-3 py-2 text-center text-[#a5a5ad]">{info.reps}</td>
                                <td className="px-3 py-2 text-right text-[#a5a5ad] text-xs">{info.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== HISTORY TAB ===== */}
      {sportSubTab === "history" && (
      <div>
        <h3 className="text-xs uppercase tracking-[0.3em] text-[#a5a5ad] mb-6">
          History
        </h3>
        {entries.length === 0 ? (
          <p className="text-sm text-[#6a6a72] text-center py-12 italic">
            No activities logged yet. Start tracking above.
          </p>
        ) : (
          <div className="space-y-[1px]">
            {[...entries]
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-6 p-5 bg-[#3b3b42] border border-[#5a5a63] hover:border-[#6a6a72] transition-colors"
                >
                  <div className="shrink-0 text-center min-w-[48px]">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#a5a5ad]">
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {new Date(entry.date).getDate()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            TYPE_COLORS[entry.type] || TYPE_COLORS.Other,
                        }}
                      />
                      <span className="text-sm font-medium">{entry.type}</span>
                      {entry.workoutCategory && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-[#5a5a63] text-[#f5f0eb]">
                          {entry.workoutCategory}
                        </span>
                      )}
                      <span
                        className="text-sm font-bold"
                        style={{
                          color:
                            TYPE_COLORS[entry.type] || TYPE_COLORS.Other,
                        }}
                      >
                        {formatDuration(entry.durationMinutes)}
                      </span>
                      {entry.distance && (
                        <span className="text-xs text-[#a5a5ad]">
                          · {entry.distance} km
                        </span>
                      )}
                    </div>
                    {entry.workoutSets && entry.workoutSets.length > 0 && (
                      <div className="mt-2 border border-[#5a5a63] overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-[#323238] text-[#a5a5ad] text-[9px] uppercase tracking-[0.15em]">
                              <th className="text-left px-2 py-1.5">Exercise</th>
                              <th className="text-center px-2 py-1.5 w-16">Weight</th>
                              <th className="text-center px-2 py-1.5 w-12">Sets</th>
                              <th className="text-center px-2 py-1.5 w-12">Reps</th>
                            </tr>
                          </thead>
                          <tbody>
                            {entry.workoutSets.map((ws, i) => (
                              <tr key={i} className="border-t border-[#5a5a63]">
                                <td className="px-2 py-1.5 text-[#f5f0eb]">{ws.exercise}</td>
                                <td className="px-2 py-1.5 text-center text-[#a5a5ad]">{ws.weight}kg</td>
                                <td className="px-2 py-1.5 text-center text-[#a5a5ad]">{ws.sets}</td>
                                <td className="px-2 py-1.5 text-center text-[#a5a5ad]">{ws.reps}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {entry.comment && (
                      <p className="text-sm text-[#a5a5ad] mt-1 whitespace-pre-wrap leading-relaxed">
                        {entry.comment}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="shrink-0 text-[#6a6a72] hover:text-[#e4007c] transition-colors cursor-pointer"
                    title="Delete entry"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
      )}
    </div>
    </div>
  );
}
