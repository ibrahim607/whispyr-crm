import "dotenv/config";
import { prisma } from "@/lib/prisma";
import supabaseAdmin from "@/lib/supabase/admin";

const agents = [
    {
        email: "agent.sara@crm.com",
        password: "agent123",
        name: "Sara Hassan",
        role: "AGENT" as const,
    },
    {
        email: "agent.mark@crm.com",
        password: "agent123",
        name: "Mark Turner",
        role: "AGENT" as const,
    },
    {
        email: "agent.layla@crm.com",
        password: "agent123",
        name: "Layla Ahmed",
        role: "AGENT" as const,
    },
    {
        email: "manager.john@crm.com",
        password: "manager123",
        name: "John Carter",
        role: "MANAGER" as const,
    },
    {
        email: "admin.root@crm.com",
        password: "admin123",
        name: "Root Admin",
        role: "ADMIN" as const,
    },
];

const main = async () => {
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existingEmails = new Set(listData?.users.map((u) => u.email?.toLowerCase()));

    for (const agent of agents) {
        const emailLower = agent.email.toLowerCase();
        let userId = listData?.users.find((u) => u.email?.toLowerCase() === emailLower)?.id;

        if (userId) {
            console.log(`User already exists in Supabase: ${agent.email} (${userId})`);
        } else {
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email: agent.email,
                password: agent.password,
                email_confirm: true,
            });

            if (error) {
                console.error(`Error creating user ${agent.email}: ${error.message}`);
                throw error;
            }

            userId = data.user.id;
            console.log(`Created Supabase user: ${agent.email} (${userId})`);
        }

        const profile = await prisma.profile.upsert({
            where: { email: agent.email },
            update: {},
            create: {
                id: userId!,
                email: agent.email,
                name: agent.name,
                role: agent.role,
            },
        });

        console.log(`Profile ready: ${profile.name} [${profile.role}] — ${profile.id}`);
    }

    console.log(`\nSuccessfully seeded ${agents.length} agent profiles.`);
};

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
