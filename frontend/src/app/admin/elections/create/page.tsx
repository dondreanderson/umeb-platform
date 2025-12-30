"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { electionService } from "@/services/election";
import { positionService, Position } from "@/services/position";
import { ChevronLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function CreateElectionPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [positions, setPositions] = useState<Position[]>([]);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [endDate, setEndDate] = useState("");
    const [positionId, setPositionId] = useState<string>("none");
    const [candidates, setCandidates] = useState<{ name: string; bio: string }[]>([
        { name: "", bio: "" }
    ]);

    useEffect(() => {
        positionService.getPositions().then(setPositions).catch(console.error);
    }, []);

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
        newCandidates[index][field] = value;
        setCandidates(newCandidates);
    };

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // 1. Create Election
            const election = await electionService.createElection({
                title,
                description,
                end_date: new Date(endDate).toISOString(),
                position_id: positionId !== "none" ? Number(positionId) : null,
            });

            // 2. Add Candidates
            for (const candidate of candidates) {
                if (candidate.name.trim()) {
                    await electionService.addCandidate(election.id, {
                        name: candidate.name,
                        bio: candidate.bio
                    });
                }
            }

            router.push("/admin/elections");
            router.refresh();
        } catch (e) {
            setError("Failed to create election. Please ensure all values are correct.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <div>
                <Link href="/admin/elections" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Elections
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Create New Election</h2>
                <p className="text-muted-foreground">Setup an election and nominees for your members.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Election Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Election Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="2025 Board of Directors"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="position">Link to Leadership Role (Optional)</Label>
                            <Select value={positionId} onValueChange={setPositionId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a position..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None (General Election)</SelectItem>
                                    {positions.map((pos) => (
                                        <SelectItem key={pos.id} value={pos.id.toString()}>
                                            {pos.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                If selected, the winner will be assigned to this role.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Explain the purpose of this election..."
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
                                {candidates.length > 1 && (
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
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Short Bio (Optional)</Label>
                                    <Textarea
                                        value={candidate.bio}
                                        onChange={(e) => updateCandidate(index, "bio", e.target.value)}
                                        placeholder="A brief introduction..."
                                        className="h-20"
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

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
                        ) : "Create Election"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
