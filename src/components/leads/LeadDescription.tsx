import React from 'react'

export default function LeadDescription({ name, email, phone, createdAt }: { name: string, email: string, phone: string, createdAt: Date }) {
    return (
        <div className='flex flex-col gap-4 bg-white p-6 rounded-xl border-2 shadow-sm'>
            <div className='flex flex-col gap-2'>
                <h4 className='text-lg font-bold border-b pb-2'>Lead Information</h4>
                <h1 className='text-2xl font-bold'>{name}</h1>
                <p className='text-gray-500'>{email}</p>
                <p className='text-gray-500'>{phone}</p>
                <p className='text-gray-500'>{createdAt.toLocaleDateString()}</p>
            </div>
        </div>
    )
}
