import "dotenv/config";
import { prisma } from "@/lib/prisma"
import supabaseAdmin from "@/lib/supabase/admin"

const main = async () => {
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    let userId = listData?.users.find((u) => u.email?.toLowerCase() === "agentIbrahim@crm.com".toLowerCase())?.id;

    if (userId) {
        console.log(`admin user already exists in Supabase: ${userId}`);
    } else {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: "agentIbrahim@crm.com",
            password: "admin123",
            email_confirm: true,
        });

        if (error) {
            console.log(`error creating admin user ${error}`);
            throw error;
        }
        
        userId = data.user.id;
        console.log(`admin user created : ${userId}`);
    }

    const admin = await prisma.profile.upsert({
        where: { email: "agentIbrahim@crm.com" },
        update: {},
        create: {
            id: userId,
            email: "agentIbrahim@crm.com",
            name: "ibrahim yasin",
            role: "AGENT",
        }
    });

    console.log(`admin profile ready: ${admin.id}`);

    const dummyLeads = [
        { name: "John Doe", email: "john@example.com", phone: "123-456-7890", stage: "NEW" as const, status: "OPEN" as const },
        { name: "Jane Smith", email: "jane@example.com", phone: "987-654-3210", stage: "CONTACTED" as const, status: "OPEN" as const },
        { name: "Bob Johnson", email: "bob@example.com", phone: "555-123-4567", stage: "QUALIFIED" as const, status: "WON" as const },
        { name: "Alice Williams", email: "alice@example.com", phone: "444-555-6666", stage: "NEGOTIATING" as const, status: "OPEN" as const },
        { name: "Charlie Brown", email: "charlie@example.com", phone: "333-222-1111", stage: "NEW" as const, status: "LOST" as const },
    ];

    console.log("Seeding leads...");
    for (const lead of dummyLeads) {
        await prisma.lead.create({
            data: {
                ...lead,
                assignedToId: admin.id
            }
        });
    }
    console.log("Successfully seeded 5 dummy leads.");
}
main().catch((e) => {
    console.error(e)
})