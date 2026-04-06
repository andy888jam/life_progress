// page.tsx — 主頁面：Course/Sport 頂部標籤切換、匯出匯入按鈕、比較頁連結

"use client";

import { useState, useRef } from "react";
import ProgressTracker from "./ProgressTracker";
import SportTracker from "./SportTracker";
import NoteTracker from "./NoteTracker";
import { useLocalStorage } from "./useLocalStorage";

type Tab = "course" | "sport" | "note";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("course");
  const { exportToJson, importFromJson, data, save, isLoaded } = useLocalStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImport() {
    fileInputRef.current?.click();
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      importFromJson(file);
    }
    e.target.value = "";
  }

  function handleLogout() {
    window.location.href = "/api/logout";
  }

  return (
    <div className="min-h-screen bg-[#323238] text-[#f5f0eb]">
      {/* Header */}
      <header className="border-b border-[#5a5a63]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <h1
              className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-[0.15em]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Progress
            </h1>
            <span className="text-[#e4007c] text-xs uppercase tracking-[0.3em] font-light mt-1">
              Tracker
            </span>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {activeTab === "course" && data.courses.length >= 2 && (
              <a
                href="/comparison"
                className="px-3 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs uppercase tracking-[0.2em] border border-[#5a5a63] hover:border-[#e4007c] hover:text-[#e4007c] text-[#a5a5ad] transition-all duration-300"
              >
                Compare
              </a>
            )}
            <button
              onClick={exportToJson}
              className="px-3 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs uppercase tracking-[0.2em] border border-[#5a5a63] hover:border-[#e4007c] hover:text-[#e4007c] text-[#a5a5ad] transition-all duration-300 cursor-pointer"
            >
              Export
            </button>
            <button
              onClick={handleImport}
              className="px-3 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs uppercase tracking-[0.2em] bg-[#e4007c] hover:bg-[#ff3da1] text-white transition-all duration-300 cursor-pointer"
            >
              Import
            </button>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs uppercase tracking-[0.2em] border border-[#5a5a63] hover:border-red-500 hover:text-red-500 text-[#a5a5ad] transition-all duration-300 cursor-pointer"
            >
              Logout
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={onFileSelected}
              className="hidden"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab("course")}
              className={`px-6 py-3 text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 border-b-2 cursor-pointer ${
                activeTab === "course"
                  ? "border-[#e4007c] text-[#f5f0eb]"
                  : "border-transparent text-[#a5a5ad] hover:text-[#f5f0eb]"
              }`}
            >
              Course
            </button>
            <button
              onClick={() => setActiveTab("sport")}
              className={`px-6 py-3 text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 border-b-2 cursor-pointer ${
                activeTab === "sport"
                  ? "border-[#e4007c] text-[#f5f0eb]"
                  : "border-transparent text-[#a5a5ad] hover:text-[#f5f0eb]"
              }`}
            >
              Sport
            </button>
            <button
              onClick={() => setActiveTab("note")}
              className={`px-6 py-3 text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 border-b-2 cursor-pointer ${
                activeTab === "note"
                  ? "border-[#e4007c] text-[#f5f0eb]"
                  : "border-transparent text-[#a5a5ad] hover:text-[#f5f0eb]"
              }`}
            >
              Note
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      {activeTab === "course" && <ProgressTracker data={data} save={save} isLoaded={isLoaded} />}
      {activeTab === "sport" && <SportTracker data={data} save={save} isLoaded={isLoaded} />}
      {activeTab === "note" && <NoteTracker data={data} save={save} isLoaded={isLoaded} />}
    </div>
  );
}

