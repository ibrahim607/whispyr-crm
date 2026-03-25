"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreateLeadDialog } from '@/components/create-lead-dialog';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetLeads } from '@/lib/tanstack/useLeads';
import { useRouter } from 'next/navigation';

export default function LeadsPage() {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const pageSize = 10;
    const { isLoading, data } = useGetLeads({
        page,
        pageSize,
    });

    const totalPages = data?.pagination?.pages;
    const currentPage = data?.pagination?.page;
    const totalLeads = data?.pagination?.total;

    if (isLoading) {
        return <div className='flex items-center justify-center w-full h-full'><Spinner /></div>
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "OPEN":
                return "bg-green-100 text-green-800";
            case "LOST":
                return "bg-red-100 text-red-800";
            case "WON":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStageColor = (stage: string) => {
        switch (stage) {
            case "NEW":
                return "bg-gray-100 text-gray-800";
            case "CONTACTED":
                return "bg-purple-100 text-purple-800";
            case "QUALIFIED":
                return "bg-blue-100 text-blue-800";
            case "NEGOTIATING":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className='w-full h-[calc(100vh-70px)] flex  flex-col p-4 bg-gray-100'>
            <div className='flex flex-row w-full justify-between items-center'>
                <h2 className=' py-7 text-4xl font-extrabold '>My Leads</h2>
                <CreateLeadDialog />
            </div>
            <div className='flex flex-col w-full border-2 rounded-xl overflow-hidden'>
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader className='bg-white sticky top-0 z-10'>
                            <TableRow>
                                <TableHead className='text-gray-500 font-semibold font-sans p-4'>NAME</TableHead>
                                <TableHead className='text-gray-500 font-semibold font-sans p-4'>EMAIL</TableHead>
                                <TableHead className='text-gray-500 font-semibold font-sans p-4'>PHONE</TableHead>
                                <TableHead className='text-gray-500 font-semibold font-sans p-4'>STATUS</TableHead>
                                <TableHead className='text-gray-500 font-semibold font-sans p-4'>STAGE</TableHead>
                                <TableHead className='text-gray-500 font-semibold font-sans p-4'>CREATED</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.leads?.map((lead: any) => {
                                return (
                                    <TableRow key={lead.id} className='cursor-pointer hover:bg-gray-50' onClick={() => router.push(`/leads/leadInfo?id=${lead.id}`)}>
                                        <TableCell className='p-4'>{lead.name}</TableCell>
                                        <TableCell className='p-4'>{lead.email}</TableCell>
                                        <TableCell className='p-4'>{lead.phone}</TableCell>
                                        <TableCell className='p-4'><div className={`px-2 py-1 w-fit rounded-md ${getStatusColor(lead.status)}`}>{lead.status}</div></TableCell>
                                        <TableCell className='p-4'><div className={`px-2 py-1 w-fit rounded-md ${getStageColor(lead.stage)}`}>{lead.stage}</div></TableCell>
                                        <TableCell className='p-4'>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>

                {data && (
                    <div className='flex justify-between bg-white w-full border-t p-4 py-5 text-gray-500 items-center mt-auto shrink-0'>
                        <div>Showing {data.pagination.page} of {data.pagination.pages} - {data.pagination.total} leads</div>
                        <div className="space-x-4">
                            <Button
                                variant="outline"
                                size="lg"
                                className=''
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
        </div >
    )
}

//name email phone status stage created
//showing 1-10 of 47 leads