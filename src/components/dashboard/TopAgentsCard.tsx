import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface TopAgent {
    id: string;
    name: string;
    leadsCount: number;
    wonCount: number;
}

interface TopAgentsCardProps {
    topAgents: TopAgent[];
}

export default function TopAgentsCard({ topAgents }: TopAgentsCardProps) {
    if (!topAgents || topAgents.length === 0) {
        return (
            <Card className="col-span-1 sm:col-span-2 lg:col-span-1 shadow-sm border-2">
                <CardHeader className="pb-3 border-b bg-gray-50/50">
                    <CardTitle className="text-lg font-bold text-gray-800">Top Performing Agents</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col gap-2">
                    <p className="text-sm text-gray-500 text-center py-4 font-medium tracking-tight">No top agents yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 sm:col-span-2 lg:col-span-1 shadow-sm border-2">
            <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-lg font-bold text-gray-800">Top Performing Agents</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-2">
                {topAgents.map((agent, index) => {
                    const initials = agent.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                    return (
                        <div key={agent.id} className="flex items-center justify-between p-2.5 hover:bg-gray-50/80 rounded-xl transition-all border border-transparent hover:border-gray-100 hover:shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-gray-100">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 font-bold">{initials}</AvatarFallback>
                                    </Avatar>
                                    {index === 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-yellow-900 shadow-sm ring-2 ring-white">1</span>
                                    )}
                                    {index === 1 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 text-[10px] font-bold text-slate-700 shadow-sm ring-2 ring-white">2</span>
                                    )}
                                    {index === 2 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-amber-50 shadow-sm ring-2 ring-white">3</span>
                                    )}
                                    {index > 2 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-[9px] font-bold text-gray-500 ring-2 ring-white">{index + 1}</span>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-semibold tracking-tight text-gray-900">{agent.name}</p>
                                    <p className="text-xs font-medium text-gray-500 mt-0.5">{agent.wonCount} won / {agent.leadsCount} leads</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-extrabold text-green-600 tracking-tight">
                                    {agent.leadsCount > 0 ? Math.round((agent.wonCount / agent.leadsCount) * 100) : 0}% 
                                </span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Conv</span>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
