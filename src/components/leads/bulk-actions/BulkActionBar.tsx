import React from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BulkStatusPopover } from './BulkStatusPopover';
import { BulkStagePopover } from './BulkStagePopover';
import { BulkReassignPopover } from './BulkReassignPopover';
import { useBulkDeleteLeads } from '@/lib/tanstack/useLeads';
import { toast } from 'sonner';

interface BulkActionBarProps {
    selectedIds: Set<string>;
    clearSelection: () => void;
    isManagerOrAdmin: boolean;
}

export function BulkActionBar({ selectedIds, clearSelection, isManagerOrAdmin }: BulkActionBarProps) {
    const { mutate: deleteLeads, isPending: isDeleting } = useBulkDeleteLeads();

    if (selectedIds.size === 0) return null;

    const handleBulkDelete = () => {
        deleteLeads(
            { leadIds: Array.from(selectedIds) },
            {
                onSuccess: () => {
                    toast.success("Leads deleted successfully");
                    clearSelection();
                },
                onError: (err) => toast.error(err.message || "Failed to delete leads")
            }
        );
    };

    return (
        <div className='flex items-center gap-3 mb-3 px-4 py-3 bg-white border-2 rounded-xl'>
            <span className='text-sm font-semibold text-gray-700 mr-auto'>
                {selectedIds.size} lead{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            
            <BulkStatusPopover selectedIds={selectedIds} clearSelection={clearSelection} />
            <BulkStagePopover selectedIds={selectedIds} clearSelection={clearSelection} />
            
            {isManagerOrAdmin && (
                <BulkReassignPopover selectedIds={selectedIds} clearSelection={clearSelection} />
            )}

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant='outline'
                        size='sm'
                        className='border-red-300 text-red-600 hover:bg-red-50'
                        disabled={isDeleting}
                    >
                        {isDeleting && <Spinner className="w-3 h-3 mr-2" />}
                        Delete ({selectedIds.size})
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Leads?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {selectedIds.size} lead{selectedIds.size > 1 ? 's' : ''} and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <button
                className='text-xs text-gray-400 hover:text-gray-600 ml-1'
                onClick={clearSelection}
            >
                Clear
            </button>
        </div>
    );
}
