"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, Loader2 } from "lucide-react";
import { eventService, Event } from "@/services/events";
import { strategyService, EventBudget, EventGoal, EventESG } from "@/services/strategy";
import { BudgetTab } from "@/components/events/BudgetTab";
import { GoalsTab } from "@/components/events/GoalsTab";
import { ESGTab } from "@/components/events/ESGTab";

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = Number(params.id);

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"budget" | "goals" | "esg">("budget");

    useEffect(() => {
        loadEvent();
    }, [eventId]);

    async function loadEvent() {
        try {
            const events = await eventService.getAll();
            const found = events.find(e => e.id === eventId);
            setEvent(found || null);
        } catch (error) {
            console.error("Failed to load event", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleClone() {
        try {
            const cloned = await eventService.cloneEvent(eventId);
            router.push(`/admin/events/${cloned.id}`);
        } catch (error) {
            console.error("Failed to clone event", error);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="p-8">
                <p className="text-red-500">Event not found.</p>
                <Link href="/admin/events">
                    <Button variant="outline" className="mt-4">Back to Events</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
                <Button variant="ghost" className="w-fit p-0 hover:bg-transparent hover:text-primary" asChild>
                    <Link href="/admin/events">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Events
                    </Link>
                </Button>

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{event.title}</h2>
                        <p className="text-muted-foreground mt-1">{event.description}</p>
                    </div>
                    <Button onClick={handleClone} variant="outline">
                        <Copy className="mr-2 h-4 w-4" />
                        Clone Event
                    </Button>
                </div>
            </div>

            {/* Event Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{event.location}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium">{event.status}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium">{event.event_type}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Capacity</p>
                        <p className="font-medium">{event.capacity || "Unlimited"}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Strategy Tabs */}
            <div className="space-y-4">
                <div className="flex gap-2 border-b">
                    <button
                        onClick={() => setActiveTab("budget")}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === "budget"
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Budget
                    </button>
                    <button
                        onClick={() => setActiveTab("goals")}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === "goals"
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Goals & KPIs
                    </button>
                    <button
                        onClick={() => setActiveTab("esg")}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === "esg"
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        ESG Tracking
                    </button>
                </div>

                {activeTab === "budget" && <BudgetTab eventId={eventId} />}
                {activeTab === "goals" && <GoalsTab eventId={eventId} />}
                {activeTab === "esg" && <ESGTab eventId={eventId} />}
            </div>
        </div>
    );
}
