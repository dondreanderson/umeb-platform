"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EventStrategyDashboard } from "@/components/events/EventStrategyDashboard";

export default function EventStrategyPage() {
    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
                <Button variant="ghost" className="w-fit p-0 hover:bg-transparent hover:text-primary" asChild>
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Admin Dashboard
                    </Link>
                </Button>

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-primary">Event Strategy Dashboard</h2>
                        <p className="text-muted-foreground mt-1">
                            Portfolio overview, financial tracking, and ESG metrics.
                        </p>
                    </div>
                </div>
            </div>

            <EventStrategyDashboard />

            <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">Portfolio Management</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Manage global, regional, and local events within your portfolio.
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/admin/events/portfolio">
                            View Portfolio
                        </Link>
                    </Button>
                </div>
                <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">Templates</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Manage and customize event templates for rapid cloning.
                    </p>
                    <Button variant="outline" className="w-full" disabled>
                        Manage Templates (Coming Soon)
                    </Button>
                </div>
            </div>
        </div>
    );
}
