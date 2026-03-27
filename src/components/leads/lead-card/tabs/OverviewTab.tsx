"use client"

import React from 'react'
import LeadDescription from '@/components/leads/lead-card/LeadDescription'
import StatusStage from '@/components/leads/lead-card/StatusStage'
import AccountAvatarSection from '@/components/leads/lead-card/accountAvatarSection'

interface OverviewTabProps {
    lead: {
        id: string;
        name: string;
        email: string;
        phone: string;
        status: string;
        stage: string;
        createdAt: string | Date;
        assignedTo?: {
            name: string;
            email: string;
        } | null;
    }
}

export default function OverviewTab({ lead, role }: OverviewTabProps & { role: string }) {
    return (
        <div className="flex flex-row items-start gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className='w-2/3'>
                <LeadDescription
                    name={lead.name}
                    email={lead.email}
                    phone={lead.phone}
                    createdAt={new Date(lead.createdAt)}
                />
            </div>
            <div className='w-1/3 flex flex-col gap-6'>
                <StatusStage leadId={lead.id} status={lead.status as any} stage={lead.stage as any} role={role} />
                <div className="mt-2">
                    <AccountAvatarSection
                        name={lead.assignedTo?.name || "Unassigned"}
                        email={lead.assignedTo?.email || "No agent assigned"}
                    />
                </div>
            </div>
        </div>
    )
}
