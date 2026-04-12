import { redirect } from "next/navigation";
import createSupabaseServerClient from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ExportLeadsClient } from "@/components/admin/ExportLeadsClient";

export const metadata = {
    title: "Export Leads — CRM Pro Admin",
};

export default async function AdminExportPage() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { role: true, isActive: true },
    });

    if (!profile || profile.role !== "ADMIN" || !profile.isActive) {
        redirect("/dashboard");
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Export Leads</h1>
                <p className="text-muted-foreground mt-1">
                    Download lead data selectively or entirely from the database.
                </p>
            </div>
            <ExportLeadsClient />
        </div>
    );
}
