"use client";

import React from "react";
import { TicketService, EventRegistration } from "@/services/ticketing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

export default function MyTicketsPage() {
    const [registrations, setRegistrations] = React.useState<EventRegistration[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadRegistrations();
    }, []);

    const loadRegistrations = async () => {
        try {
            const data = await TicketService.getMyRegistrations();
            setRegistrations(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="container max-w-4xl py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Tickets</h1>
                <p className="text-muted-foreground">Manage your upcoming events and tickets.</p>
            </div>

            {registrations.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <h3 className="text-lg font-semibold">No tickets found</h3>
                    <p className="text-muted-foreground">You haven't registered for any events yet.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {registrations.map((reg) => (
                        <Card key={reg.id} className="border-l-4 border-l-primary">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle>{reg.event?.title || `Event #${reg.event_id}`}</CardTitle>
                                        <CardDescription>{reg.ticket_type?.name || "General Admission"}</CardDescription>
                                    </div>
                                    <Badge variant={reg.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                                        {reg.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>{reg.event?.start_time ? new Date(reg.event.start_time).toLocaleDateString() : 'TBD'}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    <span>{reg.event?.location || 'Location TBD'}</span>
                                </div>
                                {reg.qr_code_data && (
                                    <div className="mt-4 p-4 bg-white rounded-lg border w-fit mx-auto">
                                        <QRCodeSVG
                                            value={reg.qr_code_data}
                                            size={128}
                                            level={"H"}
                                            includeMargin={false}
                                        />
                                        <p className="text-[10px] text-center mt-3 font-mono text-gray-500 truncate max-w-[128px]">
                                            {reg.qr_code_data}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">View Event Details</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
