import { generateLeadBriefSchema, saveLeadBriefSchema, generateCallFollowUpRequestSchema } from "./schema";
import { generateLeadBrief, saveLeadBrief, getLatestLeadBrief, generateCallFollowup } from "./service";

export const AIService = {
    generateLeadBrief,
    saveLeadBrief,
    getLatestLeadBrief,
    generateCallFollowup,
} as const;

export const AISchema = {
    generateLeadBrief: generateLeadBriefSchema,
    saveLeadBrief: saveLeadBriefSchema,
    generateCallFollowUpRequestSchema,
} as const;