// ProgressTracker.tsx — 課程追蹤元件：課程列表、每日進度記錄、趨勢圖表、評論區

"use client";

import { useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useLocalStorage } from "./useLocalStorage";
import type { Course, ProgressEntry } from "./types";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function getLatestProgress(course: Course): number {
  if (course.entries.length === 0) return 0;
  const sorted = [...course.entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sorted[0].percentage;
}

export default function ProgressTracker() {
  const { data, save, isLoaded } =
    useLocalStorage();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [newCourseName, setNewCourseName] = useState("");
  const [logPercentage, setLogPercentage] = useState("");
  const [logComment, setLogComment] = useState("");
  const [logDate, setLogDate] = useState(getTodayString());

  const selectedCourse = data.courses.find((c) => c.id === selectedCourseId);

  function addCourse() {
    const name = newCourseName.trim();
    if (!name) return;
    const newCourse: Course = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
      entries: [],
    };
    save({ ...data, courses: [...data.courses, newCourse] });
    setNewCourseName("");
    setSelectedCourseId(newCourse.id);
  }

  function deleteCourse(courseId: string) {
    if (!confirm("Are you sure you want to delete this course?")) return;
    const updated = data.courses.filter((c) => c.id !== courseId);
    save({ ...data, courses: updated });
    if (selectedCourseId === courseId) {
      setSelectedCourseId(null);
    }
  }

  function addEntry() {
    if (!selectedCourse) return;
    const pct = Number(logPercentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      alert("Please enter a valid percentage between 0 and 100.");
      return;
    }
    const entry: ProgressEntry = {
      id: generateId(),
      date: logDate,
      percentage: pct,
      comment: logComment.trim(),
    };
    const updatedCourses = data.courses.map((c) =>
      c.id === selectedCourse.id
        ? { ...c, entries: [...c.entries, entry] }
        : c
    );
    save({ ...data, courses: updatedCourses });
    setLogPercentage("");
    setLogComment("");
    setLogDate(getTodayString());
  }

  function deleteEntry(entryId: string) {
    if (!selectedCourse) return;
    const updatedCourses = data.courses.map((c) =>
      c.id === selectedCourse.id
        ? { ...c, entries: c.entries.filter((e) => e.id !== entryId) }
        : c
    );
    save({ ...data, courses: updatedCourses });
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

  const chartData = selectedCourse
    ? [...selectedCourse.entries]
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        .map((e) => ({
          date: e.date,
          progress: e.percentage,
        }))
    : [];

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Sidebar - Course List */}
        <aside className="lg:w-80 shrink-0">
          <div className="mb-6">
            <h2 className="text-xs uppercase tracking-[0.3em] text-[#a5a5ad] mb-4">
              My Courses
            </h2>

            {/* Add Course */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addCourse();
              }}
              className="flex gap-2 mb-6"
            >
              <input
                type="text"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="Enter course name..."
                className="flex-1 px-4 py-3 text-sm bg-[#3b3b42] border border-[#5a5a63] text-[#f5f0eb] placeholder-[#6a6a72] focus:outline-none focus:border-[#e4007c] transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-[#e4007c] hover:bg-[#ff3da1] text-white text-xs uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>

          {/* Course List */}
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {data.courses.length === 0 && (
              <p className="text-sm text-[#6a6a72] text-center py-8 italic">
                No courses yet.
              </p>
            )}
            {data.courses.map((course) => {
              const progress = getLatestProgress(course);
              const isSelected = course.id === selectedCourseId;
              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`p-4 cursor-pointer transition-all duration-300 border ${
                    isSelected
                      ? "bg-[#46464e] border-[#e4007c]"
                      : "bg-[#3b3b42] border-[#5a5a63] hover:border-[#6a6a72]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {course.name}
                      </p>
                      <p className="text-xs text-[#a5a5ad] mt-1 uppercase tracking-wider">
                        {course.entries.length} log
                        {course.entries.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span
                        className={`text-xs font-bold ${
                          progress === 100
                            ? "text-[#00e49c]"
                            : "text-[#e4007c]"
                        }`}
                      >
                        {progress}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCourse(course.id);
                        }}
                        className="text-[#6a6a72] hover:text-[#e4007c] transition-colors cursor-pointer"
                        title="Delete course"
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
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-[2px] bg-[#5a5a63] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${
                        progress === 100 ? "bg-[#00e49c]" : "bg-[#e4007c]"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {!selectedCourse ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <h2
                  className="text-4xl md:text-6xl font-bold uppercase tracking-[0.1em] mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Start
                  <br />
                  <span className="text-[#e4007c] italic">Learning</span>
                </h2>
                <p className="text-[#a5a5ad] text-sm uppercase tracking-[0.3em] font-light">
                  Select a course or add a new one
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Course Header */}
              <div className="border-b border-[#5a5a63] pb-8">
                <p className="text-xs uppercase tracking-[0.3em] text-[#a5a5ad] mb-2">
                  Now Tracking
                </p>
                <h2
                  className="text-3xl md:text-4xl font-bold uppercase tracking-[0.05em] mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {selectedCourse.name}
                </h2>
                <p className="text-xs text-[#a5a5ad] uppercase tracking-[0.2em]">
                  Started{" "}
                  {new Date(selectedCourse.createdAt).toLocaleDateString()}
                </p>

                {/* Overall progress */}
                <div className="mt-6 flex items-end gap-4">
                  <span
                    className="text-6xl md:text-7xl font-bold leading-none"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color:
                        getLatestProgress(selectedCourse) === 100
                          ? "#00e49c"
                          : "#e4007c",
                    }}
                  >
                    {getLatestProgress(selectedCourse)}
                  </span>
                  <span className="text-2xl text-[#a5a5ad] font-light mb-2">
                    %
                  </span>
                </div>
                <div className="mt-3 h-[2px] bg-[#5a5a63] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      getLatestProgress(selectedCourse) === 100
                        ? "bg-[#00e49c]"
                        : "bg-[#e4007c]"
                    }`}
                    style={{
                      width: `${getLatestProgress(selectedCourse)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Progress Chart */}
              {chartData.length > 0 && (
                <div className="border border-[#5a5a63] bg-[#3b3b42] p-6">
                  <h3 className="text-xs uppercase tracking-[0.3em] text-[#a5a5ad] mb-6">
                    Progress Over Time
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="progressGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#e4007c"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#e4007c"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#5a5a63"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: "#a5a5ad" }}
                          stroke="#5a5a63"
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 10, fill: "#a5a5ad" }}
                          stroke="#5a5a63"
                          tickLine={false}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Progress"]}
                          contentStyle={{
                            backgroundColor: "#46464e",
                            border: "1px solid #5a5a63",
                            borderRadius: "0",
                            color: "#f5f0eb",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="progress"
                          stroke="#e4007c"
                          strokeWidth={2}
                          fill="url(#progressGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Log Progress Form */}
              <div className="border border-[#5a5a63] bg-[#3b3b42] p-6">
                <h3 className="text-xs uppercase tracking-[0.3em] text-[#a5a5ad] mb-6">
                  Log Progress
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addEntry();
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
                        Progress (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={logPercentage}
                        onChange={(e) => setLogPercentage(e.target.value)}
                        placeholder="0 — 100"
                        className="w-full px-4 py-3 bg-[#323238] border border-[#5a5a63] text-[#f5f0eb] placeholder-[#6a6a72] focus:outline-none focus:border-[#e4007c] transition-colors text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[#a5a5ad]">
                      Comment / Details
                    </label>
                    <textarea
                      value={logComment}
                      onChange={(e) => setLogComment(e.target.value)}
                      placeholder="What did you learn today?"
                      rows={3}
                      className="w-full px-4 py-3 bg-[#323238] border border-[#5a5a63] text-[#f5f0eb] placeholder-[#6a6a72] focus:outline-none focus:border-[#e4007c] transition-colors text-sm resize-vertical"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#e4007c] hover:bg-[#ff3da1] text-white text-xs uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer"
                  >
                    Log Entry
                  </button>
                </form>
              </div>

              {/* Progress History */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.3em] text-[#a5a5ad] mb-6">
                  History
                </h3>
                {selectedCourse.entries.length === 0 ? (
                  <p className="text-sm text-[#6a6a72] text-center py-12 italic">
                    No entries yet. Log your first progress above.
                  </p>
                ) : (
                  <div className="space-y-[1px]">
                    {[...selectedCourse.entries]
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start gap-6 p-5 bg-[#3b3b42] border border-[#5a5a63] hover:border-[#6a6a72] transition-colors"
                        >
                          <div className="shrink-0 text-center min-w-[48px]">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-[#a5a5ad]">
                              {new Date(entry.date).toLocaleDateString(
                                "en-US",
                                { month: "short" }
                              )}
                            </div>
                            <div
                              className="text-2xl font-bold"
                              style={{
                                fontFamily: "'Playfair Display', serif",
                              }}
                            >
                              {new Date(entry.date).getDate()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-sm font-bold ${
                                entry.percentage === 100
                                  ? "text-[#00e49c]"
                                  : "text-[#e4007c]"
                              }`}
                            >
                              {entry.percentage}%
                            </span>
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
            </div>
          )}
        </main>
      </div>
  );
}
