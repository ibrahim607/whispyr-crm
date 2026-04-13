import { DashboardData } from "@/modules/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { BarChart, XAxis, Bar, CartesianGrid, Cell } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import React from "react"

const ByStageBreakdown = ({ data }: { data: DashboardData["totalLeadsByStage"] }) => {

    const stageColors: Record<string, string> = {
        NEW: "hsl(217, 91%, 60%)",          // Blue
        CONTACTED: "hsl(262, 83%, 58%)",    // Violet
        QUALIFIED: "hsl(142, 71%, 45%)",    // Green
        NEGOTIATING: "hsl(48, 96%, 53%)",   // Yellow
    }

    const chartConfig = {
        count: {
            label: "Leads",
        },
    } satisfies ChartConfig

    return (
        <Card className="col-span-1 ">
            <CardHeader>
                <CardTitle>Leads by Stage</CardTitle>
            </CardHeader>
            <CardContent className="mt-15">
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="stage"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="count" radius={8}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={stageColors[entry.stage] || "hsl(var(--muted))"} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card >
    )
}
export default ByStageBreakdown