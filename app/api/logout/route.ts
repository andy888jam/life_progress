// api/logout/route.ts — 登出端點：清除 session cookie 並導向登入頁

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Use x-forwarded-host/proto for proper external URL behind reverse proxy
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || "http";
  const response = NextResponse.redirect(`${proto}://${host}/login`);
  response.cookies.set("session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
