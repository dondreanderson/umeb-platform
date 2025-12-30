"use client";

import { useEffect, useState } from "react";
import { feeService, MembershipFee, Payment } from "@/services/fee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, DollarSign, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function AdminFeesPage() {
    const [fees, setFees] = useState<MembershipFee[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Creating Fee
    const [newFee, setNewFee] = useState({
        name: "",
        amount: "50",
        interval: "YEARLY",
        description: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [feesData, paymentsData] = await Promise.all([
                feeService.getFees(),
                feeService.getAllPayments()
            ]);
            setFees(feesData);
            setPayments(paymentsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await feeService.createFee({
                name: newFee.name,
                amount: parseFloat(newFee.amount),
                interval: newFee.interval as any,
                description: newFee.description
            });
            setIsCreateOpen(false);
            loadData();
        } catch (e) {
            alert("Failed to create fee");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Membership Fees</h2>
                    <p className="text-muted-foreground">Manage dues and view payments.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Fee
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Membership Fee</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={newFee.name}
                                    onChange={e => setNewFee({ ...newFee, name: e.target.value })}
                                    placeholder="Annual Dues 2024"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Amount ($)</Label>
                                    <Input
                                        type="number"
                                        value={newFee.amount}
                                        onChange={e => setNewFee({ ...newFee, amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Interval</Label>
                                    <Select
                                        value={newFee.interval}
                                        onValueChange={v => setNewFee({ ...newFee, interval: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="YEARLY">Yearly</SelectItem>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="ONE_TIME">One Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={newFee.description}
                                    onChange={e => setNewFee({ ...newFee, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Create Fee</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {fees.map(fee => (
                    <Card key={fee.id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">
                                {fee.name}
                            </CardTitle>
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${fee.amount}</div>
                            <p className="text-xs text-muted-foreground">
                                {fee.interval}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">{fee.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold tracking-tight">Recent Payments</h3>
                <Card>
                    <CardContent className="p-0">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">ID</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">User ID</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Amount</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-muted-foreground">No payments recorded.</td>
                                        </tr>
                                    ) : (
                                        payments.map((payment) => (
                                            <tr key={payment.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">{payment.transaction_id}</td>
                                                <td className="p-4 align-middle">{payment.user_id}</td>
                                                <td className="p-4 align-middle font-medium">${payment.amount}</td>
                                                <td className="p-4 align-middle">
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        {payment.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 align-middle">{new Date(payment.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
