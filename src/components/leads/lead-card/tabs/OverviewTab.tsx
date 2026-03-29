"use client"

import React from 'react'
import LeadDescription from '@/components/leads/lead-card/LeadDescription'
import StatusStage from '@/components/leads/lead-card/StatusStage'
import AccountAvatarSection from '@/components/leads/lead-card/accountAvatarSection'
import { Role } from '@/generated/prisma/enums'
import { Button } from '@/components/ui/button'
import { AgentSummary } from '@/components/leads/lead-card/LeadInfoClient'

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
            id: string;
            name: string;
            email: string;
        } | null;
    };
    agents: AgentSummary[];
}

export default function OverviewTab({ lead, role, agents }: OverviewTabProps & { role: Role }) {
    const isManagerOrAdmin = role === Role.MANAGER || role === Role.ADMIN;
    const [isEditing, setIsEditing] = React.useState(false);

    return (
        <div className="flex flex-row items-start gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className='w-2/3 flex flex-col gap-6'>
                <LeadDescription
                    leadId={lead.id}
                    name={lead.name}
                    email={lead.email}
                    phone={lead.phone}
                    createdAt={new Date(lead.createdAt)}
                    isEditing={isEditing}
                    onSuccess={() => setIsEditing(false)}
                    onCancel={() => setIsEditing(false)}
                />
                {isManagerOrAdmin && !isEditing && (
                    <div className='flex justify-center'>
                        <Button
                            size="lg"
                            className="w-full bg-blue-700 hover:bg-blue-800"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Lead
                        </Button>
                    </div>
                )}
            </div>
            <div className='w-1/3 flex flex-col gap-6'>
                <StatusStage leadId={lead.id} status={lead.status as any} stage={lead.stage as any} role={role} />
                <div className="mt-2">
                    <AccountAvatarSection
                        leadId={lead.id}
                        name={lead.assignedTo?.name || "Unassigned"}
                        email={lead.assignedTo?.email || "No agent assigned"}
                        assignedToId={lead.assignedTo?.id ?? null}
                        role={role}
                        agents={agents}
                    />
                </div>
            </div>
        </div>
    )
}
