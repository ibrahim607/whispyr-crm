import { authenticateUser } from "@/utils/autheticateUser";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@/generated/prisma/enums";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { AdminSchema, AdminService } from "@/modules/admin";

// ------------------------------------------------------------------
// GET /api/admin/users — List all users (paginated)
// ------------------------------------------------------------------
export async function GET(request: NextRequest) {
    try {
        // Allow managers to list users so they can assign leads
        await authenticateUser([Role.ADMIN, Role.MANAGER]);

        const searchParams = request.nextUrl.searchParams;
        const params = AdminSchema.user.listPaginated.parse({
            page: searchParams.get("page"),
            pageSize: searchParams.get("pageSize"),
            search: searchParams.get("search") || undefined,
        });

        const data = await AdminService.user.list(params);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return handleRouteError(error);
    }
}

// ------------------------------------------------------------------
// POST /api/admin/users — Create a new user with invitation
// ------------------------------------------------------------------
export async function POST(request: NextRequest) {
    try {
        await authenticateUser([Role.ADMIN]);

        // Parse and validate the request body with Zod.
        // If validation fails, Zod throws a ZodError which
        // handleRouteError catches and returns as a 400.
        const body = await request.json();
        const data = AdminSchema.user.create.parse(body);

        // Create the user (auth + profile + magic link + email).
        // The service handles all 4 steps internally.
        const user = await AdminService.user.create(data);

        return NextResponse.json({ success: true, data: user }, { status: 201 });
    } catch (error) {
        return handleRouteError(error);
    }
}