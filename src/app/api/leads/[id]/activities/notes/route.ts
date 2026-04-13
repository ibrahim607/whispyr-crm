import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { ActivityService, ActivitySchema } from "@/modules/activity";
import { ActivityType } from "@/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const profile = await authenticateUser();
        const { id: leadId } = await params;

        const body = await request.json();
        const validated = ActivitySchema.createNote.parse(body);

        const result = await ActivityService.create([{
            leadId,
            actorId: profile.id,
            type: ActivityType.NOTE,
            content: validated.content,
        }]);

        return NextResponse.json({ success: true, data: result }, { status: 201 });
    } catch (error) {
        return handleRouteError(error);
    }
}