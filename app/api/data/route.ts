// api/data/route.ts — REST API：GET 讀取全部資料、PUT 覆寫全部資料（SQLite 交易式同步）

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { AppData, Course, ProgressEntry, SportEntry, NoteEntry } from "@/app/types";

export async function GET() {
  const db = getDb();

  const courses = db.prepare("SELECT * FROM courses ORDER BY created_at").all() as Array<{
    id: string;
    name: string;
    created_at: string;
  }>;

  const entries = db.prepare("SELECT * FROM progress_entries ORDER BY date").all() as Array<{
    id: string;
    course_id: string;
    date: string;
    percentage: number;
    comment: string;
  }>;

  const sportEntries = db.prepare("SELECT * FROM sport_entries ORDER BY date DESC").all() as Array<{
    id: string;
    date: string;
    type: string;
    duration_minutes: number;
    distance: number | null;
    comment: string;
    workout_category: string | null;
    workout_sets: string | null;
  }>;

  const noteRows = db.prepare("SELECT * FROM notes ORDER BY date DESC").all() as Array<{
    id: string;
    date: string;
    content: string;
  }>;

  const data: AppData = {
    courses: courses.map((c) => ({
      id: c.id,
      name: c.name,
      createdAt: c.created_at,
      entries: entries
        .filter((e) => e.course_id === c.id)
        .map((e) => ({
          id: e.id,
          date: e.date,
          percentage: e.percentage,
          comment: e.comment,
        })),
    })),
    sportEntries: sportEntries.map((s) => ({
      id: s.id,
      date: s.date,
      type: s.type,
      durationMinutes: s.duration_minutes,
      distance: s.distance ?? undefined,
      comment: s.comment,
      workoutCategory: (s.workout_category as "Push" | "Pull" | "Legs") ?? undefined,
      workoutSets: s.workout_sets ? JSON.parse(s.workout_sets) : undefined,
    })),
    notes: noteRows.map((n) => ({
      id: n.id,
      date: n.date,
      content: n.content,
    })),
  };

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as AppData;

  if (!body || !Array.isArray(body.courses) || !Array.isArray(body.sportEntries)) {
    return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
  }

  const db = getDb();

  const syncData = db.transaction(() => {
    // Clear existing data
    db.prepare("DELETE FROM progress_entries").run();
    db.prepare("DELETE FROM courses").run();
    db.prepare("DELETE FROM sport_entries").run();
    db.prepare("DELETE FROM notes").run();

    // Insert courses and their entries
    const insertCourse = db.prepare(
      "INSERT INTO courses (id, name, created_at) VALUES (?, ?, ?)"
    );
    const insertEntry = db.prepare(
      "INSERT INTO progress_entries (id, course_id, date, percentage, comment) VALUES (?, ?, ?, ?, ?)"
    );
    const insertSport = db.prepare(
      "INSERT INTO sport_entries (id, date, type, duration_minutes, distance, comment, workout_category, workout_sets) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const insertNote = db.prepare(
      "INSERT INTO notes (id, date, content) VALUES (?, ?, ?)"
    );

    for (const course of body.courses) {
      insertCourse.run(course.id, course.name, course.createdAt);
      for (const entry of course.entries) {
        insertEntry.run(entry.id, course.id, entry.date, entry.percentage, entry.comment);
      }
    }

    for (const sport of body.sportEntries) {
      insertSport.run(
        sport.id,
        sport.date,
        sport.type,
        sport.durationMinutes,
        sport.distance ?? null,
        sport.comment,
        sport.workoutCategory ?? null,
        sport.workoutSets ? JSON.stringify(sport.workoutSets) : null
      );
    }

    for (const note of (body.notes || [])) {
      insertNote.run(note.id, note.date, note.content);
    }
  });

  syncData();

  return NextResponse.json({ success: true });
}
