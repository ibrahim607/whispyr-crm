"use client";

import { Role } from '@/generated/prisma/enums';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';
import { useGetAgents } from '@/lib/tanstack/useProfiles';
import { useEditLead } from '@/lib/tanstack/useLeads';

interface AccountAvatarSectionProps {
    leadId: string;
    name: string;
    email: string;
    assignedToId: string | null;
    role: Role;
}

export default function AccountAvatarSection({
    leadId,
    name,
    email,
    assignedToId,
    role,
}: AccountAvatarSectionProps) {
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : '??';

    const isManagerOrAdmin = role === Role.MANAGER || role === Role.ADMIN;

    const { data: agents = [], isLoading: agentsLoading } = useGetAgents();
    const { mutate: editLead, isPending } = useEditLead(leadId);

    function handleAgentChange(agentId: string) {
        editLead({ assignedToId: agentId === "unassign" ? null : agentId });
    }

    return (
        <div className='flex flex-col gap-4 border-2 shadow-sm rounded-xl bg-white p-6'>
            <div className='text-xl font-bold border-b pb-2'>
                Agent Information.
            </div>
            <div className='flex flex-row items-center gap-4'>
                <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl bg-blue-100 text-blue-700">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
                    <p className="text-gray-500">{email}</p>
                </div>
            </div>

            {isManagerOrAdmin && (
                <Select
                    value={assignedToId ?? undefined}
                    onValueChange={handleAgentChange}
                    disabled={agentsLoading || isPending}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Reassign agent…" />
                    </SelectTrigger>
                    <SelectContent>
                        {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                                {agent.name}
                            </SelectItem>
                        ))}
                        {assignedToId && (
                            <SelectItem value="unassign">
                                Unassign
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}
