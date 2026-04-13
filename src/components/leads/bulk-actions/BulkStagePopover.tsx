import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useBulkUpdateLeads } from '@/lib/tanstack/useLeads';
import { LeadStage } from '@/generated/prisma/enums';

export function BulkStagePopover({ selectedIds, clearSelection }: { selectedIds: Set<string>, clearSelection: () => void }) {
    const [open, setOpen] = useState(false);
    const { mutate: updateLeads, isPending } = useBulkUpdateLeads();
    
    const stages = Object.values(LeadStage);

    const handleSelect = (stage: LeadStage) => {
        updateLeads(
            { leadIds: Array.from(selectedIds), stage },
            {
                onSuccess: () => {
                    toast.success(`Leads updated to ${stage}`);
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
                    Change Stage
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
                <div className="flex flex-col space-y-1">
                    {stages.map(stage => (
                        <Button key={stage} variant="ghost" size="sm" className="justify-start opacity-70 hover:opacity-100" onClick={() => handleSelect(stage)}>
                            {stage}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
