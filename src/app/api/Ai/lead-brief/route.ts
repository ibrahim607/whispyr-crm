import { AISchema, AIService } from "@/modules/ai";
import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    console.log("[API Route] POST /api/Ai/lead-brief hit!");
    try {
        const profile = await authenticateUser();
        console.log("[API Route] Authenticated profile:", profile.id);

        const body = await req.json();
        console.log("[API Route] Request body:", body);

        const { leadId } = AISchema.generateLeadBrief.parse(body);
        console.log("[API Route] Parsed leadId:", leadId);

        const brief = await AIService.generateLeadBrief(leadId, {
            id: profile.id,
            role: profile.role,
        });
        console.log("[API Route] Generated brief successfully");

        return NextResponse.json({ success: true, data: brief });
    } catch (error) {
        console.error("[API Route] Error in POST /api/Ai/lead-brief:", error);
        return handleRouteError(error);
    }
}