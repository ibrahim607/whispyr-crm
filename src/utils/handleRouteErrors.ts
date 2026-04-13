import { LeadServiceError } from "@/modules/leads/service";
import { AuthenticationError } from "./autheticateUser";
import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { NotificationServiceError } from "@/modules/notification/service";
import { AdminServiceError } from "@/modules/admin/service";
import { AttachmentServiceError } from "@/modules/attachments";

export const handleRouteError = (error: unknown) => {
    if (
        error instanceof AuthenticationError ||
        error instanceof LeadServiceError ||
        error instanceof NotificationServiceError ||
        error instanceof AdminServiceError ||
        error instanceof AttachmentServiceError
    ) {
        return NextResponse.json(
            { error: error.message },
            { status: error.statusCode },
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

    console.error("API ROUTE ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};