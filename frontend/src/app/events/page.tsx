"use client";

import React from "react";
import { eventService, Event as EventModel } from "@/services/event";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Calendar, MapPin, Clock, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EventsPage() {
    const [events, setEvents] = React.useState<EventModel[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await eventService.getEvents();
            // Filter client-side for public/published events
            const publicEvents = data.filter(e => e.is_public && e.status === "PUBLISHED");
            setEvents(publicEvents);
        } catch (error) {
            console.error("Failed to load events", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading specific events...</div>;
    }

    return (
        <div className="container py-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Upcoming Events</h1>
                <p className="text-xl text-muted-foreground">Join us for workshops, meetings, and galas.</p>
            </div>

            {events.length === 0 ? (
                <div className="p-12 border rounded-lg bg-muted/20 text-center">
                    <h3 className="text-lg font-semibold">No upcoming events</h3>
                    <p className="text-muted-foreground">Check back soon for new announcements!</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <Card key={event.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <Badge variant={(event.event_type === "GALA" || event.event_type === "FUNDRAISER") ? "secondary" : "default"} className="mb-2">
                                        {event.event_type}
                                    </Badge>
                                    {event.ticket_price > 0 && (
                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                            ${event.ticket_price}
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {event.description}
                                </p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        {/* <Calendar className="h-4 w-4 text-primary" /> */}
                                        <span>{new Date(event.start_time).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* <Clock className="h-4 w-4 text-primary" /> */}
                                        <span>
                                            {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* <MapPin className="h-4 w-4 text-primary" /> */}
                                        <span className="line-clamp-1">{event.location}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href={`/events/${event.id}`} className="w-full">
                                    <Button className="w-full">
                                        {/* <Ticket className="mr-2 h-4 w-4" /> */}
                                        View Details
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
