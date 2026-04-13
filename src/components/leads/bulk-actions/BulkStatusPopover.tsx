import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useBulkUpdateLeads } from '@/lib/tanstack/useLeads';
import { LeadStatus } from '@/generated/prisma/enums';

export function BulkStatusPopover({ selectedIds, clearSelection }: { selectedIds: Set<string>, clearSelection: () => void }) {
    const [open, setOpen] = useState(false);
    const { mutate: updateLeads, isPending } = useBulkUpdateLeads();
    
    const statuses = Object.values(LeadStatus);

    const handleSelect = (status: LeadStatus) => {
        updateLeads(
            { leadIds: Array.from(selectedIds), status },
            {
                onSuccess: () => {
                    toast.success(`Leads updated to ${status}`);
                    clearSelection();
                    setOpen(false);
                },
                onError: (err) => toast.error(err.message || "Failed to update leads")
            }
        );
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant='outline' size='sm' disabled={isPending}>
                    {isPending && <Spinner className="w-3 h-3 mr-2" />}
                    Change Status
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
                <div className="flex flex-col space-y-1">
                    {statuses.map(status => (
                        <Button key={status} variant="ghost" size="sm" className="justify-start opacity-70 hover:opacity-100" onClick={() => handleSelect(status)}>
                            {status}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
