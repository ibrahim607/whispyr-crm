"use client"

import LeadDescription from '@/components/leads/LeadDescription'
import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/spinner'
import StatusStage from '@/components/leads/StatusStage'
import AccountAvatarSection from '@/components/leads/accountAvatarSection'

function LeadInfoContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const id = searchParams.get('id')

    const [lead, setLead] = useState<any>(null)

    useEffect(() => {
        if (!id) {
            router.push('/leads')
            return
        }

        // Try getting data from Tanstack cache directly to avoid refetching
        const data: any = queryClient.getQueryData(['leads'])

        if (data?.leads) {
            const found = data.leads.find((l: any) => l.id === id)
            if (found) {
                setLead(found)
            } else {
                router.push('/leads')
            }
        } else {
            // No cache available, bump back to list
            router.push('/leads')
        }
    }, [id, queryClient, router])

    if (!lead) {
        return <div className="p-8 text-gray-500"><Spinner /></div>
    }

    return (
        <div className="flex flex-col p-8 w-full max-w-6xl h-[calc(100vh-70px)] overflow-y-auto">
            <div className="flex pb-4 mb-6">
                <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                    &larr; Back to Leads
                </button>
            </div>
            <div className="flex flex-row items-start gap-4 justify-between">
                <div className='w-2/3 h-2/3'>
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