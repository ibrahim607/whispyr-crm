import React from 'react'

interface LeadDescriptionProps {
    name: string
    email: string
    phone: string
    createdAt: Date
}

export default function LeadDescription({ name, email, phone, createdAt }: LeadDescriptionProps) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date)
    }

    const fieldStyle = "flex py-3 border-b border-gray-50 last:border-0"
    const labelStyle = "w-1/3 text-sm font-medium text-slate-400"
    const valueStyle = "w-2/3 text-sm font-semibold text-slate-700 text-right"

    return (
        <div className='flex flex-col bg-white p-8 rounded-2xl border border-slate-100 shadow-md transition-all h-full'>
            <h4 className='text-lg font-bold text-slate-800 mb-4'>Lead Information</h4>

            <div className='flex flex-col'>
                <div className={fieldStyle}>
                    <span className={labelStyle}>Full Name</span>
                    <span className={valueStyle}>{name}</span>
                </div>

                <div className={fieldStyle}>
                    <span className={labelStyle}>Email</span>
                    <span className={valueStyle}>{email}</span>
                </div>

                <div className={fieldStyle}>
                    <span className={labelStyle}>Phone</span>
                    <span className={valueStyle}>{phone}</span>
                </div>

                <div className={fieldStyle}>
                    <span className={labelStyle}>Created</span>
                    <span className={valueStyle}>{formatDate(createdAt)}</span>
                </div>
            </div>
        </div>
    )
}
