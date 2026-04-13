import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useCancelReminder, useCompleteReminder } from "@/lib/tanstack/useReminders";

export function getReminderDisplayStatus(status: string, dueAt: string | Date) {
    if (status === "FIRED" || status === "COMPLETED") return "completed";
    if (status === "CANCELLED") return "cancelled";
    if (status === "PENDING" && new Date(dueAt) < new Date()) return "overdue";
    return "upcoming";
}

export function ReminderStatusBadge({ status, dueAt }: { status: string; dueAt: string | Date }) {
    const display = getReminderDisplayStatus(status, dueAt);
    
    // Custom dynamic visual variants for polished feel
    const badgeStyles: Record<string, string> = {
        upcoming: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-none",
        overdue: "bg-red-100 text-red-700 hover:bg-red-200 border-none",
        completed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none",
        cancelled: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-none",
    };

    const labelMap: Record<string, string> = {
        upcoming: "Upcoming",
        overdue: "Overdue",
        completed: "Completed",
        cancelled: "Cancelled",
    };

    return <Badge className={`${badgeStyles[display]} shadow-sm font-semibold tracking-wide`}>{labelMap[display]}</Badge>;
}

interface ReminderCardProps {
    reminder: any;
}

export function ReminderCard({ reminder }: ReminderCardProps) {
    const cancelReminder = useCancelReminder();
    const completeReminder = useCompleteReminder();

    const displayStatus = getReminderDisplayStatus(reminder.status, reminder.dueAt);
    const isPending = reminder.status === "PENDING";
    const isOverdue = displayStatus === "overdue";

    // Build the dynamic bordering based on Status
    let cardBorder = "border-slate-200";
    if (isOverdue) cardBorder = "border-red-200 shadow-red-100";
    if (displayStatus === "completed") cardBorder = "border-emerald-200";

    return (
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-white border ${cardBorder} shadow-sm hover:shadow-md rounded-2xl transition-all w-full gap-4`}>
            
            {/* Left Box: Meta Info */}
            <div className="flex flex-col gap-2 w-full md:w-3/4">
                <div className="flex items-center gap-3">
                    <ReminderStatusBadge status={reminder.status} dueAt={reminder.dueAt} />
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
                        {isOverdue ? <Clock className="w-3.5 h-3.5" /> : <CalendarIcon className="w-3.5 h-3.5" />}
                        {format(new Date(reminder.dueAt), "MMM d, h:mm a")}
                    </div>
                </div>

                <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">
                        {reminder.title}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-sm text-slate-500">Related to:</span>
                        <Link
                            href={`/leads/leadInfo?id=${reminder.lead.id}`}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                            {reminder.lead.name}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Box: Actions */}
            <div className="flex items-center justify-end w-full md:w-auto gap-3">
                {(isPending || reminder.status === "FIRED") && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 border-emerald-200 transition-all font-semibold"
                            onClick={() => completeReminder.mutate(reminder.id, {
                                onSuccess: () => toast.success("Reminder completed!"),
                                onError: (err) => toast.error(err.message || "Failed to complete reminder")
                            })}
                            disabled={completeReminder.isPending}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Done
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 border-red-200 transition-all font-semibold"
                            onClick={() => cancelReminder.mutate(reminder.id, {
                                onSuccess: () => toast.success("Reminder cancelled!"),
                                onError: (err) => toast.error(err.message || "Failed to cancel reminder")
                            })}
                            disabled={cancelReminder.isPending}
                        >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            Cancel
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
