import { updateLead } from "@/modules/leads/db";
import { leadsSchema } from "@/modules/leads/schema";
import { authenticateUser, autheticationError } from "@/utils/autheticateUser";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { Role } from "@/generated/prisma/enums";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const profile = await authenticateUser([Role.ADMIN, Role.MANAGER, Role.AGENT]);

        const body = await request.json();
        const data = leadsSchema.partial().parse(body);

        const lead = await updateLead(id, profile, data);

        return NextResponse.json({
            success: true,
            data: lead,
            message: "Lead updated successfully",
        });
    } catch (error) {
        console.error("PATCH /api/leads/[id] Error:", error);
        
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
