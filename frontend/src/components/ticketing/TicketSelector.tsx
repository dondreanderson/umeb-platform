import React, { useEffect, useState } from 'react';
import { TicketService, TicketType } from '@/services/ticketing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Ticket } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface TicketSelectorProps {
    eventId: number;
    onTicketSelected: (ticket: TicketType) => void;
}

export function TicketSelector({ eventId, onTicketSelected }: TicketSelectorProps) {
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadTickets();
    }, [eventId]);

    const loadTickets = async () => {
        try {
            const data = await TicketService.getEventTickets(eventId);
            setTickets(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load tickets",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }

    if (tickets.length === 0) {
        return (
            <div className="text-center p-6 border rounded-lg bg-muted/20">
                <Ticket className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No tickets available for this event yet.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {tickets.map((ticket) => {
                const isSoldOut = ticket.quantity_sold >= ticket.quantity_available;

                return (
                    <Card key={ticket.id} className={isSoldOut ? "opacity-75 border-muted" : "border-primary/20"}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{ticket.name}</CardTitle>
                                <div className="text-right">
                                    <span className="text-xl font-bold">
                                        {ticket.price === 0 ? "Free" : `$${ticket.price}`}
                                    </span>
                                </div>
                            </div>
                            <CardDescription>{ticket.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-2">
                                <Badge variant={isSoldOut ? "destructive" : "secondary"}>
                                    {isSoldOut ? "Sold Out" : `${ticket.quantity_available - ticket.quantity_sold} left`}
                                </Badge>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                disabled={isSoldOut}
                                onClick={() => onTicketSelected(ticket)}
                            >
                                {isSoldOut ? "Sold Out" : "Select Ticket"}
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
