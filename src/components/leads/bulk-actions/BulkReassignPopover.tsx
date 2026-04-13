import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useUsers } from '@/lib/tanstack/useUsers';
import { useBulkReassignLeads } from '@/lib/tanstack/useLeads';

export function BulkReassignPopover({ selectedIds, clearSelection }: { selectedIds: Set<string>, clearSelection: () => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    const { data: usersData, isLoading } = useUsers({ page, pageSize: 15, search });
    const { mutate: reassign, isPending } = useBulkReassignLeads();
    
    useEffect(() => {
        setPage(1);
        setAllUsers([]);
    }, [search]);

    useEffect(() => {
        if (usersData) {
            if (page === 1) {
                setAllUsers(usersData.users);
            } else {
                setAllUsers(prev => {
                    const newUsers = usersData.users.filter(u => !prev.some(pu => pu.id === u.id));
                    return [...prev, ...newUsers];
                });
            }
        }
    }, [usersData, page]);

    const handleSelect = (userId: string) => {
        reassign(
            { leadIds: Array.from(selectedIds), assignedToId: userId },
            {
                onSuccess: () => {
                    toast.success("Leads reassigned successfully");
                    clearSelection();
                    setOpen(false);
                },
                onError: (err) => toast.error(err.message || "Failed to reassign leads")
            }
        );
    };

    const hasMore = usersData && page < usersData.pagination.pages;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant='outline' size='sm' disabled={isPending}>
                    {isPending && <Spinner className="w-3 h-3 mr-2" />}
                    Reassign Agent
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <div className="p-2 border-b bg-gray-50 rounded-t-md">
                    <Input 
                        placeholder="Search agents..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-white"
                    />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                    {isLoading && page === 1 && <div className="p-4 flex justify-center"><Spinner /></div>}
                    {!isLoading && allUsers.length === 0 && <p className="p-4 text-center text-sm text-gray-500">No agents found.</p>}
                    {allUsers.map(user => (
                        <div 
                            key={user.id} 
                            onClick={() => handleSelect(user.id)}
                            className="flex flex-col p-2 hover:bg-blue-50 rounded-md cursor-pointer transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-800">{user.name}</span>
                            <span className="text-xs text-gray-400">{user.email}</span>
                        </div>
                    ))}
                    {hasMore && (
                        <div className="p-2 mt-1">
                            <Button variant="outline" size="sm" className="w-full" onClick={() => setPage(page + 1)} disabled={isLoading}>
                                {isLoading ? <Spinner className="w-4 h-4" /> : "Load More"}
                            </Button>
                         </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
