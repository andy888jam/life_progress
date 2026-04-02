// comparison/page.tsx — 課程比較頁：多課程進度折線圖疊加比較

"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useLocalStorage } from "../useLocalStorage";

const COURSE_COLORS = [
  "#e4007c", "#00b4d8", "#fbbf24", "#34d399", "#a78bfa",
  "#f97316", "#ec4899", "#14b8a6", "#8b5cf6", "#ef4444",
];

export default function ComparisonPage() {
  const { data, isLoaded } = useLocalStorage();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#323238]">
        <p className="text-[#a5a5ad] uppercase tracking-[0.3em] text-sm font-light">
          Loading...
        </p>
      </div>
    );
  }

  const coursesWithEntries = data.courses.filter((c) => c.entries.length > 0);

  const comparisonData = (() => {
    if (coursesWithEntries.length < 2) return [];
    const allDates = new Set<string>();
    coursesWithEntries.forEach((c) =>
      c.entries.forEach((e) => allDates.add(e.date))
    );
    const sortedDates = [...allDates].sort();
    return sortedDates.map((date) => {
      const point: Record<string, string | number> = { date };
      coursesWithEntries.forEach((c) => {
        const entry = c.entries.find((e) => e.date === date);
        if (entry) point[c.name] = entry.percentage;
      });
      return point;
    });
  })();

  return (
    <div className="min-h-screen bg-[#323238] text-[#f5f0eb]">
      {/* Header */}
      <header className="border-b border-[#5a5a63]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-[#a5a5ad] hover:text-[#f5f0eb] transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </a>
            <h1
              className="text-2xl md:text-3xl font-bold uppercase tracking-[0.15em]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Compare
            </h1>
            <span className="text-[#e4007c] text-xs uppercase tracking-[0.3em] font-light mt-1">
              All Courses
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {coursesWithEntries.length < 2 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2
                className="text-3xl md:text-5xl font-bold uppercase tracking-[0.1em] mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Need More
                <br />
                <span className="text-[#e4007c] italic">Data</span>
              </h2>
              <p className="text-[#a5a5ad] text-sm uppercase tracking-[0.3em] font-light">
                Log progress in at least 2 courses to compare
              </p>
              <a
                href="/"
                className="inline-block mt-8 px-8 py-3 bg-[#e4007c] hover:bg-[#ff3da1] text-white text-xs uppercase tracking-[0.2em] transition-all duration-300"
              >
                Back to Tracker
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Course Legend */}
            <div className="flex flex-wrap gap-4">
              {coursesWithEntries.map((course, idx) => (
                <div key={course.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3"
                    style={{
                      backgroundColor:
                        COURSE_COLORS[idx % COURSE_COLORS.length],
                    }}
                  />
                  <span className="text-sm">{course.name}</span>
                  <span className="text-xs text-[#a5a5ad]">
                    ({course.entries.length} logs)
                  </span>
                </div>
              ))}
            </div>

            {/* Main Comparison Chart */}
            <div className="border border-[#5a5a63] bg-[#3b3b42] p-6">
              <h3 className="text-xs uppercase tracking-[0.3em] text-[#a5a5ad] mb-6">
                Progress Comparison
              </h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData}>
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
                      contentStyle={{
                        backgroundColor: "#46464e",
                        border: "1px solid #5a5a63",
                        borderRadius: "0",
                        color: "#f5f0eb",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: "11px",
                        paddingTop: "12px",
                      }}
                    />
                    {coursesWithEntries.map((course, idx) => (
                      <Line
                        key={course.id}
                        type="monotone"
                        dataKey={course.name}
                        stroke={COURSE_COLORS[idx % COURSE_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Course Summary Cards */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-[#a5a5ad] mb-6">
                Course Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coursesWithEntries.map((course, idx) => {
                  const sorted = [...course.entries].sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  );
                  const latest = sorted[0]?.percentage ?? 0;
                  const first = [...course.entries].sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )[0]?.percentage ?? 0;
                  const gain = latest - first;

                  return (
                    <div
                      key={course.id}
                      className="border border-[#5a5a63] bg-[#3b3b42] p-5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-2.5 h-2.5"
                          style={{
                            backgroundColor:
                              COURSE_COLORS[idx % COURSE_COLORS.length],
                          }}
                        />
                        <p className="text-sm font-medium truncate">
                          {course.name}
                        </p>
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <span
                          className="text-3xl font-bold"
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            color:
                              latest === 100
                                ? "#00e49c"
                                : COURSE_COLORS[idx % COURSE_COLORS.length],
                          }}
                        >
                          {latest}%
                        </span>
                        {gain !== 0 && (
                          <span
                            className={`text-xs mb-1 ${
                              gain > 0 ? "text-[#00e49c]" : "text-[#ef4444]"
                            }`}
                          >
                            {gain > 0 ? "+" : ""}
                            {gain}%
                          </span>
                        )}
                      </div>
                      <div className="h-[2px] bg-[#5a5a63] overflow-hidden mb-2">
                        <div
                          className="h-full transition-all duration-700"
                          style={{
                            width: `${latest}%`,
                            backgroundColor:
                              latest === 100
                                ? "#00e49c"
                                : COURSE_COLORS[idx % COURSE_COLORS.length],
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-[#a5a5ad] uppercase tracking-[0.2em]">
                        {course.entries.length} log
                        {course.entries.length !== 1 ? "s" : ""} · Started{" "}
                        {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
