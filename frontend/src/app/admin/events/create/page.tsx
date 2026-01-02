"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { eventService } from "@/services/event";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function CreateEventPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);

    const [formData, setFormData] = React.useState({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        location: "",
        capacity: 100,
        event_type: "MEETING",
        ticket_price: 0,
        is_public: true,
        status: "DRAFT"
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await eventService.createEvent({
                ...formData,
                start_time: new Date(formData.start_time).toISOString(),
                end_time: new Date(formData.end_time).toISOString(),
            });
            router.push("/admin/events");
            router.refresh();
        } catch (error) {
            console.error("Failed to create event", error);
            alert("Failed to create event");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <Link href="/admin/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Events
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Create New Event</h2>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Event Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Event Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                required
                                placeholder="Quarterly General Meeting"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Event Type</Label>
                                <Select value={formData.event_type} onValueChange={(val) => handleChange("event_type", val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MEETING">Meeting</SelectItem>
                                        <SelectItem value="WORKSHOP">Workshop</SelectItem>
                                        <SelectItem value="GALA">Gala</SelectItem>
                                        <SelectItem value="FUNDRAISER">Fundraiser</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status} onValueChange={(val) => handleChange("status", val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="PUBLISHED">Published</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                placeholder="Describe the event..."
                                className="h-32"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_time">Start Time</Label>
                                <Input
                                    id="start_time"
                                    type="datetime-local"
                                    value={formData.start_time}
                                    onChange={(e) => handleChange("start_time", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_time">End Time</Label>
                                <Input
                                    id="end_time"
                                    type="datetime-local"
                                    value={formData.end_time}
                                    onChange={(e) => handleChange("end_time", e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => handleChange("location", e.target.value)}
                                required
                                placeholder="123 Main St, City or Zoom Link"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => handleChange("capacity", parseInt(e.target.value))}
                                    min="1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Ticket Price ($)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.ticket_price}
                                    onChange={(e) => handleChange("ticket_price", parseFloat(e.target.value))}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_public"
                                checked={formData.is_public}
                                onCheckedChange={(checked) => handleChange("is_public", checked)}
                            />
                            <Label htmlFor="is_public">Public Event (visible to non-members)</Label>
                        </div>

                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : "Create Event"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
