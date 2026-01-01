import React, { useEffect, useState } from "react";
import { AgendaService, EventSession } from "@/services/agenda";
import { Loader2, Calendar, Clock, MapPin, User, Info } from "lucide-react";

interface AgendaViewProps {
    eventId: number;
}

export function AgendaView({ eventId }: AgendaViewProps) {
    const [sessions, setSessions] = useState<EventSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSessions();
    }, [eventId]);

    async function loadSessions() {
        try {
            const data = await AgendaService.getEventSessions(eventId);
            setSessions(data);
        } catch (error) {
            console.error("Failed to load agenda", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;

    if (sessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border border-dashed rounded-lg space-y-2">
                <Info className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">The schedule for this event is still being finalized.</p>
            </div>
        );
    }

    // Group by day? Maybe for later. For now just list.

    return (
        <div className="space-y-8">
            <div className="relative border-l-2 border-primary/20 ml-3 pl-8 space-y-8">
                {sessions.map((session) => (
                    <div key={session.id} className="relative">
                        {/* Timeline Dot */}
                        <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background" />

                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-primary">
                                <div className="flex items-center">
                                    <Clock className="mr-1.5 h-4 w-4" />
                                    {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <span>—</span>
                                <div>
                                    {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <h4 className="text-xl font-bold tracking-tight">{session.title}</h4>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                {session.speaker_name && (
                                    <div className="flex items-center">
                                        <User className="mr-1.5 h-4 w-4" />
                                        {session.speaker_name}
                                    </div>
                                )}
                                {session.location && (
                                    <div className="flex items-center">
                                        <MapPin className="mr-1.5 h-4 w-4" />
                                        {session.location}
                                    </div>
                                )}
                            </div>

                            {session.description && (
                                <p className="text-muted-foreground leading-relaxed mt-2 text-sm">{session.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
