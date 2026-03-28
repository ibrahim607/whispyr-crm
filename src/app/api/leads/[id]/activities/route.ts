import { getLeadActivitiesSchema, getLeadActivities } from "@/modules/activity";
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

        const validated = getLeadActivitiesSchema.parse({
            leadId: id,
            page: searchParams.get("page"),
            pageSize: searchParams.get("pageSize"),
        });

        const activities = await getLeadActivities(validated, {
            id: profile.id,
            role: profile.role,
        });

        return NextResponse.json({ success: true, data: activities });
    } catch (error) {
        return handleRouteError(error);
    }
}