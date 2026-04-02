// proxy.ts — Basic Auth 認證代理：透過環境變數 BASIC_AUTH_USER/PASS 控制存取權限

import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [user, pass] = decoded.split(":");

      const validUser = process.env.BASIC_AUTH_USER || "admin";
      const validPass = process.env.BASIC_AUTH_PASS || "changeme";

      if (user === validUser && pass === validPass) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Progress Tracker"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health|api/logout).*)"],
};
