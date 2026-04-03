import { UserSnapshot } from "@/utils/types/user";
import { prisma } from "@/lib/prisma";
import {
    dbGetLeadWithContext,
    dbGetNextReminder,
    dbGetRecentActivities,
    dbSaveLeadBrief,
    dbGetLeadBriefCount,
    dbDeleteLeadBrief,
    dbGetLatestLeadBrief,
} from "./db";
import { buildLeadBriefPrompt, buildCallFollowupPrompt, validateLeadAccess } from "./helpers";
import { generateText, Output } from "ai";
import { LeadBrief, leadBriefSchema, callFollowUpSchema } from "./schema";
import { buildAiLeadBriefGeneratedActivity, createActivities, CallOutcome } from "../activity";

export async function generateLeadBrief(
    leadId: string,
    userSnapshot: UserSnapshot,
) {
    const lead = await dbGetLeadWithContext(leadId);
    if (!lead) {
        throw new Error("Lead not found");
    }

    if (!validateLeadAccess(lead.assignedTo?.id, userSnapshot)) {
        throw new Error("You are not authorized to access this lead");
    }

    const [activities, nextReminder] = await Promise.all([
        dbGetRecentActivities(leadId),
        dbGetNextReminder(leadId),
    ]);

    const prompt = buildLeadBriefPrompt({
        leadContext: lead,
        recentActivities: activities,
        nextReminder: nextReminder,
    });

    const { output } = await generateText({
        model: "deepseek/deepseek-v3.2-thinking",
        output: Output.object({ schema: leadBriefSchema }),
        prompt,
    });

    return output;
}

export async function saveLeadBrief(
    leadId: string,
    userSnapshot: UserSnapshot,
    brief: LeadBrief,
) {
    // Check auth
    const lead = await dbGetLeadWithContext(leadId);
    if (!lead) {
        throw new Error("Lead not found");
    }
    if (!validateLeadAccess(lead.assignedTo?.id, userSnapshot)) {
        throw new Error("You are not authorized to access this lead");
    }

    return prisma.$transaction(async (tx) => {
        // Enforce max 2 briefs logic
        const count = await dbGetLeadBriefCount(leadId, tx);
        if (count >= 2) {
            const oldest = await tx.aILeadBrief.findFirst({
                where: { leadId },
                orderBy: { createdAt: 'asc' },
                select: { id: true }
            });
            if (oldest) {
                await dbDeleteLeadBrief(oldest.id, tx);
            }
        }

        // Save the brief
        const savedBrief = await dbSaveLeadBrief(leadId, userSnapshot.id, brief, tx);

        // Create an activity
        const activity = buildAiLeadBriefGeneratedActivity(leadId, userSnapshot.id);
        await createActivities([activity], tx);

        return savedBrief;
    });
}

export async function getLatestLeadBrief(
    leadId: string,
    userSnapshot: UserSnapshot,
) {
    const lead = await dbGetLeadWithContext(leadId);
    if (!lead) throw new Error("Lead not found");
    if (!validateLeadAccess(lead.assignedTo?.id, userSnapshot)) {
        throw new Error("You are not authorized to access this lead");
    }

    return await dbGetLatestLeadBrief(leadId);
}

export async function generateCallFollowup(
    leadId: string,
    userSnapshot: UserSnapshot,
) {
    const lead = await dbGetLeadWithContext(leadId);
    if (!lead) throw new Error("Lead not found");
    if (!validateLeadAccess(lead.assignedTo?.id, userSnapshot)) {
        throw new Error("You are not authorized to access this lead");
    }

    const activities = await dbGetRecentActivities(leadId, 1000);

    const lastCall = activities.find((a) => a.type === "CALL_ATTEMPT");
    if (!lastCall) {
        throw new Error("No call activity found for this lead");
    }

    // content is stored as "OUTCOME" or "OUTCOME — notes"
    const parts = lastCall.content?.split(" — ") ?? [];
    const callOutcome = (parts[0] ?? "ANSWERED") as CallOutcome;
    const agentNotes = parts[1] ?? undefined;

    const prompt = buildCallFollowupPrompt({
        leadContext: lead,
        recentActivities: activities,
        callOutcome,
        agentNotes,
    });

    const { output } = await generateText({
        model: "deepseek/deepseek-v3.2-thinking",
        output: Output.object({ schema: callFollowUpSchema }),
        prompt,
    });

    return output;
}