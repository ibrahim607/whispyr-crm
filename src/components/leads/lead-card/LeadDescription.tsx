import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEditLead } from '@/lib/tanstack/useLeads'
import { Loader2 } from 'lucide-react'
import { editLeadSchema } from '@/modules/leads/schema'
import { z } from 'zod'
import { toast } from 'sonner'

interface LeadDescriptionProps {
    leadId: string
    name: string
    email: string
    phone: string
    createdAt: Date
    isEditing: boolean
    onSuccess?: () => void
}

export default function LeadDescription({ leadId, name: initialName, email: initialEmail, phone: initialPhone, createdAt, isEditing, onSuccess, onCancel }: LeadDescriptionProps & { onCancel: () => void }) {
    const [name, setName] = useState(initialName)
    const [email, setEmail] = useState(initialEmail)
    const [phone, setPhone] = useState(initialPhone)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const { mutate: updateLead, isPending } = useEditLead(leadId)

    useEffect(() => {
        setName(initialName)
        setEmail(initialEmail)
        setPhone(initialPhone)
        setErrors({})
    }, [initialName, initialEmail, initialPhone, isEditing])

    const handleSave = () => {
        const result = editLeadSchema.safeParse({ name, email, phone })

        if (!result.success) {
            const fieldErrors: Record<string, string> = {}
            result.error.issues.forEach((issue: z.ZodIssue) => {
                if (issue.path[0]) {
                    fieldErrors[issue.path[0] as string] = issue.message
                }
            })
            setErrors(fieldErrors)
            return
        }

        setErrors({})
        updateLead({ name, email, phone }, {
            onSuccess: () => {
                toast.success("Lead details updated successfully!")
                onSuccess?.()
            },
            onError: (error) => {
                toast.error(error.message || "Failed to update lead details")
            }
        })
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date)
    }

    const fieldStyle = "flex flex-col py-3 border-b border-gray-50 last:border-0"
    const rowStyle = "flex items-center w-full"
    const labelStyle = "w-1/3 text-sm font-medium text-slate-400"
    const valueStyle = "w-2/3 text-sm font-semibold text-slate-700 text-right"
    const inputStyle = "w-2/3 text-sm font-semibold text-slate-700 text-right h-8 border-slate-200"

    return (
        <div className='flex flex-col bg-white p-8 rounded-2xl border border-slate-100 shadow-md transition-all'>
            <div className='flex items-center justify-between mb-4'>
                <h4 className='text-lg font-bold text-slate-800'>Lead Information</h4>
            </div>

            <div className='flex flex-col space-y-1'>
                <div className={fieldStyle}>
                    <div className={rowStyle}>
                        <span className={labelStyle}>Full Name</span>
                        {isEditing ? (
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`${inputStyle} ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                        ) : (
                            <span className={valueStyle}>{initialName}</span>
                        )}
                    </div>
                    {isEditing && errors.name && <span className="text-[10px] text-red-500 text-right mt-1">{errors.name}</span>}
                </div>

                <div className={fieldStyle}>
                    <div className={rowStyle}>
                        <span className={labelStyle}>Email</span>
                        {isEditing ? (
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`${inputStyle} ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                        ) : (
                            <span className={valueStyle}>{initialEmail}</span>
                        )}
                    </div>
                    {isEditing && errors.email && <span className="text-[10px] text-red-500 text-right mt-1">{errors.email}</span>}
                </div>

                <div className={fieldStyle}>
                    <div className={rowStyle}>
                        <span className={labelStyle}>Phone</span>
                        {isEditing ? (
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className={`${inputStyle} ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                        ) : (
                            <span className={valueStyle}>{initialPhone}</span>
                        )}
                    </div>
                    {isEditing && errors.phone && <span className="text-[10px] text-red-500 text-right mt-1">{errors.phone}</span>}
                </div>

                <div className="flex items-center py-3 border-b border-gray-50 last:border-0">
                    <span className={labelStyle}>Created</span>
                    <span className={valueStyle}>{formatDate(createdAt)}</span>
                </div>
            </div>

            {isEditing && (
                <div className='pt-6 mt-4 border-t border-slate-50 flex gap-3'>
                    <Button
                        className='flex-1 hover:bg-blue-800 h-10 bg-blue-700 text-white'
                        onClick={handleSave}
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                    <Button
                        variant="destructive"
                        className='flex-1 text-white bg-red-600 hover:bg-red-700 h-10'
                        onClick={onCancel}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    )
}
