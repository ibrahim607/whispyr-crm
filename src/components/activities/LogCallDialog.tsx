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
import { useLogCallAttempt } from "@/lib/tanstack/useActivities";
import { CallOutcome } from "@/modules/activity";

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
    const [outcome, setOutcome] = useState<CallOutcome | "">("");
    const [notes, setNotes] = useState("");

    const { mutate, isPending } = useLogCallAttempt(leadId);

    const handleClose = (value: boolean) => {
        if (!value) {
            setOutcome("");
            setNotes("");
        }
        onOpenChange(value);
    };

    const handleSave = () => {
        if (!outcome) return;

        mutate(
            { outcome, notes: notes.trim() || undefined },
            {
                onSuccess: () => {
                    setOutcome("");
                    setNotes("");
                    onOpenChange(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Log Call Attempt</DialogTitle>
                </DialogHeader>

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
                        {isPending ? "Saving…" : "Save Call"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
