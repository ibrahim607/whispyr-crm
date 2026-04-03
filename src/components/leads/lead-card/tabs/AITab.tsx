import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGenerateLeadBrief, useSaveLeadBrief, useGetLatestLeadBrief } from "@/lib/tanstack/useAi";
import { AlertTriangle, Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import { useState } from "react";
import { BriefContent } from "../BriefContent";
import { CallFollowUpAssistant } from "../CallFollowUpAssistant";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const AI = ({ leadId }: { leadId: string }) => {
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const generateBrief = useGenerateLeadBrief(leadId);
    const saveBrief = useSaveLeadBrief(leadId);
    const latestBrief = useGetLatestLeadBrief(leadId);
    const queryClient = useQueryClient();

    const handleGenerate = () => {
        setIsSaved(false);
        setError(null);
        generateBrief.mutate(undefined, {
            onError: (error) => {
                setError(error.message);
            }
        });
    };

    const handleSave = () => {
        if (!brief) return;
        saveBrief.mutate(brief, {
            onSuccess: () => {
                setIsSaved(true);
                toast.success("Brief has been saved!");
                queryClient.invalidateQueries({ queryKey: ["leadBrief", leadId] });
            },
            onError: (error) => {
                toast.error("Failed to save brief. It might be already saved!");
                setError(error.message);
            }
        });
    };

    if (latestBrief.isPending) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const brief = generateBrief.data || latestBrief.data?.brief;
    const isPending = generateBrief.isPending;
    const isDisplayingSavedBrief = !generateBrief.data && !!latestBrief.data;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 p-4">
            {/* Left column – Lead Brief */}
            <div className="space-y-4 min-w-0">
                {!brief ? (
                    /* Initial state: no brief yet */
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Sparkles className="h-5 w-5 text-blue-600" />
                                    Lead Brief
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                AI will analyze this lead&apos;s activity history and suggest actions.
                            </p>
                            <Button
                                onClick={handleGenerate}
                                disabled={generateBrief.isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {generateBrief.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating Brief...
                                    </>
                                ) : (
                                    "Generate Lead Brief"
                                )}
                            </Button>
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    /* Brief available */
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Sparkles className="h-5 w-5 text-blue-600" />
                                    Lead Brief
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGenerate}
                                        disabled={isPending}
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        {isPending ? "Generating..." : "Regenerate"}
                                    </Button>
                                    {!isDisplayingSavedBrief && (
                                        <Button
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                            size="sm"
                                            onClick={handleSave}
                                            disabled={saveBrief.isPending || isSaved}
                                        >
                                            {saveBrief.isPending ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="mr-2 h-4 w-4" />
                                            )}
                                            {saveBrief.isPending ? "Saving..." : isSaved ? "Saved ✓" : "Save Brief"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Disclaimer */}
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    AI suggestions can be wrong. Always verify before taking action.
                                </AlertDescription>
                            </Alert>

                            {/* Brief sections */}
                            <BriefContent brief={brief} />
                            {isDisplayingSavedBrief && latestBrief.data?.createdAt && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Saved on {new Date(latestBrief.data.createdAt).toLocaleDateString("en-US")}
                                </p>
                            )}

                            {/* Error */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right column – Call Follow-up Assistant */}
            <div className="min-w-0">
                <CallFollowUpAssistant leadId={leadId} />
            </div>
        </div>
    )
}