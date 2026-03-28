"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAddNote } from "@/lib/tanstack/useActivities";

interface AddNoteDialogProps {
    leadId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AddNoteDialog({
    leadId,
    open,
    onOpenChange,
}: AddNoteDialogProps) {
    const [content, setContent] = useState("");

    const { mutate, isPending } = useAddNote(leadId);

    const handleClose = (value: boolean) => {
        if (!value) {
            setContent("");
        }
        onOpenChange(value);
    };

    const handleSave = () => {
        const trimmed = content.trim();
        if (!trimmed) return;

        mutate(
            { content: trimmed },
            {
                onSuccess: () => {
                    setContent("");
                    onOpenChange(false);
                },
            },
        );
    };

    const isDisabled = !content.trim() || isPending;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Note</DialogTitle>
                </DialogHeader>

                <div className="space-y-2 py-2">
                    <Label htmlFor="add-note-content">Note</Label>
                    <Textarea
                        id="add-note-content"
                        placeholder="Enter your note here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={5}
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
                    <Button onClick={handleSave} disabled={isDisabled}>
                        {isPending ? "Saving…" : "Save Note"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
