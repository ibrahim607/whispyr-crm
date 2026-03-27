import { ActivitySchema, ActivityService } from "@/modules/activity";
import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const profile = await authenticateUser();

        const searchParams = request.nextUrl.searchParams;
        const page = searchParams.get("page");
        const pageSize = searchParams.get("pageSize");

        const validated = ActivitySchema.getByLeadId.parse({
            leadId: id,
            page: page,
            pageSize: pageSize,
        });

        const activities = await ActivityService.getByLeadId(validated, {
            id: profile.id,
            role: profile.role,
        });

        return NextResponse.json({ success: true, data: activities });
    } catch (error) {
        return handleRouteError(error);
    }
}