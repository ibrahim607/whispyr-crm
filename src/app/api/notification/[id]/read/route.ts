import {
    notificationIdParamsSchema,
} from "@/modules/notification/schema";
import { markNotificationRead } from "@/modules/notification/service";
import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const profile = await authenticateUser();
        const { id } = notificationIdParamsSchema.parse(await params);
        const data = await markNotificationRead(profile, id);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return handleRouteError(error);
    }
}