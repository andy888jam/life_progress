// api/logout/route.ts — 登出端點：回傳 401 強制瀏覽器清除 Basic Auth 認證快取

import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Logged out</title></head>
<body style="background:#323238;color:#f5f0eb;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
<div style="text-align:center">
<h2>Logged Out</h2>
<p>Close this tab or <a href="/" style="color:#e4007c">click here to log in again</a>.</p>
</div>
</body>
</html>`,
    {
      status: 401,
      headers: {
        "Content-Type": "text/html",
        "WWW-Authenticate": 'Basic realm="Progress Tracker"',
      },
    }
  );
}
