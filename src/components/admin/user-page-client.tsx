"use client"

import { useUsers } from "@/lib/tanstack/useUsers"
import { Button } from "../ui/button"
import { useState } from "react"
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
                <Button onClick={() => setIsCreateUserDialogOpen(true)}>+ Create User</Button>
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