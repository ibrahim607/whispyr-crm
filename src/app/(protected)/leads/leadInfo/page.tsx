import { authenticateUser } from '@/utils/autheticateUser'
import LeadInfoClient from '@/components/leads/lead-card/LeadInfoClient';
import { redirect } from 'next/navigation';

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

    return <LeadInfoClient id={id} profile={profile} />
}