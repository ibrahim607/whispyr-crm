import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar"
import { prisma } from "@/lib/prisma"
import { QueryProvider } from "@/lib/provider/QueryProvider"
import createServerSupabaseClient from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
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

    if (!profile) redirect("/login")

    return (
        <QueryProvider>
            <SidebarProvider>
                <AppSidebar role={profile.role} user={profile} />
                <main className="flex flex-col flex-1 w-full">
                    <TopBar role={profile.role} email={profile.email} >
                        {children}
                    </TopBar>
                </main>
            </SidebarProvider>
        </QueryProvider>

    )
}
