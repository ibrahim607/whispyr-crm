"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import { useGetLead } from '@/lib/tanstack/useLeads'
import { Profile } from '@/generated/prisma/browser'
import LeadDetailNavbar, { TabId } from './LeadDetailNavbar'
import OverviewTab from './tabs/OverviewTab'
import { Timeline } from './tabs/ActivitiesTab'
import RemindersTab from './tabs/RemindersTab'
import AITab from './tabs/AITab'
import FilesTab from './tabs/FilesTab'
import AccountAvatarSection from './accountAvatarSection'

interface LeadInfoClientProps {
    id: string;
    profile: Profile;
}

export default function LeadInfoClient({ id, profile }: LeadInfoClientProps) {
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
            case 'overview': return <OverviewTab lead={lead as any} role={role} />;
            case 'activities': return <Timeline leadId={id} />;
            case 'reminders': return <RemindersTab />;
            case 'ai': return <AITab />;
            case 'files': return <FilesTab />;
            default: return <OverviewTab lead={lead as any} role={role} />;
        }
    }

    return (
        <div className="flex flex-col p-8 w-full max-w-7xl h-[calc(100vh-70px)] overflow-y-auto bg-gray-50/50">
            {/* Back Button Area */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => router.back()}
                    className="cursor-pointer text-gray-500 hover:text-blue-600 flex items-center gap-2 text-sm font-medium transition-colors"
                >
                    &larr; Back to Leads
                </button>
            </div>

            {/* Navigation & Main Content Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
                <LeadDetailNavbar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <div className="mt-6">
                    {renderTabContent()}
                </div>
            </div>
        </div >
    )
}
