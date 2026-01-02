"use client";

import React from "react";
import { useParams } from "next/navigation";
import { eventService, Event } from "@/services/event";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TicketSelector } from "@/components/ticketing/TicketSelector";
import { RegistrationModal } from "@/components/ticketing/RegistrationModal";
import { TicketType } from "@/services/ticketing";
import { AgendaView } from "@/components/events/AgendaView";
import { SponsorsGrid } from "@/components/events/SponsorsGrid";

export default function EventDetailsPage() {
    const params = useParams();
    const id = Number(params?.id);
    const [event, setEvent] = React.useState<Event | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [selectedTicket, setSelectedTicket] = React.useState<TicketType | null>(null);
    const [isRegistrationOpen, setIsRegistrationOpen] = React.useState(false);

    React.useEffect(() => {
        if (id) {
            eventService.getEvent(id)
                .then(setEvent)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <div className="container py-8">Loading...</div>;
    if (!event) return <div className="container py-8">Event not found</div>;

    return (
        <div className="container max-w-4xl py-8 space-y-8">
            <Link href="/events" className="inline-flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
            </Link>

            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                    <Badge className="text-base px-4 py-1">{event.event_type}</Badge>
                    {event.status !== "PUBLISHED" && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            {event.status}
                        </Badge>
                    )}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{event.title}</h1>

                <div className="flex flex-wrap gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span>{new Date(event.start_time).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <span>{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        <span>{event.location}</span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>About this event</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                {event.description || "No description provided."}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold tracking-tight">Event Schedule</h2>
                        <AgendaView eventId={id} />
                    </div>

                    <div className="space-y-6 pt-8">
                        <h2 className="text-2xl font-bold tracking-tight">Our Partners</h2>
                        <SponsorsGrid eventId={id} />
                    </div>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Get Tickets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TicketSelector
                                eventId={id}
                                onTicketSelected={(ticket) => {
                                    setSelectedTicket(ticket);
                                    setIsRegistrationOpen(true);
                                }}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <Button variant="outline" className="w-full">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Event
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <RegistrationModal
                isOpen={isRegistrationOpen}
                onClose={() => setIsRegistrationOpen(false)}
                ticket={selectedTicket}
                eventId={id}
            />
        </div>
    );
}
