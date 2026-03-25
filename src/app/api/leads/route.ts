import { LeadService, LeadSchema } from "@/modules/leads";
import { authenticateUser, autheticationError } from "@/utils/autheticateUser";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { Role } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = searchParams.get("page");
        const pageSize = searchParams.get("pageSize");
        const params = LeadSchema.list.parse({
            page,
            pageSize,
        });
        const profile = await authenticateUser();
        const result = await LeadService.list(profile, params);

        return NextResponse.json({
            success: true,
            data: {
                leads: result.leads,
                pagination: result.pagination,
            },
            message: "Leads fetched successfully",
        })
    } catch (error) {
        if (error instanceof autheticationError) {
            return NextResponse.json(
                {
                    error: error.message,
                },
                {
                    status: error.code
                }
            )
        }

        if (error instanceof ZodError)
            return NextResponse.json({
                error: error.flatten().fieldErrors,
            },
                {
                    status: 400
                }
            )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const profile = await authenticateUser([Role.ADMIN, Role.MANAGER]);

        // Get request body
        const body = await request.json();
        const data = LeadSchema.create.parse(body);

        // Create lead
        const lead = await LeadService.create(profile, data);

        return NextResponse.json({
            success: true,
            data: lead,
        });
    } catch (error) {
        if (error instanceof autheticationError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.code },
            );
        }

        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error: error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}