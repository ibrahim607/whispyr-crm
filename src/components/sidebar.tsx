"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Bell, LogOut } from "lucide-react"

import type { profile, Role } from "@/generated/prisma"
import {
    Sidebar as SidebarUI,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Leads",
        href: "/leads",
        icon: Users,
    },
    {
        title: "Reminders",
        href: "/reminders",
        icon: Bell,
    },
]

interface AppSidebarProps {
    role: Role
    user: profile
}

export function Sidebar({ role, user }: AppSidebarProps) {
    const pathname = usePathname()

    return (
        <SidebarUI>
            <SidebarHeader className="border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Whispyr CRM</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.href}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col text-sm leading-tight">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{role}</span>
                    </div>
                </div>
            </SidebarFooter>
        </SidebarUI>
    )
}
