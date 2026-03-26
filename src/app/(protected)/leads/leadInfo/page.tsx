import { authenticateUser } from '@/utils/autheticateUser'
import LeadInfoClient from '@/components/leads/LeadInfoClient';
import { redirect } from 'next/navigation';
import React from 'react'

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