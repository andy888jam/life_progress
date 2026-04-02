// useLocalStorage.ts — 資料存取 Hook：localStorage + API 雙向同步，支援 JSON 匯出匯入

"use client";

import { useState, useEffect, useCallback } from "react";
import type { AppData } from "./types";

const STORAGE_KEY = "udemy-progress-tracker";

const defaultData: AppData = { courses: [], sportEntries: [] };

async function fetchFromApi(): Promise<AppData | null> {
  try {
    const res = await fetch("/api/data");
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // API unavailable, fall back to localStorage
  }
  return null;
}

async function syncToApi(data: AppData): Promise<void> {
  try {
    await fetch("/api/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    // API unavailable, data is still in localStorage
  }
}

export function useLocalStorage() {
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      // Try API first, fall back to localStorage
      const apiData = await fetchFromApi();
      if (apiData && (apiData.courses.length > 0 || apiData.sportEntries.length > 0)) {
        setData(apiData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(apiData));
      } else {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            const localData: AppData = {
              courses: parsed.courses ?? [],
              sportEntries: parsed.sportEntries ?? [],
            };
            setData(localData);
            // Sync localStorage data up to the API
            syncToApi(localData);
          }
        } catch {
          // If parsing fails, use default data
        }
      }
      setIsLoaded(true);
    }
    load();
  }, []);

  const save = useCallback((newData: AppData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    syncToApi(newData);
  }, []);

  const exportToJson = useCallback(() => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "progress_data.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importFromJson = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string) as AppData;
          if (parsed && Array.isArray(parsed.courses)) {
            save(parsed);
          }
        } catch {
          alert("Invalid JSON file. Please select a valid progress_data.json file.");
        }
      };
      reader.readAsText(file);
    },
    [save]
  );

  return { data, save, exportToJson, importFromJson, isLoaded };
}
