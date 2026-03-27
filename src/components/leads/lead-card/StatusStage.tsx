"use client"

import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { useEditLead } from '@/lib/tanstack/useLeads';
import { LeadStage, LeadStatus } from '@/generated/prisma/enums';

export default function StatusStage({ leadId, status, stage, role }: { leadId: string, status: string, stage: string, role: string }) {

    const [currentStatus, setCurrentStatus] = useState(status)
    const [currentStage, setCurrentStage] = useState(stage)
    const { mutateAsync: updateLead } = useEditLead(leadId);
    const isAdminOrManager = role === "ADMIN" || role === "MANAGER";

    const getStatusColor = (s: string) => {
        switch (s) {
            case "OPEN":
                return "text-green-800";
            case "LOST":
                return "text-red-800";
            case "WON":
                return "text-blue-800";
            default:
                return "text-gray-800";
        }
    };

    const getStageColor = (s: string) => {
        switch (s) {
            case "NEW":
                return "text-gray-800";
            case "CONTACTED":
                return "text-purple-800";
            case "QUALIFIED":
                return "text-blue-800";
            case "NEGOTIATING":
                return "text-yellow-800";
            default:
                return "text-gray-800";
        }
    };

    const handleStatusChange = async (val: string) => {
        setCurrentStatus(val);
        await updateLead({ status: val as LeadStatus });
    }

    const handleStageChange = async (val: string) => {
        setCurrentStage(val);
        await updateLead({ stage: val as LeadStage });
    }

    return (
        <div className='flex flex-col gap-4 bg-white p-6 rounded-xl border-2 shadow-sm'>
            <h1 className="font-semibold text-lg border-b pb-2">Status & Stage</h1>
            <div className='flex flex-col gap-6'>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Select defaultValue={status} onValueChange={handleStatusChange} disabled={!isAdminOrManager}>
                        <SelectTrigger className={getStatusColor(currentStatus)}>
                            <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent >
                            <SelectItem value="OPEN" className={getStatusColor("OPEN")}>Open</SelectItem>
                            <SelectItem value="LOST" className={getStatusColor("LOST")}>Lost</SelectItem>
                            <SelectItem value="WON" className={getStatusColor("WON")}>Won</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Stage</label>
                    <Select defaultValue={stage} onValueChange={handleStageChange} disabled={!isAdminOrManager}>
                        <SelectTrigger className={getStageColor(currentStage)}>
                            <SelectValue placeholder="Select a stage" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NEW" className={getStageColor("NEW")}>New</SelectItem>
                            <SelectItem value="CONTACTED" className={getStageColor("CONTACTED")}>Contacted</SelectItem>
                            <SelectItem value="QUALIFIED" className={getStageColor("QUALIFIED")}>Qualified</SelectItem>
                            <SelectItem value="NEGOTIATING" className={getStageColor("NEGOTIATING")}>Negotiating</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div >
    )
}