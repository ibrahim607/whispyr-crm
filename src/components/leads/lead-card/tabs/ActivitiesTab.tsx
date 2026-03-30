"use client"

import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useGetLeadActivities } from "@/lib/tanstack/useActivities";
import { useState } from "react";
import { ActivityType } from "@/generated/prisma/enums";
import {
    PlusCircle,
    Pencil,
    Phone,
    CheckCircle,
    ArrowRight,
    User,
    Bell,
    Paperclip,
    Brain,
    History,
    type LucideIcon
} from "lucide-react";
import { Pagination } from "../../reusable";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import LogCallDialog from "@/components/activities/LogCallDialog";
import AddNoteDialog from "@/components/activities/AddNoteDialog";

// ── Header with action buttons + dialogs ────────────────────────────────────

export default function ActivitiesTab({ leadId }: { leadId: string }) {
    const [logCallOpen, setLogCallOpen] = useState(false);
    const [addNoteOpen, setAddNoteOpen] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">Activity Timeline</h2>
                <div className="flex items-center gap-2">
                    <Button
                        id="add-note-button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => setAddNoteOpen(true)}
                    >
                        <Pencil className="w-3.5 h-3.5 mr-1.5" />
                        Add Note
                    </Button>
                    <Button
                        id="log-call-button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => setLogCallOpen(true)}
                    >
                        <Phone className="w-3.5 h-3.5 mr-1.5" />
                        Log Call
                    </Button>
                </div>
            </div>

            <Timeline leadId={leadId} />

            <LogCallDialog
                leadId={leadId}
                open={logCallOpen}
                onOpenChange={setLogCallOpen}
            />
            <AddNoteDialog
                leadId={leadId}
                open={addNoteOpen}
                onOpenChange={setAddNoteOpen}
            />
        </div>
    );
}

// ── Timeline (existing, exported for direct use) ─────────────────────────────



export const Timeline = ({ leadId }: { leadId: string }) => {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading, isError, error } = useGetLeadActivities({
        leadId,
        page,
        pageSize,
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 text-slate-400">
                <div className="animate-pulse flex items-center gap-2">
                    <div className="h-2 w-2 bg-slate-200 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-medium">
                {getApiErrorMessage(error, "Failed to load activities")}
            </div>
        );
    }

    const activities = data?.activities ?? []
    if (activities.length === 0) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-100 rounded-3xl">
                <History className="w-10 h-10 text-slate-200" />
                <p className="text-sm font-medium tracking-tight">No activities recorded yet</p>
            </div>
        );
    }

    const total = data?.pagination.total ?? 0;
    const pageCount = data?.pagination.pages ?? 0;
    const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const endItem = total === 0 ? 0 : Math.min(page * pageSize, total);

    return (
        <div className="space-y-0 px-2 py-4">
            {activities.map((activity, idx) => {
                const Icon = activityIcons[activity.type] || PlusCircle;
                const label = activityLabels[activity.type] || "Activity";
                const isLast = idx === activities.length - 1;

                return (
                    <div key={activity.id} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-border group-hover:bg-white group-hover:shadow-sm transition-all">
                                <Icon className="h-5 w-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                            </div>
                            {!isLast && <div className="w-px flex-1 bg-border my-2" />}
                        </div>
                        <div className="flex-1 pb-10">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900 leading-none">{label}</span>
                                    {activity.actor && (
                                        <span className="text-xs font-medium text-slate-400">
                                            · by {activity.actor.name}
                                        </span>
                                    )}
                                </div>
                                <span
                                    className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                                    title={new Date(activity.createdAt).toLocaleString()}
                                >
                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            {activity.content && (
                                <div className="mt-2 text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 border-dashed">
                                    {activity.content}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}

            <Pagination
                startItem={startItem}
                endItem={endItem}
                total={total}
                page={page}
                pageCount={pageCount}
                isLoading={isLoading}
                setPage={setPage}
                itemLabel="activities"
            />
        </div>
    );
};

const activityIcons: Record<ActivityType, LucideIcon> = {
    [ActivityType.LEAD_CREATED]: PlusCircle,
    [ActivityType.LEAD_UPDATED]: Pencil,
    [ActivityType.NOTE]: Pencil,
    [ActivityType.CALL_ATTEMPT]: Phone,
    [ActivityType.STATUS_CHANGE]: CheckCircle,
    [ActivityType.STAGE_CHANGE]: ArrowRight,
    [ActivityType.ASSIGNMENT_CHANGE]: User,
    [ActivityType.REMINDER_CREATED]: Bell,
    [ActivityType.ATTACHMENT_ADDED]: Paperclip,
    [ActivityType.AI_LEAD_BRIEF_GENERATED]: Brain,
    [ActivityType.AI_FOLLOWUP_DRAFT_GENERATED]: Brain,
}

const activityLabels: Record<ActivityType, string> = {
    [ActivityType.LEAD_CREATED]: "Lead Created",
    [ActivityType.LEAD_UPDATED]: "Lead Updated",
    [ActivityType.NOTE]: "Note",
    [ActivityType.CALL_ATTEMPT]: "Call Attempt",
    [ActivityType.STATUS_CHANGE]: "Status Change",
    [ActivityType.STAGE_CHANGE]: "Stage Change",
    [ActivityType.ASSIGNMENT_CHANGE]: "Assignment Change",
    [ActivityType.REMINDER_CREATED]: "Reminder Created",
    [ActivityType.ATTACHMENT_ADDED]: "Attachment Added",
    [ActivityType.AI_LEAD_BRIEF_GENERATED]: "AI Lead Brief",
    [ActivityType.AI_FOLLOWUP_DRAFT_GENERATED]: "AI Followup Draft",
}