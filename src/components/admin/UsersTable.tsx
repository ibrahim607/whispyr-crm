import { User } from "@/lib/tanstack/useUsers"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { UserActions } from "./UserActions"
import { Pagination } from "../leads/reusable"
import { PaginationMeta } from "@/utils/pagination"
import { Dispatch, SetStateAction } from "react"
import { Spinner } from "@/components/ui/spinner"

// Color mapping for role badges.
// These use Tailwind's default color palette.
const roleBadgeVariant: Record<string, "default" | "info" | "outline"> = {
    ADMIN: "default",
    MANAGER: "info",
    AGENT: "outline",
};

interface UsersTableProps {
    users: User[];
    pagination?: PaginationMeta;
    page: number;
    setPage: Dispatch<SetStateAction<number>>;
    isLoading: boolean;
}

const UsersTable = ({ users, pagination, page, setPage, isLoading }: UsersTableProps) => {
    if (isLoading) {
        return <div className="rounded-md border p-8 flex justify-center"><Spinner /></div>
    }

    if (!isLoading && users.length === 0) {
        return <div className="rounded-md border p-8 text-center text-muted-foreground">
            No users yet. Create one to get started.
        </div>
    }

    const total = pagination?.total ?? 0;
    const pageCount = pagination?.pages ?? 1;
    const startItem = total === 0 ? 0 : (page - 1) * (pagination?.pageSize ?? 10) + 1;
    const endItem = Math.min(page * (pagination?.pageSize ?? 10), total);

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map(user => {
                        return (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {user.email}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={roleBadgeVariant[user.role] ?? "outline"}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.isActive ? (
                                        <Badge
                                            variant="outline"
                                            className="border-green-200 text-green-700 bg-green-50"
                                        >
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="border-red-200 text-red-700 bg-red-50"
                                        >
                                            Inactive
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <UserActions user={user} />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            {pagination && total > 0 && (
                <Pagination
                    startItem={startItem}
                    endItem={endItem}
                    total={total}
                    page={page}
                    pageCount={pageCount}
                    isLoading={isLoading}
                    setPage={setPage}
                    itemLabel="users"
                />
            )}
        </div>
    )
}

export default UsersTable