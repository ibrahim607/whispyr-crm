"use client";

import { useState } from "react";
import { useGenerateCallFollowup } from "@/lib/tanstack/useAi";
import { useCreateLeadReminder } from "@/lib/tanstack/useReminders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertTriangle,
    Loader2,
    Phone,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export function CallFollowUpAssistant({ leadId }: { leadId: string }) {
    const [error, setError] = useState<string | null>(null);
    const [dismissed, setDismissed] = useState(false);
    const generateFollowup = useGenerateCallFollowup(leadId);
    const createReminder = useCreateLeadReminder(leadId);
    const result = generateFollowup.data ?? null;

    const handleGenerate = () => {
        setError(null);
        setDismissed(false);
        generateFollowup.mutate(undefined, {
            onError: (err) => {
                setError(err.message);
            },
        });
    };

    const handleDismiss = () => {
        setDismissed(true);
    };

    const handleCreateReminder = () => {
        if (!result) return;
        createReminder.mutate(
            {
                leadId,
                title: result.suggestedReminder.title,
                note: result.suggestedReminder.note,
                dueAt: new Date(result.suggestedReminder.suggestedDueAt),
            },
            {
                onSuccess: () => {
                    toast.success("Reminder created!");
                },
                onError: (err) => {
                    toast.error(err.message || "Failed to create reminder.");
                },
            },
        );
    };

    // Result state – compact sidebar card
    if (result && !dismissed) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Phone className="h-5 w-5 text-blue-600" />
                        Call Follow-up Assistant
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Call context banner */}
                    <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3">
                        <p className="text-sm text-emerald-800">
                            Based on your recent call activity
                        </p>
                    </div>

                    {/* Suggested Talking Points */}
                    <div>
                        <h4 className="text-sm font-semibold mb-2">Suggested Talking Points</h4>
                        <ul className="space-y-1.5">
                            {result.callScript.questions.map((question, i) => (
                                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                    <span className="text-muted-foreground/60">•</span>
                                    <span>{question}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Recommended Next Action */}
                    <div>
                        <h4 className="text-sm font-semibold mb-1">Recommended Next Action</h4>
                        <p className="text-sm text-muted-foreground">
                            {result.recommendedNextStep}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                            size="sm"
                            onClick={handleCreateReminder}
                            disabled={createReminder.isPending}
                        >
                            {createReminder.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {createReminder.isPending ? "Creating..." : "Create Reminder"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDismiss}
                        >
                            Dismiss
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Initial / dismissed / loading / error state
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Phone className="h-5 w-5 text-blue-600" />
                    Call Follow-up Assistant
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Generate a follow-up strategy based on your most recent call activity.
                </p>

                <Button
                    onClick={handleGenerate}
                    disabled={generateFollowup.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                    size="sm"
                >
                    {generateFollowup.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Follow-Up
                        </>
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
    );
}
