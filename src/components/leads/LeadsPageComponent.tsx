"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreateLeadDialog } from '@/components/create-lead-dialog';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetLeads } from '@/lib/tanstack/useLeads';
import { useRouter } from 'next/navigation';
import { LeadStage, LeadStatus, Role } from '@/generated/prisma/enums';
import { createLeadSchema, CreateLeadRequest, LeadSummary } from '@/modules/leads/schema';
import { BulkActionBar } from './bulk-actions/BulkActionBar';

// --- Main Page ---

export default function LeadsPageComponent({ role }: { role: Role }) {
    const router = useRouter();
    const isManagerOrAdmin = role === Role.MANAGER || role === Role.ADMIN;

    const [page, setPage] = useState(1);
    const pageSize = 10;
    const { isLoading, data } = useGetLeads({ page, pageSize });

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectedLeads, setSelectedLeads] = useState<CreateLeadRequest[]>([]);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    const leads: LeadSummary[] = data?.leads ?? [];

    useEffect(() => {
        if (!headerCheckboxRef.current) return;
        const allSelected = leads.length > 0 && leads.every(l => selectedIds.has(l.id));
        const someSelected = leads.some(l => selectedIds.has(l.id));
        headerCheckboxRef.current.checked = allSelected;
        headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
    }, [selectedIds, leads]);

    const toCreateLeadRequest = (lead: LeadSummary): CreateLeadRequest | null => {
        const result = createLeadSchema.safeParse({
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            assignedToId: lead.assignedToId ?? undefined,
        });
        return result.success ? result.data : null;
    };

    const toggleRow = (lead: LeadSummary) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(lead.id)) {
                next.delete(lead.id);
            } else {
                next.add(lead.id);
            }
            return next;
        });

        setSelectedLeads(prev => {
            const alreadySelected = prev.some(l => l.email === lead.email && l.name === lead.name);
            if (alreadySelected) {
                return prev.filter(l => !(l.email === lead.email && l.name === lead.name));
            }
            const parsed = toCreateLeadRequest(lead);
            return parsed ? [...prev, parsed] : prev;
        });
    };

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(leads.map(l => l.id)));
            setSelectedLeads(leads.flatMap(l => {
                const parsed = toCreateLeadRequest(l);
                return parsed ? [parsed] : [];
            }));
        } else {
            setSelectedIds(new Set());
            setSelectedLeads([]);
        }
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
        setSelectedLeads([]);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "OPEN": return "bg-green-100 text-green-800";
            case "LOST": return "bg-red-100 text-red-800";
            case "WON": return "bg-blue-100 text-blue-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStageColor = (stage: string) => {
        switch (stage) {
            case "NEW": return "bg-gray-100 text-gray-800";
            case "CONTACTED": return "bg-purple-100 text-purple-800";
            case "QUALIFIED": return "bg-blue-100 text-blue-800";
            case "NEGOTIATING": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    if (isLoading) {
        return <div className='flex items-center justify-center w-full h-full'><Spinner /></div>;
    }

    const colSpan = isManagerOrAdmin ? 8 : 7;

    return (
        <div className='w-full h-[calc(100vh-70px)] flex flex-col p-4 bg-gray-100'>
            <div className='flex flex-row w-full justify-between items-center'>
                <h2 className='py-7 text-4xl font-extrabold'>My Leads</h2>
                {isManagerOrAdmin && <CreateLeadDialog />}
            </div>

            <BulkActionBar 
                selectedIds={selectedIds} 
                clearSelection={clearSelection} 
                isManagerOrAdmin={isManagerOrAdmin} 
            />

            <div className='flex flex-col w-full border-2 rounded-xl overflow-hidden'>
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader className='bg-white sticky top-0 z-10'>
                            <TableRow>
                                <TableHead className='p-4 w-10'>
                                    <input
                                        ref={headerCheckboxRef}
                                        type='checkbox'
                                        className='w-4 h-4 cursor-pointer accent-blue-600'
                                        onChange={e => toggleAll(e.target.checked)}
                                    />
                                </TableHead>
                                <TableHead className='text-gray-500 font-semibold font-sans p-4'>NAME</TableHead>
                                <TableHead className='text-gray-500 font-semibold font-sans p-4'>EMAIL</TableHead>
                                <TableHead className='text-gray-500 font-semibold font-sans p-4'>PHONE</TableHead>
                                <TableHead className='text-gray-500 font-semibold font-sans p-4'>STATUS</TableHead>
                                <TableHead className='text-gray-500 font-semibold font-sans p-4'>STAGE</TableHead>
                                <TableHead className='text-gray-500 font-semibold font-sans p-4'>CREATED</TableHead>
                                {isManagerOrAdmin && (
                                    <TableHead className='text-gray-500 font-semibold font-sans p-4'>ASSIGNED AGENT</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leads.map((lead) => {
                                const isSelected = selectedIds.has(lead.id);
                                return (
                                    <TableRow
                                        key={lead.id}
                                        className={`cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                        onClick={() => router.push(`/leads/leadInfo?id=${lead.id}`)}
                                    >
                                        <TableCell className='p-4' onClick={e => e.stopPropagation()}>
                                            <input
                                                type='checkbox'
                                                className='w-4 h-4 cursor-pointer accent-blue-600'
                                                checked={isSelected}
                                                onChange={() => toggleRow(lead)}
                                            />
                                        </TableCell>
                                        <TableCell className='p-4'>{lead.name}</TableCell>
                                        <TableCell className='p-4'>{lead.email}</TableCell>
                                        <TableCell className='p-4'>{lead.phone}</TableCell>
                                        <TableCell className='p-4'>
                                            <div className={`px-2 py-1 w-fit rounded-md ${getStatusColor(lead.status)}`}>
                                                {lead.status}
                                            </div>
                                        </TableCell>
                                        <TableCell className='p-4'>
                                            <div className={`px-2 py-1 w-fit rounded-md ${getStageColor(lead.stage)}`}>
                                                {lead.stage}
                                            </div>
                                        </TableCell>
                                        <TableCell className='p-4'>
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        {isManagerOrAdmin && (
                                            <TableCell className='p-4'>
                                                {lead.assignedTo?.name || "Unassigned"}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                            {!leads.length && (
                                <TableRow>
                                    <TableCell colSpan={colSpan} className='text-center p-8 text-muted-foreground'>
                                        No leads found. Create one to get started!
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {data && (
                    <div className='flex justify-between bg-white w-full border-t p-4 py-5 text-gray-500 items-center mt-auto shrink-0'>
                        <div>
                            Showing {data.pagination.page} of {data.pagination.pages} — {data.pagination.total} leads
                        </div>
                        <div className="space-x-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                <p className='text-xs text-gray-600 font-semibold font-sans cursor-pointer'>Previous</p>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className='bg-blue-600 hover:bg-blue-700'
                                onClick={() => setPage(page + 1)}
                                disabled={page >= data.pagination.pages}
                            >
                                <p className='p-1 py-5 text-xs text-white font-semibold font-sans cursor-pointer'>Next</p>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}