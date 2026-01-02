"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { strategyService, EventGoal } from "@/services/strategy";

interface GoalsTabProps {
    eventId: number;
}

export function GoalsTab({ eventId }: GoalsTabProps) {
    const [goals, setGoals] = React.useState<EventGoal[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [showForm, setShowForm] = React.useState(false);

    React.useEffect(() => {
        loadGoals();
    }, [eventId]);

    async function loadGoals() {
        try {
            const items = await strategyService.getGoals(eventId);
            setGoals(items);
        } catch (error) {
            console.error("Failed to load goals", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            await strategyService.createGoal(eventId, {
                metric_name: formData.get("metric_name") as string,
                target_value: Number(formData.get("target_value")),
                actual_value: Number(formData.get("actual_value") || 0),
            });
            setShowForm(false);
            loadGoals();
        } catch (error) {
            console.error("Failed to create goal", error);
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Goals & KPIs</h3>
                    <p className="text-sm text-muted-foreground">Set and track event objectives</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Goal
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>New Goal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="metric_name">Metric Name</Label>
                                <Input id="metric_name" name="metric_name" required placeholder="Attendance, Revenue, etc." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="target_value">Target Value</Label>
                                    <Input id="target_value" name="target_value" type="number" step="0.01" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="actual_value">Actual Value</Label>
                                    <Input id="actual_value" name="actual_value" type="number" step="0.01" defaultValue="0" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button type="submit">Add Goal</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {goals.length === 0 ? (
                    <Card>
                        <CardContent className="py-8">
                            <p className="text-muted-foreground text-center">No goals set yet. Add one to track your event's success.</p>
                        </CardContent>
                    </Card>
                ) : (
                    goals.map((goal) => {
                        const progress = goal.target_value > 0 ? Math.min(100, (goal.actual_value / goal.target_value) * 100) : 0;
                        return (
                            <Card key={goal.id} className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-5 w-5 text-blue-500" />
                                            <CardTitle className="text-lg">{goal.metric_name}</CardTitle>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">{goal.actual_value.toLocaleString()}</p>
                                            <p className="text-sm text-muted-foreground">of {goal.target_value.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Progress value={progress} className="h-2" />
                                    <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
