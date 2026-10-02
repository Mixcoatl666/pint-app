import { NextResponse, type NextRequest } from "next/server";

/**
 * Comprobación optimista de sesión (RF-8): protege /create redirigiendo al
 * inicio de sesión si no hay cookie de sesión. La verificación real se hace
 * en la página y en cada Server Action con `await auth()`.
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtected =
    path === "/create" || path.startsWith("/create/") || path.startsWith("/create?");

  if (isProtected) {
    const hasSession =
      request.cookies.has("authjs.session-token") ||
      request.cookies.has("__Secure-authjs.session-token");

    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create"],
};
