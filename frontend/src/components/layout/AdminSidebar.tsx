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
    Menu,
    Heart,
    Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as React from "react";
import { memberService, Member } from "@/services/member";

const sidebarItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/members", label: "Members", icon: Users },
    { href: "/admin/elections", label: "Elections", icon: Vote, requiredTier: "professional" },
    { href: "/admin/positions", label: "Roles", icon: Award },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: "/admin/fundraising", label: "Fundraising", icon: Heart, requiredTier: "business" },
    { href: "/admin/fees", label: "Fees", icon: CreditCard },
    //   { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = React.useState(false);
    const [currentUser, setCurrentUser] = React.useState<Member | null>(null);

    React.useEffect(() => {
        async function loadUser() {
            try {
                const user = await memberService.getMe();
                setCurrentUser(user);
            } catch (error) {
                console.error("Failed to load user:", error);
            }
        }
        loadUser();
    }, []);

    const userTier = currentUser?.tenant?.plan_tier || "starter";

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
                <div className="flex flex-col h-16 px-6 py-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-400" />
                        <span className="font-bold text-lg tracking-tight">
                            {currentUser?.tenant?.name || "UMEB Platform"}
                        </span>
                    </div>
                    {currentUser?.tenant && (
                        <Badge variant="outline" className={cn(
                            "text-[9px] font-black uppercase px-1.5 py-0 w-fit mt-1",
                            userTier === "business" ? "border-purple-400 text-purple-400" :
                                userTier === "professional" ? "border-blue-400 text-blue-400" :
                                    "border-slate-500 text-slate-400"
                        )}>
                            {userTier}
                        </Badge>
                    )}
                </div>
                <div className="py-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        const requiredTier = (item as any).requiredTier;
                        const tierRank = { starter: 1, professional: 2, business: 3 };
                        const hasAccess = !requiredTier || tierRank[userTier as keyof typeof tierRank] >= tierRank[requiredTier as keyof typeof tierRank];

                        return (
                            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                                <div className={cn(
                                    "flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors hover:bg-slate-800",
                                    isActive ? "bg-slate-800 text-white border-l-4 border-blue-500" : "text-slate-400 hover:text-white",
                                    !hasAccess && "opacity-50"
                                )}>
                                    <div className="flex items-center">
                                        <item.icon className="mr-3 h-5 w-5" />
                                        {item.label}
                                    </div>
                                    {requiredTier && (
                                        <Badge variant="outline" className={cn(
                                            "text-[8px] font-black uppercase px-1 py-0",
                                            requiredTier === "business" ? "border-purple-400 text-purple-400" :
                                                "border-blue-400 text-blue-400"
                                        )}>
                                            {requiredTier === "professional" ? "PRO" : "BIZ"}
                                        </Badge>
                                    )}
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
