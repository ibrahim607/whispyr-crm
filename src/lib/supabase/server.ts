import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function createServerSupabaseClient() {
    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!, {
        cookies: {
            getAll() {
                return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            }
        }
    })

    return supabase;

}


//ask about it, this is wrong


export default createServerSupabaseClient;