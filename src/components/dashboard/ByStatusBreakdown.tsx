import { DashboardData } from "@/modules/dashboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { PieChart, Pie, Label, Cell } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import * as React from "react"

const ByStatusBreakdown = ({ data }: { data: DashboardData["totalLeadsByStatus"] }) => {

    const statusColors: Record<string, string> = {
        OPEN: "hsl(217, 91%, 60%)",    // Blue
        WON: "hsl(142, 71%, 45%)",     // Green
        LOST: "hsl(0, 84%, 60%)",      // Red
    }

    const chartData = React.useMemo(() => {
        return data.map((item) => ({
            ...item,
            fill: statusColors[item.status] || "hsl(var(--muted))"
        }))
    }, [data])

    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {
            count: {
                label: "Leads",
            }
        }
        data.forEach((item) => {
            config[item.status] = {
                label: item.status,
                color: statusColors[item.status] || "hsl(var(--muted))"
            }
        })
        return config
    }, [data])

    const totalLeads = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.count, 0)
    }, [data])

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-2">
                <CardTitle>Leads by Status</CardTitle>
                <CardDescription>Current distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="count"
                            nameKey="status"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {totalLeads.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Leads
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
export default ByStatusBreakdown
