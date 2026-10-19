import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// US-06: proteksi halaman admin. Semua rute /admin kecuali /admin/login
// wajib login. File ini bernama proxy.js (Next.js 16, pengganti middleware.js).
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Lewati proteksi untuk /admin/login
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Proteksi semua rute /admin
  if (pathname.startsWith("/admin")) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet, headers) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options);
            });
            // Terapkan cache headers agar CDN tidak menyimpan respons berisi sesi
            if (headers) {
              Object.entries(headers).forEach(([key, value]) => {
                supabaseResponse.headers.set(key, value);
              });
            }
          },
        },
      }
    );

    // getClaims() memverifikasi signature token, lebih aman dari getUser()
    // untuk proxy/middleware
    const { claims, error } = await supabase.auth.getClaims();

    if (error || !claims) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
