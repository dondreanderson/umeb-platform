"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { electionService, Election, Candidate } from "@/services/election";
import { positionService, Position } from "@/services/position";
import { ChevronLeft, Plus, Trash2, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

export default function EditElectionPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const id = Number(resolvedParams.id);
    const router = useRouter();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState("");
    const [positions, setPositions] = React.useState<Position[]>([]);

    // Form state
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [endDate, setEndDate] = React.useState("");
    const [positionId, setPositionId] = React.useState<string>("none");
    const [isActive, setIsActive] = React.useState(true);
    const [candidates, setCandidates] = React.useState<(Candidate | { name: string; bio: string })[]>([]);

    React.useEffect(() => {
        Promise.all([
            electionService.getElection(id),
            positionService.getPositions()
        ]).then(([election, positionsData]) => {
            setPositions(positionsData);
            setTitle(election.title);
            setDescription(election.description || "");
            // Format date for datetime-local input
            if (election.end_date) {
                const date = new Date(election.end_date);
                const offset = date.getTimezoneOffset() * 60000;
                const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
                setEndDate(localISOTime);
            }
            setPositionId(election.candidates?.[0]?.election_id ? "none" : "none"); // Default logic
            // Note: position_id isn't directly in the Election interface I saw, but it is in ElectionCreate.
            // Let's assume it might be missing from the return for now.
            setIsActive(election.is_active);
            setCandidates(election.candidates || []);
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setError("Failed to load election data.");
            setIsLoading(false);
        });
    }, [id]);

    const addCandidateField = () => {
        setCandidates([...candidates, { name: "", bio: "" }]);
    };

    const removeCandidateField = (index: number) => {
        if (candidates.length > 1) {
            setCandidates(candidates.filter((_, i) => i !== index));
        }
    };

    const updateCandidate = (index: number, field: "name" | "bio", value: string) => {
        const newCandidates = [...candidates];
        (newCandidates[index] as any)[field] = value;
        setCandidates(newCandidates);
    };

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        try {
            // 1. Update Election
            await electionService.updateElection(id, {
                title,
                description,
                end_date: new Date(endDate).toISOString(),
                is_active: isActive
                // position_id: positionId !== "none" ? Number(positionId) : null,
            });

            // 2. Handle Candidates (This is a simplified approach: just add new ones if we don't have a robust sync yet)
            for (const candidate of candidates) {
                if (!('id' in candidate) && candidate.name.trim()) {
                    await electionService.addCandidate(id, {
                        name: candidate.name,
                        bio: candidate.bio
                    });
                }
            }

            toast({
                title: "Election Updated",
                description: "The election details and candidates have been saved.",
            });

            router.push("/admin/elections");
            router.refresh();
        } catch (e) {
            toast({
                title: "Error",
                description: "Failed to update election.",
                variant: "destructive"
            });
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this election? All votes will be lost.")) return;
        try {
            await electionService.deleteElection(id);
            toast({
                title: "Election Deleted",
                description: "The election has been successfully removed.",
            });
            router.push("/admin/elections");
            router.refresh();
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to delete election.",
                variant: "destructive"
            });
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/elections" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back to Elections
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Election</h2>
                    <p className="text-muted-foreground">Modify election details and candidates.</p>
                </div>
                <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Election
                </Button>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Election Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50 mb-4">
                            <Label htmlFor="active" className="cursor-pointer">Election Status (Active/Closed)</Label>
                            <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Election Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_date">End Date & Time</Label>
                            <Input
                                id="end_date"
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>Candidates</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addCandidateField}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Candidate
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {candidates.map((candidate, index) => (
                            <div key={index} className="space-y-4 p-4 border rounded-lg relative bg-muted/30">
                                {'id' in candidate && (
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="outline">Existing Candidate</Badge>
                                    </div>
                                )}
                                {!('id' in candidate) && candidates.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 text-destructive"
                                        onClick={() => removeCandidateField(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                                <div className="space-y-2">
                                    <Label>Candidate Name</Label>
                                    <Input
                                        value={candidate.name}
                                        onChange={(e) => updateCandidate(index, "name", e.target.value)}
                                        required
                                        disabled={'id' in candidate}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Short Bio</Label>
                                    <Textarea
                                        value={candidate.bio || ""}
                                        onChange={(e) => updateCandidate(index, "bio", e.target.value)}
                                        className="h-20"
                                        disabled={'id' in candidate}
                                    />
                                </div>
                            </div>
                        ))}
                        <p className="text-xs text-muted-foreground italic">
                            * For now, only new candidates can be added. Existing candidates cannot be edited directly once an election starts.
                        </p>
                    </CardContent>
                </Card>

                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
