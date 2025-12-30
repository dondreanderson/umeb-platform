"use client";

import { useEffect, useState } from "react";
import { eventService, Event } from "@/services/event";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, MapPin, MoreVertical, Edit, Trash, Copy } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

import { CalendarView } from "@/components/events/CalendarView";
import { LayoutList, Calendar as CalendarIcon } from "lucide-react";

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
    const router = useRouter();

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await eventService.getEvents(); // Fetch all events
            setEvents(data);
        } catch (error) {
            console.error("Failed to load events", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            try {
                await eventService.deleteEvent(id);
                setEvents(events.filter(e => e.id !== id));
            } catch (error) {
                console.error("Failed to delete event", error);
                alert("Failed to delete event");
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Events</h2>
                    <p className="text-muted-foreground">Manage upcoming and past events.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-muted p-1 rounded-md border">
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="sm"
                            className={viewMode === "list" ? "bg-white shadow-sm" : ""}
                            onClick={() => setViewMode("list")}
                        >
                            <LayoutList className="h-4 w-4 mr-2" />
                            List
                        </Button>
                        <Button
                            variant={viewMode === "calendar" ? "secondary" : "ghost"}
                            size="sm"
                            className={viewMode === "calendar" ? "bg-white shadow-sm" : ""}
                            onClick={() => setViewMode("calendar")}
                        >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Calendar
                        </Button>
                    </div>
                    <Link href="/admin/events/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Event
                        </Button>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div>Loading events...</div>
            ) : events.length === 0 ? (
                <div className="p-8 text-center border rounded-lg bg-muted/20">
                    <h3 className="text-lg font-medium">No events found</h3>
                    <p className="text-muted-foreground mb-4">Get started by creating your first event.</p>
                    <Link href="/admin/events/create">
                        <Button variant="outline">Create Event</Button>
                    </Link>
                </div>
            ) : viewMode === "calendar" ? (
                <CalendarView events={events} />
            ) : (
                <div className="grid gap-4">
                    {events.map((event) => (
                        <Card key={event.id} className="overflow-hidden">
                            <div className="flex items-center p-4 gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                                        <Badge variant={event.status === "PUBLISHED" ? "default" : "secondary"}>
                                            {event.status}
                                        </Badge>
                                        <Badge variant="outline">{event.event_type}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{new Date(event.start_time).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <span className="truncate max-w-[200px]">{event.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => router.push(`/admin/events/${event.id}`)}>
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push(`/events/${event.id}`)}>
                                                View Public Page
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(event.id)} className="text-destructive focus:text-destructive">
                                                <Trash className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
