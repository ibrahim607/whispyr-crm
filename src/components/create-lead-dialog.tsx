"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { LeadStage, LeadStatus } from "@/generated/prisma/enums"
import { useCreateLead } from "@/lib/tanstack/useLeads"
import { useState } from "react"

export function CreateLeadDialog() {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [stage, setStage] = useState<LeadStage>(LeadStage.NEW)
  const [status, setStatus] = useState(LeadStatus.OPEN)
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)

  const { mutateAsync: createLead } = useCreateLead({ name, email, phone, stage, status, note });

  const handleSave = async () => {
    setError(null)
    try {
      await createLead()
    } catch (err: any) {
      const serverError = err?.response?.data?.error;
      if (typeof serverError === "object" && serverError !== null) {
        // Collect all Zod error messages
        const messages = Object.values(serverError).flat().join(", ");
        setError(messages || "Validation error");
      } else {
        setError(serverError || err.message || "Failed to create lead");
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="p-4 bg-blue-600">
          + Create lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-screen">
        <DialogHeader>
          <DialogTitle>Create Lead</DialogTitle>
          <DialogDescription>
            Add a new lead to your CRM.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Field>
            <FieldLabel>Full Name</FieldLabel>
            <FieldContent>
              <Input placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <FieldContent>
              <Input type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Phone</FieldLabel>
            <FieldContent>
              <Input type="tel" placeholder="123-456-7890" value={phone} onChange={e => setPhone(e.target.value)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Stage</FieldLabel>
            <FieldContent>
              <Select defaultValue="NEW" onValueChange={(val) => setStage(val as LeadStage)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="QUALIFIED">Qualified</SelectItem>
                  <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Notes</FieldLabel>
            <FieldContent>
              <Textarea placeholder="Add notes or background context about the lead..." className="resize-none h-24" value={note} onChange={e => setNote(e.target.value)} />
            </FieldContent>
          </Field>
        </div>
        {error && (
          <div className="text-sm font-medium text-destructive mt-2">
            {error}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button type="submit" className="bg-blue-600" onClick={handleSave}>Save lead</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}