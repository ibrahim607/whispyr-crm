
import { authenticateUser } from "@/utils/autheticateUser";
import { RemindersPageClient } from "@/components/reminders/ReminderPageClient";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

export default async function RemindersPage() {
    const profile = await authenticateUser();
    const agents = await prisma.profile.findMany({
        where: { role: Role.AGENT, isActive: true },
        select: { id: true, name: true, email: true },
    });

    return <RemindersPageClient profile={profile} agents={agents} />;
}