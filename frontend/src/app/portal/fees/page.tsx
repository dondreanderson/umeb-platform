"use client";

import React from "react";
import { feeService, MembershipFee, Payment } from "@/services/fee";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MemberFeesPage() {
    const [fees, setFees] = React.useState<MembershipFee[]>([]);
    const [myPayments, setMyPayments] = React.useState<Payment[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [processingId, setProcessingId] = React.useState<number | null>(null);

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [feesData, paymentsData] = await Promise.all([
                feeService.getFees(),
                feeService.getMyPayments()
            ]);
            setFees(feesData);
            setMyPayments(paymentsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (feeId: number) => {
        if (confirm("Proceed with payment? This is a simulation.")) {
            try {
                setProcessingId(feeId);
                await feeService.makePayment(feeId);
                await loadData(); // Refresh to see payment
                alert("Payment successful!");
            } catch (e) {
                alert("Payment failed.");
            } finally {
                setProcessingId(null);
            }
        }
    };

    // Helper to check if a fee is already paid (simple logic: checks if any paid payment exists for this fee)
    // In real app, might check for *valid* subscription period.
    const isPaid = (feeId: number) => {
        return myPayments.some(p => p.fee_id === feeId && p.status === "PAID");
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Membership Dues</h2>
                <p className="text-muted-foreground">View and pay your membership fees.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {fees.map(fee => {
                    const paid = isPaid(fee.id);
                    return (
                        <Card key={fee.id} className={`relative ${paid ? "border-green-200 bg-green-50/50" : ""}`}>
                            {paid && (
                                <div className="absolute top-4 right-4 text-green-600">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle>{fee.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-3xl font-bold">${fee.amount}</div>
                                <p className="text-sm font-medium text-muted-foreground">{fee.interval}</p>
                                <p className="text-sm text-muted-foreground">{fee.description}</p>
                            </CardContent>
                            <CardFooter>
                                {paid ? (
                                    <Button variant="outline" className="w-full text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800" disabled>
                                        Active / Paid
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full"
                                        onClick={() => handlePay(fee.id)}
                                        disabled={processingId === fee.id}
                                    >
                                        {processingId === fee.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Pay Now
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    {myPayments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No payments found.</p>
                    ) : (
                        <ul className="divide-y">
                            {myPayments.map(payment => (
                                <li key={payment.id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">Transaction: {payment.transaction_id || payment.id}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(payment.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold">${payment.amount}</span>
                                        <Badge variant="outline">{payment.status}</Badge>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
