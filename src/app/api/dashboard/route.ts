import { DashboardService } from "@/modules/dashboard";
import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const profile = await authenticateUser();

        const overview = await DashboardService.getDashboardData(profile);

        return NextResponse.json({ success: true, data: overview });
    } catch (error) {
        return handleRouteError(error);
    }
}