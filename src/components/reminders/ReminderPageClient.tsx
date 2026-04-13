"use client";

import { Badge } from "@/components/ui/badge";
import { useGetMyReminders } from "@/lib/tanstack/useReminders";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/leads/reusable";
import { Profile } from "@/generated/prisma/client";
import { AgentSummary } from "../leads/lead-card/LeadInfoClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

type FilterTab = "all" | "upcoming" | "overdue" | "completed" | "cancelled";

import { ReminderCard } from "./ReminderCard";
import { CalendarX, Filter } from "lucide-react";

function getApiStatusForTab(tab: FilterTab): string | undefined {
  switch (tab) {
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    default:
      return undefined;
  }
}

export function RemindersPageClient({ profile, agents }: { profile: Profile, agents: AgentSummary[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const selectedAgentId = searchParams.get("agentId") || "all";
  const pageSize = 10;

  const isAdminOrManager = profile.role === "ADMIN" || profile.role === "MANAGER";

  const apiStatus = getApiStatusForTab(activeTab);
  const { data, isLoading, isError } = useGetMyReminders({
    page,
    pageSize,
    status: apiStatus,
    agentId: selectedAgentId === "all" ? undefined : selectedAgentId,
  });

  const allReminders = data?.reminders ?? [];

  // Client-side filter for upcoming/overdue (both are PENDING in the DB)
  const reminders = allReminders.filter((r) => {
    if (activeTab === "upcoming") {
      return r.status === "PENDING" && new Date(r.dueAt) >= new Date();
    }
    if (activeTab === "overdue") {
      return r.status === "PENDING" && new Date(r.dueAt) < new Date();
    }
    return true;
  });



  const total = data?.pagination.total ?? 0;
  const pageCount = data?.pagination.pages ?? 0;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(page * pageSize, total);

  // Count overdue for the badge
  const overdueCount = allReminders.filter(
    (r) => r.status === "PENDING" && new Date(r.dueAt) < new Date()
  ).length;

  function handleTabChange(tab: string) {
    setActiveTab(tab as FilterTab);
    setPage(1);
  }

  function handleAgentChange(agentId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (agentId === "all") {
      params.delete("agentId");
    } else {
      params.set("agentId", agentId);
    }
    setPage(1);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-6 w-full h-[calc(100vh-70px)] flex flex-col p-4 md:p-8 bg-slate-50">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          My Reminders
        </h1>
        <p className="text-base font-medium text-slate-500">
          Keep follow-ups visible so nothing slips between conversations.
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
            {[
              { id: "all", label: "All" },
              { id: "upcoming", label: "Upcoming" },
              { id: "overdue", label: "Overdue", count: overdueCount },
              { id: "completed", label: "Completed" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              
              let activeColorBg = "bg-slate-800 text-white shadow-md ring-2 ring-slate-800/20";
              if (tab.id === 'overdue') activeColorBg = "bg-red-500 text-white shadow-md ring-2 ring-red-500/30";
              if (tab.id === 'completed') activeColorBg = "bg-emerald-500 text-white shadow-md ring-2 ring-emerald-500/30";
              if (tab.id === 'upcoming') activeColorBg = "bg-blue-600 text-white shadow-md ring-2 ring-blue-600/30";

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center whitespace-nowrap gap-1.5 px-3.5 py-1.5 m-0.5 md:m-1 rounded-full font-bold text-[13px] transition-all duration-300 outline-none cursor-pointer",
                    isActive 
                      ? activeColorBg 
                      : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:-translate-y-0.5 shadow-sm"
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span 
                      className={cn(
                        "flex items-center justify-center w-4 h-4 text-[9px] rounded-full",
                        isActive ? "bg-white text-red-600 font-extrabold" : "bg-red-500 text-white font-extrabold"
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
        </div>

        {isAdminOrManager && (
          <div className="flex items-center gap-2 w-full md:w-auto md:min-w-[280px]">
            <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-slate-500 shadow-sm shrink-0">
               <Filter className="w-4 h-4" />
            </div>
            <Select
              value={selectedAgentId}
              onValueChange={handleAgentChange}
            >
              <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl shadow-none font-semibold hover:bg-slate-100 transition-colors focus:ring-blue-500 focus:ring-offset-1 h-10">
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-md">
                <SelectItem value="all" className="font-semibold cursor-pointer py-2">All Agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id} className="cursor-pointer py-2 font-medium">
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-24 flex justify-center w-full"><Spinner className="w-8 h-8 text-blue-600" /></div>
      ) : isError ? (
        <div className="py-12 text-center text-sm font-semibold text-red-600 bg-red-50 rounded-2xl border-2 border-red-100">Failed to load reminders. Please try again.</div>
      ) : reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 shadow-sm">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CalendarX className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Inbox Zero!</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-[250px] text-center">There are no reminders matching your current filter. Enjoy your day!</p>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full pb-20">
          <div className="flex flex-col gap-4 mb-6">
              {reminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
          </div>

          {total > pageSize && (
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-2 shadow-sm shrink-0">
                <Pagination
                startItem={startItem}
                endItem={endItem}
                total={total}
                page={page}
                pageCount={pageCount}
                isLoading={isLoading}
                setPage={setPage}
                itemLabel="reminders"
                />
            </div>
          )}
        </div>
      )}
    </div>
  );
}