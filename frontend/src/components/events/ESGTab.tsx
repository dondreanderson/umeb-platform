"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, Leaf } from "lucide-react";
import { strategyService, EventESG } from "@/services/strategy";

interface ESGTabProps {
    eventId: number;
}

export function ESGTab({ eventId }: ESGTabProps) {
    const [metrics, setMetrics] = useState<EventESG[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadESG();
    }, [eventId]);

    async function loadESG() {
        try {
            const items = await strategyService.getESG(eventId);
            setMetrics(items);
        } catch (error) {
            console.error("Failed to load ESG metrics", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            await strategyService.createESGMetric(eventId, {
                metric: formData.get("metric") as string,
                value: Number(formData.get("value")),
                unit: formData.get("unit") as string,
            });
            setShowForm(false);
            loadESG();
        } catch (error) {
            console.error("Failed to create ESG metric", error);
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">ESG Tracking</h3>
                    <p className="text-sm text-muted-foreground">Monitor environmental, social, and governance metrics</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Metric
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>New ESG Metric</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="metric">Metric Name</Label>
                                <Input id="metric" name="metric" required placeholder="Carbon Footprint, Waste Recycled, etc." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="value">Value</Label>
                                    <Input id="value" name="value" type="number" step="0.01" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="unit">Unit</Label>
                                    <Input id="unit" name="unit" required placeholder="kg CO2e, %, etc." />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button type="submit">Add Metric</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                {metrics.length === 0 ? (
                    <Card className="md:col-span-2">
                        <CardContent className="py-8">
                            <p className="text-muted-foreground text-center">No ESG metrics tracked yet. Add one to start monitoring sustainability.</p>
                        </CardContent>
                    </Card>
                ) : (
                    metrics.map((metric) => (
                        <Card key={metric.id} className="border-l-4 border-l-emerald-600">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Leaf className="h-5 w-5 text-emerald-600" />
                                    <CardTitle className="text-base">{metric.metric}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">
                                    {metric.value.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">{metric.unit}</span>
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
