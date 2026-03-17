import { NextRequest, NextResponse } from "next/server";
import createServerSupabaseClient from "@/lib/supabase/server";

export async function proxy(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: user } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();

    console.log(session);
    console.log(user.user?.id);

    if (!user && request.nextUrl.pathname.startsWith("/crm")) {
        const url = request.nextUrl.clone();

        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (user && request.nextUrl.pathname.startsWith("/login")) {
        const url = request.nextUrl.clone();
        url.pathname = "/crm";
        return NextResponse.redirect(url);
    }

    return NextResponse.next({ request });
}

export const config = {
    matcher: ["/crm/:path", "/login"],
};
