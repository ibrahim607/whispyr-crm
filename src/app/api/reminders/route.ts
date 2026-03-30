import { ReminderSchema, ReminderService } from "@/modules/reminder";
import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const profile = await authenticateUser();

        const isAdminOrManager = profile.role === "ADMIN" || profile.role === "MANAGER";

        const searchParams = request.nextUrl.searchParams;

        if (!isAdminOrManager) {
            const validated = ReminderSchema.listMy.parse({
                page: searchParams.get("page"),
                pageSize: searchParams.get("pageSize"),
                status: searchParams.get("status") || undefined,
            });

            const result = await ReminderService.listMy(validated, {
                id: profile.id,
                role: profile.role,
            });

            return NextResponse.json({ success: true, data: result });
        }

        const validatedAll = ReminderSchema.listAll.parse({
            page: searchParams.get("page"),
            pageSize: searchParams.get("pageSize"),
            status: searchParams.get("status") || undefined,
            agentId: searchParams.get("agentId") || undefined,
        });

        const result = await ReminderService.listAll(validatedAll, {
            id: profile.id,
            role: profile.role,
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        return handleRouteError(error);
    }
}