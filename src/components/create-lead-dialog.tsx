"use client";

import { type FormEvent, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateLead } from "@/lib/tanstack/useLeads";
import { useGetAgents } from "@/lib/tanstack/useProfiles";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

function getTextAreaClassName() {
  return "min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50";
}

export function CreateLeadDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [error, setError] = useState("");

  const { data: agents, isLoading: isLoadingAgents } = useGetAgents();

  const createLead = useCreateLead();

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setNote("");
    setAssignedToId("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await createLead.mutateAsync({
        name,
        email,
        phone,
        note: note || undefined,
        assignedToId: assignedToId || undefined,
      });

      toast.success("Lead created successfully!");
      resetForm();
      setOpen(false);
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError, "Failed to create lead"));
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-xl px-4 shadow-sm bg-blue-600 hover:bg-blue-700 cursor-pointer">
          <Plus className="size-4" />
          Create Lead
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
          <DialogDescription>
            Add a new lead with the basic details from the homework brief.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="John Smith"
              disabled={createLead.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="john@example.com"
              disabled={createLead.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+1 555-0123"
              disabled={createLead.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note about this lead..."
              disabled={createLead.isPending}
              className={getTextAreaClassName()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent">Assign Agent (Optional)</Label>
            <Select
              value={assignedToId || "none"}
              onValueChange={(value) => setAssignedToId(value === "none" ? "" : value)}
            >
              <SelectTrigger id="agent" disabled={createLead.isPending || isLoadingAgents}>
                <SelectValue placeholder={isLoadingAgents ? "Loading agents..." : "Select an agent"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {agents?.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter className="px-0 py-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createLead.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createLead.isPending}>
              {createLead.isPending ? "Creating..." : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}