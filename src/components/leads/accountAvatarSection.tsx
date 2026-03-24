import { Avatar, AvatarFallback } from '../ui/avatar'

export default function AccountAvatarSection({ name, email }: { name: string, email: string }) {
    const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
    
    return (
        <div className='flex flex-row items-center gap-4 bg-white p-6 rounded-xl border-2 shadow-sm'>
            <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl bg-blue-100 text-blue-700">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
                <p className="text-gray-500">{email}</p>
            </div>
        </div>
    )
}
