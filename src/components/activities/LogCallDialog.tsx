"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { useLogCallAttempt } from "@/lib/tanstack/useActivities";
import { useGenerateCallFollowup } from "@/lib/tanstack/useAi";
import { toast } from "sonner";
import { CallOutcome } from "@/modules/activity";
import { CallFollowUp } from "@/modules/ai/schema";
import { FollowupReview } from "./FollowupReview";

interface LogCallDialogProps {
    leadId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const outcomeLabels: Record<CallOutcome, string> = {
    NO_ANSWER: "No Answer",
    ANSWERED: "Answered",
    WRONG_NUMBER: "Wrong Number",
    BUSY: "Busy",
    CALL_BACK_LATER: "Call Back Later",
};

const outcomeValues: CallOutcome[] = [
    "NO_ANSWER",
    "ANSWERED",
    "WRONG_NUMBER",
    "BUSY",
    "CALL_BACK_LATER",
];

export default function LogCallDialog({
    leadId,
    open,
    onOpenChange,
}: LogCallDialogProps) {
    const [step, setStep] = useState<"log" | "suggest" | "review">("log");
    const [followUpData, setFollowUpData] = useState<CallFollowUp | null>(null);

    const [outcome, setOutcome] = useState<CallOutcome | "">("");
    const [notes, setNotes] = useState("");

    const { mutate, isPending } = useLogCallAttempt(leadId);
    const { mutate: generateFollowup, isPending: isGenerating } = useGenerateCallFollowup(leadId);

    const handleClose = (value: boolean) => {
        if (!value) {
            setOutcome("");
            setNotes("");
            setStep("log");
            setFollowUpData(null);
        }
        onOpenChange(value);
    };

    const handleSave = () => {
        if (!outcome) return;

        mutate(
            { outcome, notes: notes.trim() || undefined },
            {
                onSuccess: () => {
                    toast.success("Call logged successfully!");
                    setStep("suggest");
                },
                onError: (err) => {
                    toast.error(err.message || "Failed to log call");
                },
            },
        );
    };

    const handleGetSuggestion = () => {
        generateFollowup(undefined, {
            onSuccess: (data) => {
                setFollowUpData(data);
                setStep("review");
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {step === "log" && "Log Call Attempt"}
                        {step === "suggest" && "Call Logged"}
                        {step === "review" && "AI Follow-up Strategy"}
                    </DialogTitle>
                </DialogHeader>

                {step === "log" && (
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="log-call-outcome">Outcome</Label>
                            <Select
                                value={outcome}
                                onValueChange={(value) => setOutcome(value as CallOutcome)}
                            >
                                <SelectTrigger id="log-call-outcome">
                                    <SelectValue placeholder="Select an outcome…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {outcomeValues.map((val) => (
                                        <SelectItem key={val} value={val}>
                                            {outcomeLabels[val]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="log-call-notes">Notes (optional)</Label>
                            <Textarea
                                id="log-call-notes"
                                placeholder="What was discussed?"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                maxLength={5000}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => handleClose(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={!outcome || isPending}
                            >
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Call
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === "suggest" && (
                    <div className="space-y-6 py-6 text-center flex flex-col items-center">
                        <div className="bg-primary/10 p-4 rounded-full">
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Want AI to suggest a follow-up?</h3>
                            <p className="text-sm text-muted-foreground">
                                Get a generated call script, next steps, and a smart reminder based on the call you just logged.
                            </p>
                        </div>
                        <DialogFooter className="w-full sm:justify-center flex-col sm:flex-row gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => handleClose(false)}
                                disabled={isGenerating}
                            >
                                Skip
                            </Button>
                            <Button
                                onClick={handleGetSuggestion}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="mr-2 h-4 w-4" />
                                )}
                                Get AI Suggestion
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === "review" && followUpData && (
                    <FollowupReview
                        followUpData={followUpData}
                        leadId={leadId}
                        onClose={() => handleClose(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
