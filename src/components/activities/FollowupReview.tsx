import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useCreateLeadReminder } from "@/lib/tanstack/useReminders";
import { CallFollowUp } from "@/modules/ai/schema";
import { toast } from "sonner";

interface FollowupReviewProps {
    followUpData: CallFollowUp;
    leadId: string;
    onClose: () => void;
}

export function FollowupReview({
    followUpData,
    leadId,
    onClose,
}: FollowupReviewProps) {
    const { mutate: createReminder, isPending } = useCreateLeadReminder(leadId);

    const handleCreateReminder = () => {
        createReminder(
            {
                leadId,
                title: followUpData.suggestedReminder.title,
                note: followUpData.suggestedReminder.note,
                dueAt: new Date(followUpData.suggestedReminder.suggestedDueAt),
            },
            {
                onSuccess: () => {
                    toast.success("Reminder created from AI follow-up!");
                    onClose();
                },
                onError: (err) => {
                    toast.error(err.message || "Failed to create reminder");
                },
            }
        );
    };

    return (
        <div className="space-y-4 py-2">
            <Alert>
                <AlertDescription className="text-sm text-muted-foreground">
                    This follow-up suggestion is AI-generated based on the call you just logged. The reminder will only be created if you click &quot;Create Reminder&quot;.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader className="py-3">
                    <CardTitle className="text-md">Call Script</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold">Opening</h4>
                        <p className="text-sm text-muted-foreground">
                            {followUpData.callScript.opening}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold">Questions to Ask</h4>
                        <ul className="list-decimal list-inside text-sm text-muted-foreground">
                            {followUpData.callScript.questions.map((q, idx) => (
                                <li key={idx}>{q}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Objection Handlers</h4>
                        <div className="space-y-2">
                            {followUpData.callScript.objectionHandlers.map((handler, idx) => (
                                <div key={idx} className="border rounded p-2 text-sm">
                                    <span className="font-semibold">{handler.objection}: </span>
                                    <span className="text-muted-foreground">{handler.response}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="py-3">
                    <CardTitle className="text-md">Recommended Next Step</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {followUpData.recommendedNextStep}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="py-3">
                    <CardTitle className="text-md">Suggested Reminder</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <p><span className="font-semibold text-foreground">Title:</span> {followUpData.suggestedReminder.title}</p>
                        <p><span className="font-semibold text-foreground">Note:</span> {followUpData.suggestedReminder.note}</p>
                        <p><span className="font-semibold text-foreground">Due:</span> {new Date(followUpData.suggestedReminder.suggestedDueAt).toLocaleString()}</p>
                    </div>
                </CardContent>
            </Card>

            <DialogFooter className="mt-4">
                <Button variant="outline" onClick={onClose} disabled={isPending}>
                    Discard
                </Button>
                <Button onClick={handleCreateReminder} disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Reminder
                </Button>
            </DialogFooter>
        </div>
    );
}
