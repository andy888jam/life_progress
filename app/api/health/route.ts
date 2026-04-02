// api/health/route.ts — 健康檢查端點：Railway healthcheck 用，不需認證

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
