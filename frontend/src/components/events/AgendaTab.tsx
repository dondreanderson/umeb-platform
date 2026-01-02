import React from "react";
import { AgendaService, EventSession, EventSessionCreate } from "@/services/agenda";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, Calendar, MapPin, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AgendaTabProps {
    eventId: number;
}

export function AgendaTab({ eventId }: AgendaTabProps) {
    const [sessions, setSessions] = React.useState<EventSession[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isAdding, setIsAdding] = React.useState(false);
    const { toast } = useToast();

    const [newSession, setNewSession] = React.useState<Partial<EventSessionCreate>>({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        location: "",
        speaker_name: ""
    });

    React.useEffect(() => {
        loadSessions();
    }, [eventId]);

    async function loadSessions() {
        try {
            const data = await AgendaService.getEventSessions(eventId);
            setSessions(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load agenda sessions.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleAddSession() {
        if (!newSession.title || !newSession.start_time || !newSession.end_time) {
            toast({
                title: "Validation Error",
                description: "Title, start time, and end time are required.",
                variant: "destructive"
            });
            return;
        }

        try {
            await AgendaService.createSession(eventId, {
                ...newSession as EventSessionCreate,
                event_id: eventId
            });
            toast({ title: "Success", description: "Session added to agenda." });
            setIsAdding(false);
            setNewSession({ title: "", description: "", start_time: "", end_time: "", location: "", speaker_name: "" });
            loadSessions();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add session.",
                variant: "destructive"
            });
        }
    }

    async function handleDeleteSession(sessionId: number) {
        if (!confirm("Are you sure you want to delete this session?")) return;
        try {
            await AgendaService.deleteSession(sessionId);
            toast({ title: "Deleted", description: "Session removed." });
            loadSessions();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete session.",
                variant: "destructive"
            });
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Event Agenda</h3>
                <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"}>
                    {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Add Session</>}
                </Button>
            </div>

            {isAdding && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-sm">New Session Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                placeholder="Session Title"
                                value={newSession.title}
                                onChange={e => setNewSession({ ...newSession, title: e.target.value })}
                            />
                            <Input
                                placeholder="Speaker Name"
                                value={newSession.speaker_name}
                                onChange={e => setNewSession({ ...newSession, speaker_name: e.target.value })}
                            />
                            <Input
                                type="datetime-local"
                                placeholder="Start Time"
                                value={newSession.start_time}
                                onChange={e => setNewSession({ ...newSession, start_time: e.target.value })}
                            />
                            <Input
                                type="datetime-local"
                                placeholder="End Time"
                                value={newSession.end_time}
                                onChange={e => setNewSession({ ...newSession, end_time: e.target.value })}
                            />
                            <Input
                                className="md:col-span-2"
                                placeholder="Location (Room, Link, etc.)"
                                value={newSession.location}
                                onChange={e => setNewSession({ ...newSession, location: e.target.value })}
                            />
                            <Textarea
                                className="md:col-span-2"
                                placeholder="Description"
                                value={newSession.description}
                                onChange={e => setNewSession({ ...newSession, description: e.target.value })}
                            />
                        </div>
                        <Button className="w-full" onClick={handleAddSession}>Save Session</Button>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {sessions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No sessions scheduled yet.</p>
                ) : (
                    sessions.map((session) => (
                        <Card key={session.id}>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-lg">{session.title}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {new Date(session.start_time).toLocaleString()} - {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {session.location && (
                                                <div className="flex items-center">
                                                    <MapPin className="mr-2 h-4 w-4" />
                                                    {session.location}
                                                </div>
                                            )}
                                            {session.speaker_name && (
                                                <div className="flex items-center">
                                                    <User className="mr-2 h-4 w-4" />
                                                    {session.speaker_name}
                                                </div>
                                            )}
                                        </div>
                                        {session.description && (
                                            <p className="text-sm mt-3 border-t pt-3 whitespace-pre-wrap">{session.description}</p>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSession(session.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
