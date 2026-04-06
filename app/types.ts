// types.ts — TypeScript 介面定義：課程進度、運動紀錄、健身組數等資料結構

export interface ProgressEntry {
  id: string;
  date: string;
  percentage: number;
  comment: string;
}

export interface Course {
  id: string;
  name: string;
  createdAt: string;
  entries: ProgressEntry[];
}

export interface WorkoutSet {
  exercise: string;
  weight: number;
  sets: number;
  reps: number;
}

export interface SportEntry {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
  distance?: number;
  comment: string;
  workoutCategory?: "Push" | "Pull" | "Legs";
  workoutSets?: WorkoutSet[];
}

export interface AppData {
  courses: Course[];
  sportEntries: SportEntry[];
  notes: NoteEntry[];
}

export interface NoteEntry {
  id: string;
  date: string;
  content: string;
}
