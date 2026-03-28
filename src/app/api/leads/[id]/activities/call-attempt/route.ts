import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { createCallAttemptSchema, createActivities } from "@/modules/activity";
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
        const validated = createCallAttemptSchema.parse(body);

        const content = validated.notes
            ? `${validated.outcome} — ${validated.notes}`
            : validated.outcome;

        const result = await createActivities([{
            leadId,
            actorId: profile.id,
            type: ActivityType.CALL_ATTEMPT,
            content,
        }]);

        return NextResponse.json({ success: true, data: result }, { status: 201 });
    } catch (error) {
        return handleRouteError(error);
    }
}