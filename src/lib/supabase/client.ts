import { createBrowserClient } from '@supabase/ssr'
import { Lead } from '@/generated/prisma/client';

const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
)

export default client;