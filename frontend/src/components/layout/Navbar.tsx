"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";
import { memberService, Member } from "@/services/member";
import { LogOut, User, Settings, Shield } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<Member | null>(null);

    useEffect(() => {
        const t = authService.getToken();
        setToken(t);
        if (t) {
            memberService.getMe().then(setUser).catch(() => {
                authService.logout();
                setToken(null);
            });
        }
    }, []);

    const handleLogout = () => {
        authService.logout();
        setToken(null);
        setUser(null);
        router.push("/");
    };

    const isAdmin = user?.role === "admin";

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 mr-6">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                        <Image
                            src="/UMEB LOGO.jpg"
                            alt="UMEB Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="hidden font-bold sm:inline-block text-primary text-lg">
                        UMEB Platform
                    </span>
                </Link>
                <nav className="flex items-center gap-6 text-sm font-medium">
                    <Link
                        href="/about"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        About
                    </Link>
                    <Link
                        href="/events"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Events
                    </Link>

                    {/* Admin Links */}
                    {/* Admin Links - Moved to Sidebar
                    {isAdmin && (
                        <>
                            <Link href="/admin/elections" className="text-foreground/60 hover:text-primary">Elections</Link>
                            <Link href="/admin/members" className="text-foreground/60 hover:text-primary">Members</Link>
                            <Link href="/admin/positions" className="text-foreground/60 hover:text-primary">Roles</Link>
                        </>
                    )} 
                    */}

                    {/* Member Links */}
                    {token && !isAdmin && (
                        <Link href="/portal/vote" className="text-foreground/60 hover:text-primary">Vote</Link>
                    )}
                </nav>

                <div className="ml-auto flex items-center gap-2">
                    {token ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.full_name || "User"}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/portal/profile">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>My Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin/dashboard">
                                            <Shield className="mr-2 h-4 w-4" />
                                            <span>Admin Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm" variant="default" className="bg-secondary hover:bg-secondary/90 text-white">
                                    Join Us
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
