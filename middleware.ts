import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

const PUBLIC_ROUTES = ["/", "/about", "/contact", "/login", "/register", "/tutors"];
const STUDENT_ROUTES = ["/dashboard", "/assessment", "/counselling", "/chat", "/courses"];
const EXPERT_ROUTES = ["/expert"];
const ADMIN_ROUTES = ["/admin"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const path = request.nextUrl.pathname;

  const isPublic = PUBLIC_ROUTES.some(
    (r) => path === r || path.startsWith("/api/")
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase unreachable — allow public routes, gate protected ones
    if (!isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", path);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  if (user) {
    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      const role = roleData?.role;

      if (path === "/login" || path === "/register") {
        const destination = role === "expert"
          ? "/expert/dashboard"
          : role === "admin"
          ? "/admin/dashboard"
          : "/dashboard";
        return NextResponse.redirect(new URL(destination, request.url));
      }

      const isExpertRoute = EXPERT_ROUTES.some((r) => path.startsWith(r));
      const isAdminRoute = ADMIN_ROUTES.some((r) => path.startsWith(r));

      if (isExpertRoute && role !== "expert" && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      if (isAdminRoute && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      // Role lookup failed — let the request through, page-level auth will handle it
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
