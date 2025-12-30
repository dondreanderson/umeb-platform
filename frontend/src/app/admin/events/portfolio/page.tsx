"use client";

import { useEffect, useState } from "react";
import { eventService, Event } from "@/services/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Globe, Tag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface GroupedEvents {
    [key: string]: Event[];
}

export default function PortfolioPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await eventService.getAll();
            setEvents(data);
        } catch (error) {
            console.error("Failed to load events", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    // Group by Region
    const byRegion: GroupedEvents = events.reduce((acc, event) => {
        const region = event.region || "Unassigned";
        if (!acc[region]) acc[region] = [];
        acc[region].push(event);
        return acc;
    }, {} as GroupedEvents);

    // Group by Type
    const byType: GroupedEvents = events.reduce((acc, event) => {
        const type = event.event_type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(event);
        return acc;
    }, {} as GroupedEvents);

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
                <Button variant="ghost" className="w-fit p-0 hover:bg-transparent hover:text-primary" asChild>
                    <Link href="/admin/events/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Strategy Dashboard
                    </Link>
                </Button>

                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Portfolio Management</h2>
                    <p className="text-muted-foreground mt-1">
                        Breakdown of events by Region and Type.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Regional Breakdown */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Regional Distribution</h3>
                    </div>
                    <div className="grid gap-4">
                        {Object.entries(byRegion).map(([region, regionEvents]) => (
                            <Card key={region}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base">{region}</CardTitle>
                                        <Badge variant="secondary">{regionEvents.length} Events</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        Total Capacity: {regionEvents.reduce((sum, e) => sum + (e.capacity || 0), 0)}
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        {regionEvents.map(e => e.title).slice(0, 3).join(", ")}
                                        {regionEvents.length > 3 && ` +${regionEvents.length - 3} more`}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Type Breakdown */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Event Types</h3>
                    </div>
                    <div className="grid gap-4">
                        {Object.entries(byType).map(([type, typeEvents]) => (
                            <Card key={type}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base">{type}</CardTitle>
                                        <Badge variant="outline">{typeEvents.length} Events</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        Avg. Ticket Price: ${Math.round(typeEvents.reduce((sum, e) => sum + (e.ticket_price || 0), 0) / typeEvents.length)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
