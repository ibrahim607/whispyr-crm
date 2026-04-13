"use client"

import { useGetLeadReminders, useCancelReminder } from "@/lib/tanstack/useReminders"
import { Spinner } from "@/components/ui/spinner"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

function getReminderDisplayStatus(status: string, dueAt: string | Date) {
    if (status === "FIRED") return "completed"
    if (status === "CANCELLED") return "cancelled"
    if (status === "PENDING" && new Date(dueAt) < new Date()) return "overdue"
    return "upcoming"
}

export default function RemindersTab({ leadId }: { leadId: string }) {
    const { data, isLoading, error } = useGetLeadReminders(leadId, { page: 1, pageSize: 10 })
    const cancelReminder = useCancelReminder()

    if (isLoading) {
        return <div className="flex justify-center p-8"><Spinner /></div>
    }

    if (error) {
        return <div className="text-red-500 p-8 text-center bg-red-50 rounded-xl">Error loading reminders</div>
    }

    const reminders = data?.reminders || []

    if (reminders.length === 0) {
        return <div className="text-slate-500 p-8 text-center italic bg-slate-50 rounded-xl">No reminders found.</div>
    }

    return (
        <div className="flex flex-col gap-4">
            {reminders.map(reminder => {
                const displayStatus = getReminderDisplayStatus(reminder.status, reminder.dueAt)
                const isOverdue = displayStatus === "overdue"
                const isCompleted = displayStatus === "completed"
                const isCancelled = displayStatus === "cancelled"
                const isPending = reminder.status === "PENDING"

                return (
                    <div
                        key={reminder.id}
                        className={`border rounded-xl p-5 flex items-center justify-between shadow-sm bg-white ${isOverdue ? "border-red-200" : "border-slate-200"}`}
                    >
                        <div className="flex flex-col gap-1.5 min-w-0 pr-4">
                            <h3 className={`font-medium ${isCompleted || isCancelled ? "text-slate-400 line-through" : "text-slate-900"}`}>
                                {reminder.title}
                            </h3>
                            {isCompleted ? (
                                <p className="text-xs text-slate-400 tracking-wide font-medium">
                                    Completed: {format(new Date(reminder.updatedAt || reminder.dueAt), "MMM d, yyyy")}
                                </p>
                            ) : (
                                <p className={`text-xs font-medium tracking-wide ${isOverdue ? "text-red-500" : "text-slate-500"}`}>
                                    {isOverdue ? "Due: " : "Due: "}{format(new Date(reminder.dueAt), "MMM d, yyyy 'at' h:mm a")} {isOverdue && "(Overdue)"}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            {displayStatus === "upcoming" && (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none px-3 py-1 text-xs font-semibold border-none">
                                    Upcoming
                                </Badge>
                            )}
                            {displayStatus === "overdue" && (
                                <Badge className="bg-red-50 text-red-600 hover:bg-red-50 shadow-none px-3 py-1 text-xs font-semibold border-none">
                                    Overdue
                                </Badge>
                            )}
                            {displayStatus === "completed" && (
                                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 shadow-none px-3 py-1 text-xs font-semibold border-none">
                                    Completed
                                </Badge>
                            )}
                            {displayStatus === "cancelled" && (
                                <Badge variant="outline" className="px-3 py-1 text-xs shadow-none font-semibold text-slate-600 bg-slate-50 border-slate-200">
                                    Cancelled
                                </Badge>
                            )}

                            {isPending && (
                                <>
                                    <Button
                                        size="sm"
                                        onClick={() => cancelReminder.mutate(reminder.id, {
                                            onSuccess: () => toast.success("Reminder cancelled!"),
                                            onError: (err) => toast.error(err.message || "Failed to cancel reminder"),
                                        })}
                                        disabled={cancelReminder.isPending}
                                        className="bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800 shadow-none rounded-lg px-4 h-8 transition-colors text-xs font-semibold"
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}