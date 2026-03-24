import { listLeads } from "@/modules/leads/service";
import { authenticateUser, autheticationError } from "@/utils/autheticateUser";
import { NextRequest, NextResponse } from "next/server";
import { leadsSchema, listLeadsQuerySchema } from "@/modules/leads/schema";
import { ZodError } from "zod";
import { Role } from "@/generated/prisma/enums";
import { createLead } from "@/modules/leads/db";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = searchParams.get("page");
        const pageSize = searchParams.get("pageSize");
        const params = listLeadsQuerySchema.parse({
            page,
            pageSize,
        });
        const profile = await authenticateUser();
        const leads = await listLeads(profile, params);

        return NextResponse.json({
            success: true,
            data: {
                leads: leads.leads,
                total: leads.total,
                page: params.page,
                pageSize: params.pageSize,
                totalPages: Math.ceil(leads.total / params.pageSize),
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
        const data = leadsSchema.parse(body);

        // Create lead
        const lead = await createLead(profile, data);

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