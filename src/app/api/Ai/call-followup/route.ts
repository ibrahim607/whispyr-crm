import { AISchema, AIService } from "@/modules/ai";
import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: NextRequest) {
    try {
        const profile = await authenticateUser();
        const body = await req.json();

        const { leadId } = z.object({ leadId: z.uuid() }).parse(body);

        const followup = await AIService.generateCallFollowup(
            leadId,
            { id: profile.id, role: profile.role },
        );

        return NextResponse.json({ success: true, data: followup });
    } catch (error) {
        return handleRouteError(error);
    }
}
