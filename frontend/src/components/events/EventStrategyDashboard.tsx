"use client";

import { useEffect, useState } from "react";
import { strategyService, StrategyDashboardStats } from "@/services/strategy";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, DollarSign, Target, Leaf, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function EventStrategyDashboard() {
    const [stats, setStats] = useState<StrategyDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const data = await strategyService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to load strategy stats", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (!stats) {
        return <div className="p-4 text-red-500 bg-red-50 rounded-md">Failed to load data. Please try refreshing.</div>;
    }

    // Calculate budget percentage
    const budgetPercent = stats.total_budget_planned > 0
        ? Math.min(100, Math.round((stats.total_budget_actual / stats.total_budget_planned) * 100))
        : 0;

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Events Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
                    <Target className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.total_events}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Active in portfolio
                    </p>
                </CardContent>
            </Card>

            {/* Budget Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500 col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Budget Overview</CardTitle>
                        <CardDescription className="text-xs">Planned vs Actual Spend</CardDescription>
                    </div>
                    <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline justify-between mb-2">
                        <div className="text-3xl font-bold">${stats.total_budget_planned.toLocaleString()}</div>
                        <div className="text-sm font-medium text-muted-foreground">
                            Spent: ${stats.total_budget_actual.toLocaleString()}
                        </div>
                    </div>
                    <Progress value={budgetPercent} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                        {budgetPercent}% of planned budget utilized
                    </p>
                </CardContent>
            </Card>

            {/* Sustainability Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-emerald-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Sustainability</CardTitle>
                    <Leaf className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.total_carbon_footprint} <span className="text-sm font-normal text-muted-foreground">kg</span></div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Total CO2e Footprint
                    </p>
                    <div className="flex items-center mt-4 text-xs text-emerald-600 font-medium">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        <span>Tracking Active</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
