"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { electionService, Election, Candidate } from "@/services/election";
import { Vote as VoteIcon, CheckCircle2, AlertCircle, Loader2, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function VotingPortalPage() {
    const [elections, setElections] = useState<Election[]>([]);
    const [loading, setLoading] = useState(true);
    const [votingFor, setVotingFor] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        loadElections();
    }, []);

    const loadElections = async () => {
        try {
            const data = await electionService.getElections();
            // Filter only active elections for members
            setElections(data.filter(e => e.is_active));
        } catch (error) {
            console.error("Failed to load elections", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (electionId: number, candidateId: number) => {
        setVotingFor(candidateId);
        setMessage(null);
        try {
            await electionService.castVote(electionId, candidateId);
            setMessage({ type: "success", text: "Your vote has been cast successfully!" });
            // Optionally reload or mark as voted
        } catch (error: any) {
            console.error("Failed to cast vote", error);
            setMessage({
                type: "error",
                text: error.message || "Failed to cast vote. You may have already voted."
            });
        } finally {
            setVotingFor(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/portal" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back to Portal
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Voting Portal</h2>
                    <p className="text-muted-foreground">Exercise your right to vote in active elections.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="space-y-6">
                    {message && (
                        <div className={`p-4 rounded-lg flex items-center space-x-2 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                            {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            <span className="text-sm font-medium">{message.text}</span>
                        </div>
                    )}

                    {elections.length === 0 ? (
                        <Card className="border-dashed">
                            <CardHeader className="text-center py-12">
                                <VoteIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                                <CardTitle className="text-muted-foreground">No active elections</CardTitle>
                                <CardDescription>There are no elections currently open for voting.</CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        elections.map((election) => (
                            <Card key={election.id} className="overflow-hidden border-2 border-primary/10">
                                <CardHeader className="bg-primary/5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{election.title}</CardTitle>
                                            <CardDescription className="mt-2">{election.description}</CardDescription>
                                        </div>
                                        <Badge>Open</Badge>
                                    </div>
                                    <div className="mt-4 text-xs font-medium text-muted-foreground flex items-center">
                                        Ends on: {new Date(election.end_date).toLocaleString()}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Select a Candidate</h4>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {election.candidates.map((candidate) => (
                                            <div key={candidate.id} className="border rounded-xl p-4 flex flex-col justify-between hover:border-primary/50 transition-colors">
                                                <div>
                                                    <h5 className="font-bold text-lg">{candidate.name}</h5>
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{candidate.bio}</p>
                                                </div>
                                                <Button
                                                    className="mt-4 w-full"
                                                    onClick={() => handleVote(election.id, candidate.id)}
                                                    disabled={votingFor !== null}
                                                >
                                                    {votingFor === candidate.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vote for " + candidate.name}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
