"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { eventService, EmailList, EmailListCreate } from "@/services/events";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface EmailListManagerProps {
    eventId: number;
}

export function EmailListManager({ eventId }: EmailListManagerProps) {
    const [emailLists, setEmailLists] = useState<EmailList[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newList, setNewList] = useState<EmailListCreate>({
        name: "",
        subject: "",
        body: "",
        recipients: []
    });
    const [recipientText, setRecipientText] = useState("");

    useEffect(() => {
        loadEmailLists();
    }, [eventId]);

    async function loadEmailLists() {
        try {
            const lists = await eventService.getEmailLists(eventId);
            setEmailLists(lists);
        } catch (error) {
            console.error("Failed to load email lists", error);
        }
    }

    async function handleCreate() {
        setLoading(true);
        try {
            // Parse recipients from text (simple CSV/newline)
            const recipients = recipientText.split(/[\n,]/).map(email => ({ email: email.trim() })).filter(r => r.email);

            await eventService.createEmailList(eventId, { ...newList, recipients });
            setIsCreateOpen(false);
            setNewList({ name: "", subject: "", body: "", recipients: [] });
            setRecipientText("");
            loadEmailLists();
        } catch (error) {
            console.error("Failed to create email list", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSend(listId: number) {
        if (!confirm("Are you sure you want to send this email list?")) return;
        try {
            await eventService.sendEmailList(eventId, listId);
            loadEmailLists();
            alert("Emails sent successfully!");
        } catch (error) {
            console.error("Failed to send email list", error);
            alert("Failed to send emails.");
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Email Lists</h3>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>Create Email List</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Email List</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">List Name</label>
                                <Input
                                    value={newList.name}
                                    onChange={e => setNewList({ ...newList, name: e.target.value })}
                                    placeholder="e.g. Attendees Announcement"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Input
                                    value={newList.subject}
                                    onChange={e => setNewList({ ...newList, subject: e.target.value })}
                                    placeholder="Email Subject"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Recipients (comma or newline separated)</label>
                                <Textarea
                                    value={recipientText}
                                    onChange={e => setRecipientText(e.target.value)}
                                    placeholder="user@example.com, another@example.com"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message Body</label>
                                <Textarea
                                    value={newList.body}
                                    onChange={e => setNewList({ ...newList, body: e.target.value })}
                                    placeholder="Enter your message here..."
                                    rows={5}
                                />
                            </div>
                            <Button onClick={handleCreate} disabled={loading} className="w-full">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create List
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {emailLists.map(list => (
                    <Card key={list.id}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base">{list.name}</CardTitle>
                                <Badge variant={list.status === 'SENT' ? 'default' : 'secondary'}>
                                    {list.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">Subject: {list.subject}</p>
                            <div className="flex justify-between items-center text-sm">
                                <span>{list.recipients.length} Recipients</span>
                                {list.status === 'DRAFT' && (
                                    <Button size="sm" onClick={() => handleSend(list.id)}>
                                        Send Now
                                    </Button>
                                )}
                                {list.status === 'SENT' && list.sent_at && (
                                    <span className="text-muted-foreground">Sent: {new Date(list.sent_at).toLocaleDateString()}</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {emailLists.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No email lists created yet.</p>
                )}
            </div>
        </div>
    );
}
