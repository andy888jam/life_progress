// login/page.tsx — 自訂登入頁面：帳號密碼表單，驗證後設定 session cookie

"use client";

import { useState } from "react";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });

      if (res.ok) {
        window.location.href = "/";
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#323238] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold uppercase tracking-[0.15em] text-[#f5f0eb]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Progress
          </h1>
          <span className="text-[#e4007c] text-xs uppercase tracking-[0.3em] font-light">
            Tracker
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[#a5a5ad]">
              Username
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="username"
              className="w-full px-4 py-3 bg-[#3b3b42] border border-[#5a5a63] text-[#f5f0eb] placeholder-[#6a6a72] focus:outline-none focus:border-[#e4007c] transition-colors text-sm"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[#a5a5ad]">
              Password
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-[#3b3b42] border border-[#5a5a63] text-[#f5f0eb] placeholder-[#6a6a72] focus:outline-none focus:border-[#e4007c] transition-colors text-sm"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="text-[#e4007c] text-xs uppercase tracking-wider">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#e4007c] hover:bg-[#ff3da1] text-white text-xs uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
