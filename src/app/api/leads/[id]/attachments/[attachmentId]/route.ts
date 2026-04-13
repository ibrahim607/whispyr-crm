import { AttachmentService } from "@/modules/attachments";
import { authenticateUser } from "@/utils/autheticateUser";
import { handleRouteError } from "@/utils/handleRouteErrors";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserSnapshot } from "@/utils/types/user";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
    try {
        const profile = await authenticateUser();
        const resolvedParams = await params;
        
        // Basic validation using zod
        const { leadId, attachmentId } = z.object({
            leadId: z.string().uuid(),
            attachmentId: z.string().uuid(),
        }).parse({
            leadId: resolvedParams.id,
            attachmentId: resolvedParams.attachmentId,
        });

        await AttachmentService.deleteForLead({
            leadId,
            attachmentId,
            userSnapshot: profile as unknown as UserSnapshot,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleRouteError(error);
    }
}
