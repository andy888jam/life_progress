// proxy.ts — 認證代理：檢查 session cookie，未登入導向 /login

import { NextRequest, NextResponse } from "next/server";

function getSecret() {
  return process.env.BASIC_AUTH_PASS || "changeme";
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const decoded = atob(token);
    const parts = decoded.split(":");
    if (parts.length < 3) return false;

    const user = parts[0];
    const timestamp = parts[1];
    const signature = parts.slice(2).join(":");

    // HMAC-SHA256 using Web Crypto API (Edge compatible)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(getSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(`${user}:${timestamp}`));
    const expected = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (signature !== expected) return false;

    const age = Date.now() - Number(timestamp);
    if (age > 30 * 24 * 60 * 60 * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  if (session && (await verifyToken(session))) {
    return NextResponse.next();
  }

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return NextResponse.redirect(`${proto}://${host}/login`);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health|api/auth|api/logout|login).*)"],
};
