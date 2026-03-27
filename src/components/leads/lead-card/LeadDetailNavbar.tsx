"use client"

import React from 'react'
import { LayoutDashboard, History, Bell, Sparkles, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TabId = 'overview' | 'activities' | 'reminders' | 'ai' | 'files'

interface TabConfig {
    id: TabId
    label: string
    icon: React.ElementType
}

const TABS: TabConfig[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'activities', label: 'Activities', icon: History },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'ai', label: 'AI Insights', icon: Sparkles },
    { id: 'files', label: 'Files', icon: FileText },
]

interface LeadDetailNavbarProps {
    activeTab: TabId
    onTabChange: (id: TabId) => void
}

export default function LeadDetailNavbar({ activeTab, onTabChange }: LeadDetailNavbarProps) {
    return (
        <div className="flex items-center gap-1 border-b mb-6 overflow-x-auto no-scrollbar pt-2">
            {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap outline-none",
                            isActive 
                                ? "text-blue-600 border-b-2 border-blue-600" 
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50 rounded-t-lg"
                        )}
                    >
                        <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-gray-400")} />
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}
