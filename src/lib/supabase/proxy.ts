
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });

          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        },
      },
    }
  );


  const { data, error } = await supabase.auth.getClaims();

  const isAuthenticated = !error && Boolean(data?.claims);

  const pathname = request.nextUrl.pathname;

  const protectedRoutes = [
    "/",
    "/tasks",
    "/shop",
    "/avatar",
    "/profile",
  ];

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route ||
      (route !== "/" && pathname.startsWith(`${route}/`))
  );

  const isAuthRoute =
    pathname === "/login" || pathname === "/signup";

  let redirectTo: string | null = null;

  if (!isAuthenticated && isProtectedRoute) {
    redirectTo = "/login";
  }

  if (isAuthenticated && isAuthRoute) {
    redirectTo = "/";
  }

  if (redirectTo) {
    const url = request.nextUrl.clone();
    url.pathname = redirectTo;
    url.search = "";

    const response = NextResponse.redirect(url);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });

    for (const header of [
      "cache-control",
      "expires",
      "pragma",
    ]) {
      const value = supabaseResponse.headers.get(header);

      if (value) {
        response.headers.set(header, value);
      }
    }

    return response;
  }

  return supabaseResponse;
}
