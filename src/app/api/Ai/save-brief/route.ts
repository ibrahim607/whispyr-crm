import { AISchema, AIService } from "@/modules/ai";
import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const profile = await authenticateUser();
        const body = await req.json();

        const { leadId, brief } = AISchema.saveLeadBrief.parse(body);

        const savedBrief = await AIService.saveLeadBrief(
            leadId,
            { id: profile.id, role: profile.role },
            brief
        );

        return NextResponse.json({ success: true, data: savedBrief });
    } catch (error) {
        return handleRouteError(error);
    }
}
