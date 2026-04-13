import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { bulkLeadActionSchema } from "@/modules/leads/schema";
import { LeadService } from "@/modules/leads";

export async function POST(request: NextRequest) {
    try {
        const profile = await authenticateUser();
        const body = await request.json();
        const data = bulkLeadActionSchema.parse(body);
        const result = await LeadService.bulkDelete(profile, data);
        
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        return handleRouteError(error);
    }
}
