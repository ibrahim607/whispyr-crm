import { NextRequest, NextResponse } from "next/server";
import createServerSupabaseClient from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function proxy(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: user } = await supabase.auth.getUser();
  let profile = null;

  if (user?.user?.id) {
    profile = await prisma.profile.findUnique({
      where: {
        id: user.user.id
      }
    })
  }

  // Redirect to login if unauthenticated and trying to access protected routes
  if (!user.user && request.nextUrl.pathname !== "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if already authenticated and trying to access login
  if (user.user && request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // If authenticated but no active profile, sign out and redirect to login
  if (user.user && (!profile || !profile.isActive) && request.nextUrl.pathname !== "/login") {
    await supabase.auth.signOut()
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }


  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/dashboard", "/login", "/leads", "/reminders", "/users"],
};