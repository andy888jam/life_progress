// db.ts — SQLite 資料庫初始化：建立 courses、progress_entries、sport_entries 表，自動遷移新欄位

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "progress_data.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS progress_entries (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      date TEXT NOT NULL,
      percentage REAL NOT NULL,
      comment TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sport_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      duration_minutes REAL NOT NULL,
      distance REAL,
      comment TEXT NOT NULL DEFAULT '',
      workout_category TEXT,
      workout_sets TEXT
    );
  `);

  // Migrate: add workout columns if missing
  const columns = db.prepare("PRAGMA table_info(sport_entries)").all() as Array<{ name: string }>;
  const colNames = columns.map((c) => c.name);
  if (!colNames.includes("workout_category")) {
    db.exec("ALTER TABLE sport_entries ADD COLUMN workout_category TEXT");
  }
  if (!colNames.includes("workout_sets")) {
    db.exec("ALTER TABLE sport_entries ADD COLUMN workout_sets TEXT");
  }
}
