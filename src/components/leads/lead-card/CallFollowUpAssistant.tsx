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
import { FollowupReview } from "@/components/activities/FollowupReview";

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
            <div className="bg-card text-card-foreground border rounded-lg shadow-sm">
                <div className="p-6 pb-2 font-semibold flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    Call Follow-up Assistant
                </div>
                <div className="px-4 pb-4">
                    <FollowupReview 
                        followUpData={result} 
                        leadId={leadId} 
                        onClose={handleDismiss} 
                    />
                </div>
            </div>
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
