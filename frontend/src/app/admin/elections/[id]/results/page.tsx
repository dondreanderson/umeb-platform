"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { electionService, ElectionResults } from "@/services/election";
import { ChevronLeft, Loader2, BarChart3, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ElectionResultsPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const [results, setResults] = React.useState<ElectionResults | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

    React.useEffect(() => {
        loadResults();
        // Poll every 5 seconds
        const interval = setInterval(loadResults, 5000);
        return () => clearInterval(interval);
    }, [id]);

    const loadResults = async () => {
        try {
            const data = await electionService.getResults(id);
            setResults(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to load results", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!results) {
        return <div className="p-8">Election not found.</div>;
    }

    const totalVotes = results.results.reduce((acc, curr) => acc + curr.votes, 0);

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <div>
                <Button variant="ghost" className="-ml-2 mb-4" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Election Results: {results.title}</h2>
                        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                            <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4" />
                                {totalVotes} Total Votes
                            </div>
                        </div>
                    </div>
                    {lastUpdated && (
                        <div className="text-right">
                            <span className="text-xs text-muted-foreground block">Live Updates (5s)</span>
                            <span className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <BarChart3 className="mr-2 h-5 w-5" />
                            Live Tally
                        </CardTitle>
                        <CardDescription>Real-time vote distribution across candidates.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {results.results.sort((a, b) => b.votes - a.votes).map((candidate) => {
                            const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;
                            return (
                                <div key={candidate.candidate_id} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span>{candidate.name}</span>
                                        <div className="text-right">
                                            <span className="text-muted-foreground mr-2">{candidate.votes} votes</span>
                                            <span>{percentage.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <Progress value={percentage} className="h-3" />
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
