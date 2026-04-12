"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useExportLeads } from "@/lib/tanstack/useImportExport"
import { Download, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

export function ExportLeadsClient() {
    const exportMutation = useExportLeads()

    const handleExport = async () => {
        try {
            toast.loading("Exporting leads...")

            const csvString = await exportMutation.mutateAsync()

            const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast.dismiss()
            toast.success("Successfully exported leads!")
        } catch (error) {
            console.error("Export error:", error)
            toast.dismiss()
            toast.error("Failed to export leads.")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="size-5 text-blue-600" />
                    Export to CSV
                </CardTitle>
                <CardDescription>
                    Download a full CSV export of all leads in your database, including their current stage, status, assignments, and contact details.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 max-w-sm m-auto">
                    <Button
                        size="lg"
                        onClick={handleExport}
                        disabled={exportMutation.isPending}
                        className="w-full flex gap-2 hover:cursor-pointer bg-blue-600 hover:bg-blue-700"
                    >
                        <Download className="size-5" />
                        {exportMutation.isPending ? "Processing Export..." : "Download Export"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
