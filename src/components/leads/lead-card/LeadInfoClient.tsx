"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import { useGetLead } from '@/lib/tanstack/useLeads'
import { Profile } from '@/generated/prisma/browser'
import LeadDetailNavbar, { TabId } from './LeadDetailNavbar'
import OverviewTab from './tabs/OverviewTab'
import ActivitiesTab from './tabs/ActivitiesTab'
import RemindersTab from './tabs/RemindersTab'
import { AI } from './tabs/AITab'
import FilesTab from './tabs/FilesTab'
import { CreateReminderDialog } from '@/components/reminders/CreateReminderDialog'

export interface AgentSummary {
    id: string;
    name: string;
    email: string;
}

interface LeadInfoClientProps {
    id: string;
    profile: Profile;
    agents: AgentSummary[];
}

export default function LeadInfoClient({ id, profile, agents }: LeadInfoClientProps) {
    const router = useRouter()
    const { data: lead, isLoading, error } = useGetLead(id);
    const [activeTab, setActiveTab] = useState<TabId>('overview')
    const role = profile.role;

    if (isLoading) {
        return <div className="flex items-center justify-center w-full h-full p-12"><Spinner /></div>
    }

    if (error || !lead) {
        return (
            <div className="p-8 text-center bg-white rounded-xl m-8 shadow-sm border">
                <p className="text-red-500 mb-4 font-medium">Error loading lead info or lead not found.</p>
                <button
                    onClick={() => router.push('/leads')}
                    className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                    &larr; Back to Leads
                </button>
            </div>
        )
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab lead={lead as any} role={role} agents={agents} />;
            case 'activities': return <ActivitiesTab leadId={id} />;
            case 'reminders': return <RemindersTab leadId={id} />;
            case 'ai': return <AI leadId={id} />;
            case 'files': return <FilesTab leadId={id} />;
            default: return <OverviewTab lead={lead as any} role={role} agents={agents} />;
        }
    }

    return (
        <div className="flex flex-col p-8 w-full max-w-7xl h-[calc(100vh-70px)] bg-gray-50/50">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-900">{lead.name}</h1>
                    <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded text-xs font-semibold">Active</span>
                </div>
                <CreateReminderDialog leadId={id} />
            </div>

            {/* Navigation & Main Content Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col flex-1 min-h-0">
                <div className="px-8 pt-8 shrink-0">
                    <LeadDetailNavbar
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto px-8 pb-8">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    )
}
