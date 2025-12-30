"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { strategyService, EventBudget } from "@/services/strategy";

interface BudgetTabProps {
    eventId: number;
}

export function BudgetTab({ eventId }: BudgetTabProps) {
    const [budgetItems, setBudgetItems] = useState<EventBudget[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadBudget();
    }, [eventId]);

    async function loadBudget() {
        try {
            const items = await strategyService.getBudget(eventId);
            setBudgetItems(items);
        } catch (error) {
            console.error("Failed to load budget", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            await strategyService.createBudgetItem(eventId, {
                category: formData.get("category") as string,
                planned_amount: Number(formData.get("planned_amount")),
                actual_amount: Number(formData.get("actual_amount") || 0),
                forecast_amount: Number(formData.get("forecast_amount")),
            });
            setShowForm(false);
            loadBudget();
        } catch (error) {
            console.error("Failed to create budget item", error);
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }

    const totalPlanned = budgetItems.reduce((sum, item) => sum + item.planned_amount, 0);
    const totalActual = budgetItems.reduce((sum, item) => sum + item.actual_amount, 0);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Budget Management</h3>
                    <p className="text-sm text-muted-foreground">Track planned vs actual spending</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>New Budget Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input id="category" name="category" required placeholder="Venue, Catering, etc." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="planned_amount">Planned Amount ($)</Label>
                                    <Input id="planned_amount" name="planned_amount" type="number" step="0.01" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="actual_amount">Actual Amount ($)</Label>
                                    <Input id="actual_amount" name="actual_amount" type="number" step="0.01" defaultValue="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="forecast_amount">Forecast ($)</Label>
                                    <Input id="forecast_amount" name="forecast_amount" type="number" step="0.01" required />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button type="submit">Add Item</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Total Planned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">${totalPlanned.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Total Actual</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">${totalActual.toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Budget Items</CardTitle>
                </CardHeader>
                <CardContent>
                    {budgetItems.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No budget items yet. Add one to get started.</p>
                    ) : (
                        <div className="space-y-2">
                            {budgetItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{item.category}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Planned: ${item.planned_amount.toLocaleString()} | Actual: ${item.actual_amount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">Forecast</p>
                                        <p className="text-lg font-bold">${item.forecast_amount.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
