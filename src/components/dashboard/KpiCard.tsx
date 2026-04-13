import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface KpiCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    subValue?: string;
}

export default function KpiCard({ label, value, icon, subValue }: KpiCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {label}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subValue && (
                    <p className="text-xs text-muted-foreground">
                        {subValue}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
