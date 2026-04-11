import { Role } from "@/generated/prisma/browser";
import { AdminService } from "@/modules/admin";
import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await authenticateUser([Role.ADMIN]);
        const { id } = await params;
        const user = await AdminService.user.resendInvite(id);
        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        return handleRouteError(error);
    }
}
