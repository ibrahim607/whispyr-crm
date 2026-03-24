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
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                } catch {
                    // Next.js strictly forbids setting cookies inside Server Components.
                    // This try/catch suppresses the error while allowing Route Handlers to still work.
                }
            }
        }
    })

    return supabase;

}


//ask about this
export default createServerSupabaseClient;