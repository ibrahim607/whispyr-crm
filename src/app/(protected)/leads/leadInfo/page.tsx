import { authenticateUser } from '@/utils/autheticateUser'
import LeadInfoClient from '@/components/leads/lead-card/LeadInfoClient';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Role } from '@/generated/prisma/enums';

export default async function LeadInfoPage({
    searchParams
}: {
    searchParams: Promise<{ id?: string }>
}) {
    const profile = await authenticateUser();
    const { id } = await searchParams;

    if (!id) {
        redirect('/leads');
    }

    const agents = await prisma.profile.findMany({
        where: { role: Role.AGENT, isActive: true },
        select: { id: true, name: true, email: true },
    });

    return <LeadInfoClient id={id} profile={profile} agents={agents} />
}