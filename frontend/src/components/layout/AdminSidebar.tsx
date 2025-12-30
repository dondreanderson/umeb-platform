"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Vote,
    Award,
    Calendar,
    CreditCard,
    Settings,
    LogOut,
    Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sidebarItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/members", label: "Members", icon: Users },
    { href: "/admin/elections", label: "Elections", icon: Vote },
    { href: "/admin/positions", label: "Roles", icon: Award },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: "/admin/fees", label: "Fees", icon: CreditCard },
    //   { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="md:hidden p-4 border-b flex items-center justify-between bg-white">
                <span className="font-bold text-lg">UMEB Admin</span>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:block",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center px-6 font-bold text-xl tracking-tight border-b border-slate-800">
                    UMEB Platform
                </div>
                <div className="py-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                                <div className={cn(
                                    "flex items-center px-6 py-3 text-sm font-medium transition-colors hover:bg-slate-800",
                                    isActive ? "bg-slate-800 text-white border-l-4 border-blue-500" : "text-slate-400 hover:text-white"
                                )}>
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.label}
                                </div>
                            </Link>
                        );
                    })}
                </div>
                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                    <Link href="/" className="flex items-center text-slate-400 hover:text-white text-sm font-medium">
                        <LogOut className="mr-3 h-5 w-5" />
                        Exit Admin
                    </Link>
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
