"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, Vote, Activity, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of platform activity.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+2350</div>
                        <p className="text-xs text-muted-foreground">
                            +180.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                            +2 new this week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Elections</CardTitle>
                        <Vote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">
                            Voting in progress
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-slate-50/50 rounded-md border border-dashed">
                            Chart Placeholder (Recharts)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Link href="/admin/members" className="block">
                                <Button variant="outline" className="w-full justify-start h-auto py-4">
                                    <Users className="mr-4 h-5 w-5" />
                                    <div className="text-left">
                                        <div className="font-semibold">Manage Members</div>
                                        <div className="text-xs text-muted-foreground">Add or update accounts</div>
                                    </div>
                                    <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                                </Button>
                            </Link>
                            <Link href="/admin/events/create" className="block">
                                <Button variant="outline" className="w-full justify-start h-auto py-4">
                                    <Calendar className="mr-4 h-5 w-5" />
                                    <div className="text-left">
                                        <div className="font-semibold">Create Event</div>
                                        <div className="text-xs text-muted-foreground">Schedule a new meeting</div>
                                    </div>
                                    <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                                </Button>
                            </Link>
                            <Link href="/admin/fees" className="block">
                                <Button variant="outline" className="w-full justify-start h-auto py-4">
                                    <DollarSign className="mr-4 h-5 w-5" />
                                    <div className="text-left">
                                        <div className="font-semibold">Membership Dues</div>
                                        <div className="text-xs text-muted-foreground">Review payments</div>
                                    </div>
                                    <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
