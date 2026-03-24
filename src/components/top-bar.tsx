import React from 'react'
import { Menu } from 'lucide-react'
import { Profile } from '@/generated/prisma/client'

export default function TopBar({ profile }: { profile: Profile }) {
    return (
        <div className="flex p-4 border-b-2 border-border font-sans w-full justify-around">
            <Menu className='size-6' />
            <div className='px-6'>|</div>
            <h1 className="text-xl">welcome, <span className='text-blue-600'>{profile.role}</span> {profile.name}</h1>
            <p className='ml-auto text-muted-foreground'>{profile.email}</p>
        </div>
    )
}