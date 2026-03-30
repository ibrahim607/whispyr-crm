import { listNotificationsQuerySchema } from "@/modules/notification/schema";
import { listNotifications } from "@/modules/notification/service";
import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { NextRequest, NextResponse } from "next/server";

// GET /api/notifications?page=1&pageSize=10
export async function GET(request: NextRequest) {
    try {
        const profile = await authenticateUser();
        const searchParams = request.nextUrl.searchParams;
        const params = listNotificationsQuerySchema.parse({
            page: searchParams.get("page"),
            pageSize: searchParams.get("pageSize"),
        });

        const data = await listNotifications(profile, params);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return handleRouteError(error);
    }
}