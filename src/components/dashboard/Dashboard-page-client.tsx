"use client";

import { useDashboardOverview } from "@/lib/tanstack/useDashboardOverview";
import { AlertCircle, Percent, UserPlus, Users } from "lucide-react";
import { useMemo } from "react";
import KpiCard from "./KpiCard";
import { Role } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import ByStageBreakdown from "./ByStageBreakdown";
import TopAgentsCard from "./TopAgentsCard";
import { Skeleton } from "@/components/ui/skeleton";


function formatWeekOverWeekSubtext(
    percentChange: number | null,
): string | undefined {
    if (percentChange === null) {
        return "No new leads in the prior week to compare";
    }
    const sign = percentChange > 0 ? "+" : "";
    return `${sign}${percentChange.toFixed(1)}% vs last week`;
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6 p-4 md:p-6 animate-in fade-in duration-300">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-80" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border bg-card p-6 space-y-3">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
                <div className="rounded-xl border bg-card p-6 space-y-3">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export function DashboardPageClient({ role }: { role: Role }) {
    const { data, isLoading, error } = useDashboardOverview();

    const { subHeaderText, secondRowGridStyle } = useMemo(() => {
        if (role === "AGENT") {
            return {
                subHeaderText: "Review the current state of your leads in your pipeline.",
                secondRowGridStyle: "grid-cols-1"
            }
        }
        return {
            subHeaderText: "Review the current state of the pipeline in your organization.",
            secondRowGridStyle: "grid-cols-4"
        }
    }, [role]);

    if (isLoading) return <DashboardSkeleton />;
    if (error || !data)
        return (
            <div className="p-6 space-y-4">
                <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center space-y-3">
                    <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
                    <h3 className="text-lg font-semibold text-red-800">Failed to load dashboard</h3>
                    <p className="text-sm text-red-600">{error?.message ?? "An unknown error occurred. Please try again."}</p>
                </div>
            </div>
        );

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">{subHeaderText}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    label="Total leads"
                    value={data.totalLeads}
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                />
                <KpiCard
                    label="New leads this week"
                    value={data.newLeadsThisWeek.count}
                    icon={<UserPlus className="h-4 w-4 text-muted-foreground" />}
                    subValue={formatWeekOverWeekSubtext(
                        data.newLeadsThisWeek.percentChangeFromLastWeek,
                    )}
                />
                <KpiCard
                    label="Conversion rate"
                    value={`${data.conversionRate.percentage.toFixed(1)}%`}
                    icon={<Percent className="h-4 w-4 text-muted-foreground" />}
                    subValue={`${data.conversionRate.won} won / ${data.conversionRate.total} total leads`}
                />

                <KpiCard
                    label="Overdue reminders"
                    value={data.overdueRemindersCount}
                    icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
                />
            </div>

            <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", secondRowGridStyle)}>
                <ByStageBreakdown data={data.totalLeadsByStage} />
                {data.topAgents ? <TopAgentsCard topAgents={data.topAgents} /> : null}
            </div>
        </div>
    );
}