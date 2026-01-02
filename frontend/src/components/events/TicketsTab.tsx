import React from "react";
import { TicketService, TicketType, TicketTypeCreate } from "@/services/ticketing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, DollarSign, Users, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface TicketsTabProps {
    eventId: number;
}

export function TicketsTab({ eventId }: TicketsTabProps) {
    const [tickets, setTickets] = React.useState<TicketType[]>([]);
    const [registrations, setRegistrations] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [loadingRegs, setLoadingRegs] = React.useState(false);
    const [isAdding, setIsAdding] = React.useState(false);
    const { toast } = useToast();

    const [newTicket, setNewTicket] = React.useState<Partial<TicketTypeCreate>>({
        name: "",
        description: "",
        price: 0,
        quantity_available: 100
    });

    React.useEffect(() => {
        loadTickets();
        loadRegistrations();
    }, [eventId]);

    async function loadTickets() {
        try {
            const data = await TicketService.getEventTickets(eventId);
            setTickets(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load ticket tiers.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

    async function loadRegistrations() {
        setLoadingRegs(true);
        try {
            const data = await TicketService.getEventRegistrations(eventId);
            setRegistrations(data);
        } catch (error) {
            console.error("Failed to load registrations", error);
        } finally {
            setLoadingRegs(false);
        }
    }

    async function handleCheckIn(regId: number) {
        try {
            await TicketService.checkInAttendee(regId);
            toast({ title: "Checked In", description: "Attendee successfully checked in." });
            loadRegistrations();
        } catch (error) {
            toast({ title: "Error", description: "Failed to check in attendee.", variant: "destructive" });
        }
    }

    async function handleStatusUpdate(regId: number, status: string) {
        try {
            await TicketService.updateRegistrationStatus(regId, status);
            toast({ title: "Status Updated", description: `Registration marked as ${status}.` });
            loadRegistrations();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
        }
    }

    async function handleAddTicket() {
        if (!newTicket.name || newTicket.quantity_available === undefined) {
            toast({
                title: "Validation Error",
                description: "Name and total quantity are required.",
                variant: "destructive"
            });
            return;
        }

        try {
            await TicketService.createTicketType(eventId, {
                ...newTicket as TicketTypeCreate,
                event_id: eventId
            });
            toast({ title: "Success", description: "Ticket tier created." });
            setIsAdding(false);
            setNewTicket({ name: "", description: "", price: 0, quantity_available: 100 });
            loadTickets();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create ticket tier.",
                variant: "destructive"
            });
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Ticket Tiers</h3>
                <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"}>
                    {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Create Tier</>}
                </Button>
            </div>

            {isAdding && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-sm">New Ticket Tier</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                placeholder="Tier Name (e.g., VIP, Standard)"
                                value={newTicket.name}
                                onChange={e => setNewTicket({ ...newTicket, name: e.target.value })}
                            />
                            <Input
                                type="number"
                                placeholder="Price"
                                value={newTicket.price}
                                onChange={e => setNewTicket({ ...newTicket, price: Number(e.target.value) })}
                            />
                            <Input
                                type="number"
                                placeholder="Total Capacity (Quantity)"
                                value={newTicket.quantity_available}
                                onChange={e => setNewTicket({ ...newTicket, quantity_available: Number(e.target.value) })}
                            />
                            <Input
                                placeholder="Description (Optional)"
                                value={newTicket.description}
                                onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                            />
                        </div>
                        <Button className="w-full" onClick={handleAddTicket}>Create Tier</Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {tickets.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 col-span-2">No ticket tiers created yet.</p>
                ) : (
                    tickets.map((ticket) => (
                        <Card key={ticket.id}>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <h4 className="font-bold">{ticket.name}</h4>
                                        <p className="text-xs text-muted-foreground">{ticket.description || "No description."}</p>
                                    </div>
                                    <Badge variant={ticket.is_active ? "default" : "outline"}>
                                        {ticket.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                        <span className="font-semibold">{ticket.price === 0 ? "Free" : `$${ticket.price}`}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span>{ticket.quantity_sold} / {ticket.quantity_available} Sold</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="pt-10 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Attendee List</h3>
                    <Button variant="outline" size="sm" onClick={loadRegistrations} disabled={loadingRegs}>
                        {loadingRegs ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        <span className="ml-2">Refresh</span>
                    </Button>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Attendee Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Ticket Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Registered</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No attendees registered yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                registrations.map((reg) => (
                                    <TableRow key={reg.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{reg.user?.full_name || "N/A"}</span>
                                                {reg.check_in_status && (
                                                    <span className="text-[10px] text-green-600 font-bold uppercase">Checked In</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{reg.user?.email || "N/A"}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{reg.ticket_type?.name || "General"}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={reg.status === "CONFIRMED" ? "default" : "secondary"}>
                                                {reg.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(reg.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {!reg.check_in_status && reg.status === "CONFIRMED" && (
                                                    <Button size="sm" variant="outline" onClick={() => handleCheckIn(reg.id)}>
                                                        Check In
                                                    </Button>
                                                )}
                                                {reg.status === "CONFIRMED" && (
                                                    <Button size="sm" variant="ghost" className="text-destructive h-8 px-2" onClick={() => handleStatusUpdate(reg.id, "CANCELLED")}>
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
