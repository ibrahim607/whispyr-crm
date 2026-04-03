import { AIService } from "@/modules/ai";
import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ leadId: string }> }
) {
    try {
        const profile = await authenticateUser();
        
        // Wait for the params promise to resolve based on Next.JS 15+ constraints
        // We'll await it safely 
        const params = await context.params;
        const leadId = params.leadId;

        const brief = await AIService.getLatestLeadBrief(leadId, {
            id: profile.id,
            role: profile.role,
        });

        return NextResponse.json({ success: true, data: brief });
    } catch (error) {
        return handleRouteError(error);
    }
}
