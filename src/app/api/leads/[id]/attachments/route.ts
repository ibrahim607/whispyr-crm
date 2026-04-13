import { AttachmentService } from "@/modules/attachments";
import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserSnapshot } from "@/utils/types/user";
import { uploadAttachmentSchema } from "@/modules/attachments/schema";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await authenticateUser();
        const { id } = await params;
        const { leadId } = uploadAttachmentSchema.parse({ leadId: id });

        const attachments = await AttachmentService.listForLead(leadId);
        return NextResponse.json(attachments);
    } catch (error: any) {
        console.error("GET ATTACHMENTS FATAL ERROR:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error", stack: error?.stack },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const profile = await authenticateUser();
        const { id } = await params;
        const { leadId } = uploadAttachmentSchema.parse({ leadId: id });

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const attachment = await AttachmentService.uploadForLead({
            leadId,
            file,
            userSnapshot: profile as unknown as UserSnapshot,
        });

        return NextResponse.json(attachment);
    } catch (error) {
        return handleRouteError(error);
    }
}
