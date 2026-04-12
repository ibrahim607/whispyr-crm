import { authenticateUser } from "@/utils/autheticateUser";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@/generated/prisma/enums";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { ImportExportService } from "@/modules/import-export";

// ------------------------------------------------------------------
// GET /api/admin/export — Export leads to CSV
// ------------------------------------------------------------------
export async function GET(request: NextRequest) {
    try {
        await authenticateUser([Role.ADMIN]);

        const csvString = await ImportExportService.export.leads();

        const headers = new Headers();
        headers.set('Content-Type', 'text/csv');
        headers.set('Content-Disposition', 'attachment; filename=leads_export.csv');

        return new NextResponse(csvString, {
            status: 200,
            headers: headers,
        });

    } catch (error) {
        return handleRouteError(error);
    }
}
