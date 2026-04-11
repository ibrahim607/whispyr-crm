"use client"

import { useUsers } from "@/lib/tanstack/useUsers"
import { Button } from "../ui/button"
import { useState } from "react"
import { Upload } from "lucide-react"
import Link from "next/link"
import UsersTable from "./UsersTable"
import { CreateUserDialog } from "./create-user-dialog"

const PAGE_SIZE = 10;

const UsersPageClient = () => {
    const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
    const [page, setPage] = useState(1)
    const { data, isLoading } = useUsers({ page, pageSize: PAGE_SIZE })

    return (
        <div className="space-y-4 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Users</h1>
                    <p className="text-sm text-muted-foreground">Manage your users and their roles.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/import">
                            <Upload className="mr-2 h-4 w-4" />
                            Import CSV
                        </Link>
                    </Button>
                    <Button onClick={() => setIsCreateUserDialogOpen(true)}>+ Create User</Button>
                </div>
            </div>
            <div>
                <UsersTable
                    users={data?.users ?? []}
                    pagination={data?.pagination}
                    page={page}
                    setPage={setPage}
                    isLoading={isLoading}
                />
            </div>
            <CreateUserDialog
                open={isCreateUserDialogOpen}
                onOpenChange={setIsCreateUserDialogOpen}
            />
        </div>
    )
}

export default UsersPageClient