"use client"

import LeadDescription from '@/components/leads/LeadDescription'
import React, { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import StatusStage from '@/components/leads/StatusStage'
import AccountAvatarSection from '@/components/leads/accountAvatarSection'
import { useGetLead } from '@/lib/tanstack/useLeads'

function LeadInfoContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const id = searchParams.get('id')

    const { data: lead, isLoading, error } = useGetLead(id || "");

    if (!id) {
        router.push('/leads')
        return null;
    }

    if (isLoading) {
        return <div className="flex items-center justify-center w-full h-full p-8"><Spinner /></div>
    }

    if (error || !lead) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Error loading lead info or lead not found.</p>
                <button onClick={() => router.push('/leads')} className="text-blue-600 hover:underline">
                    &larr; Back to Leads
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col p-8 w-full max-w-6xl h-[calc(100vh-70px)] overflow-y-auto">
            <div className="flex pb-4 mb-6">
                <button onClick={() => router.back()} className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-semibold">
                    &larr; Back to Leads
                </button>
            </div>
            <div className="flex flex-row items-start gap-4 justify-between">
                <div className='w-2/3'>
                    <LeadDescription
                        name={lead.name}
                        email={lead.email}
                        phone={lead.phone}
                        createdAt={new Date(lead.createdAt)}
                    />
                </div>
                <div className='w-1/3 flex flex-col gap-6'>
                    <StatusStage leadId={lead.id} status={lead.status} stage={lead.stage} />
                    <div className="mt-2">
                        <h1 className="text-2xl font-bold mb-4">Agent Info</h1>
                        <AccountAvatarSection
                            name={lead.assignedTo?.name || "Unassigned"}
                            email={lead.assignedTo?.email || "No agent assigned"}
                        />
                    </div>
                </div>
            </div>
        </div >
    )
}

export default function LeadInfoPage() {
    return (
        <Suspense fallback={<div className='flex items-center justify-center w-full h-full'><Spinner /></div>}>
            <LeadInfoContent />
        </Suspense>
    )
}