// NoteTracker.tsx — 筆記元件：Log/Notes 子標籤，記錄任意文字筆記

"use client";

import { useState } from "react";
import type { AppData, NoteEntry } from "./types";

interface Props {
  data: AppData;
  save: (newData: AppData) => void;
  isLoaded: boolean;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

export default function NoteTracker({ data, save, isLoaded }: Props) {
  const [subTab, setSubTab] = useState<"log" | "notes">("log");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  function addNote() {
    if (!content.trim()) return;
    const entry: NoteEntry = {
      id: generateId(),
      date: getTodayString(),
      content: content.trim(),
    };
    save({ ...data, notes: [...data.notes, entry] });
    setContent("");
  }

  function deleteNote(id: string) {
    save({ ...data, notes: data.notes.filter((n) => n.id !== id) });
  }

  function startEdit(note: NoteEntry) {
    setEditingId(note.id);
    setEditContent(note.content);
  }

  function saveEdit() {
    if (!editingId || !editContent.trim()) return;
    save({
      ...data,
      notes: data.notes.map((n) =>
        n.id === editingId ? { ...n, content: editContent.trim() } : n
      ),
    });
    setEditingId(null);
    setEditContent("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
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

  const notes = [...data.notes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Sub-tabs */}
        <div className="flex gap-0 border-b border-[#5a5a63]">
          {(["log", "notes"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors border-b-2 cursor-pointer ${
                subTab === tab
                  ? "border-[#e4007c] text-[#e4007c]"
                  : "border-transparent text-[#a5a5ad] hover:text-[#f5f0eb]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ===== LOG TAB ===== */}
        {subTab === "log" && (
          <div className="border border-[#5a5a63] bg-[#3b3b42] p-4 sm:p-6">
            <h3 className="text-xs uppercase tracking-[0.3em] text-[#a5a5ad] mb-6">
              Write a Note
            </h3>
            <div className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write anything here..."
                rows={6}
                className="w-full px-4 py-3 bg-[#323238] border border-[#5a5a63] text-[#f5f0eb] placeholder-[#6a6a72] focus:outline-none focus:border-[#e4007c] transition-colors text-sm resize-none leading-relaxed"
              />
              <button
                onClick={addNote}
                disabled={!content.trim()}
                className={`px-6 py-2.5 text-xs uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer ${
                  content.trim()
                    ? "bg-[#e4007c] hover:bg-[#ff3da1] text-white"
                    : "bg-[#5a5a63] text-[#6a6a72] cursor-not-allowed"
                }`}
              >
                Save Note
              </button>
            </div>
          </div>
        )}

        {/* ===== NOTES TAB ===== */}
        {subTab === "notes" && (
          <div>
            <h3 className="text-xs uppercase tracking-[0.3em] text-[#a5a5ad] mb-6">
              Notes
            </h3>
            {notes.length === 0 ? (
              <p className="text-sm text-[#6a6a72] text-center py-12 italic">
                No notes yet. Write your first note in the Log tab.
              </p>
            ) : (
              <div className="space-y-[1px]">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 sm:p-5 bg-[#3b3b42] border border-[#5a5a63] hover:border-[#6a6a72] transition-colors"
                  >
                    {editingId === note.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 bg-[#323238] border border-[#5a5a63] text-[#f5f0eb] text-sm focus:outline-none focus:border-[#e4007c] resize-none leading-relaxed"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] bg-[#e4007c] hover:bg-[#ff3da1] text-white transition-colors cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] border border-[#5a5a63] text-[#a5a5ad] hover:border-[#e4007c] hover:text-[#e4007c] transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4 sm:gap-6">
                        <div className="shrink-0 text-center min-w-[40px] sm:min-w-[48px]">
                          <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#a5a5ad]">
                            {new Date(note.date).toLocaleDateString("en-US", {
                              month: "short",
                            })}
                          </div>
                          <div
                            className="text-xl sm:text-2xl font-bold"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {new Date(note.date).getDate()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#f5f0eb] whitespace-pre-wrap leading-relaxed">
                            {note.content}
                          </p>
                        </div>
                        <div className="shrink-0 flex flex-col gap-2">
                          <button
                            onClick={() => startEdit(note)}
                            className="text-[#6a6a72] hover:text-[#00b4d8] transition-colors cursor-pointer"
                            title="Edit note"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="text-[#6a6a72] hover:text-[#e4007c] transition-colors cursor-pointer"
                            title="Delete note"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
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
