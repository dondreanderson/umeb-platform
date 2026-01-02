import React from 'react';
import { TicketType, TicketService } from '@/services/ticketing';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: TicketType | null;
    eventId: number;
}

export function RegistrationModal({ isOpen, onClose, ticket, eventId }: RegistrationModalProps) {
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const { toast } = useToast();

    if (!ticket) return null;

    const handleRegister = async () => {
        setLoading(true);
        try {
            await TicketService.registerForEvent(eventId, ticket.id);
            setSuccess(true);
            toast({
                title: "Success!",
                description: "You have successfully registered for this event.",
            });
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.response?.data?.detail || "Something went wrong.",
                variant: "destructive"
            });
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        setLoading(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                {!success ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Confirm Registration</DialogTitle>
                            <DialogDescription>
                                You are about to register for the following ticket:
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <div className="border rounded-lg p-4 bg-muted/50">
                                <h4 className="font-semibold">{ticket.name}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                                    <span className="text-sm">Price:</span>
                                    <span className="font-bold text-lg">
                                        {ticket.price === 0 ? "Free" : `$${ticket.price}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
                            <Button onClick={handleRegister} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {ticket.price > 0 ? "Pay & Register" : "Confirm Registration"}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold">Registration Confirmed!</h3>
                            <p className="text-muted-foreground text-sm">
                                You have successfully secured your ticket. Check your email for details.
                            </p>
                            <Button onClick={handleClose} className="w-full mt-4">Close</Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
