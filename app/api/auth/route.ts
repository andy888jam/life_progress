// api/auth/route.ts — 認證 API：驗證帳密並設定 session cookie（HMAC 簽章）

import { NextResponse } from "next/server";
import crypto from "crypto";

function getSecret() {
  return process.env.BASIC_AUTH_PASS || "changeme";
}

function createToken(user: string): string {
  const payload = `${user}:${Date.now()}`;
  const hmac = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}:${hmac}`).toString("base64");
}

export function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const parts = decoded.split(":");
    if (parts.length < 3) return false;

    const user = parts[0];
    const timestamp = parts[1];
    const signature = parts.slice(2).join(":");

    // Check signature
    const expected = crypto.createHmac("sha256", getSecret()).update(`${user}:${timestamp}`).digest("hex");
    if (signature !== expected) return false;

    // Check expiry (30 days)
    const age = Date.now() - Number(timestamp);
    if (age > 30 * 24 * 60 * 60 * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { user, pass } = body;

  const validUser = process.env.BASIC_AUTH_USER || "admin";
  const validPass = process.env.BASIC_AUTH_PASS || "changeme";

  if (user !== validUser || pass !== validPass) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = createToken(user);

  const response = NextResponse.json({ success: true });
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return response;
}
