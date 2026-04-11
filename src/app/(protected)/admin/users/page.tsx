import createServerSupabaseClient from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import UsersPageClient from "@/components/admin/user-page-client"

export default async function AdminUsersPage() {
    // Check authentication
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Fetch the user profile
    const profile = await prisma.profile.findUnique({
        where: {
            id: user.id
        }
    })

    if (!profile || !profile.isActive) {
        await supabase.auth.signOut()
        redirect("/login")
    }

    if (profile.role !== "ADMIN") redirect("/dashboard")

    return (
        <UsersPageClient />
    )
}