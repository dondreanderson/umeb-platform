"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Vote as VoteIcon, Calendar, Loader2 } from "lucide-react";
import { electionService, Election } from "@/services/election";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminElectionsPage() {
    const [elections, setElections] = React.useState<Election[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadElections();
    }, []);

    const loadElections = async () => {
        try {
            const data = await electionService.getElections();
            setElections(data);
        } catch (error) {
            console.error("Failed to load elections", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Election Management</h2>
                    <p className="text-muted-foreground">Manage organizational elections and voting processes.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/elections/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Election
                    </Link>
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {elections.length === 0 ? (
                        <Card className="col-span-full border-dashed">
                            <CardHeader className="text-center">
                                <VoteIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                                <CardTitle className="text-muted-foreground">No elections found</CardTitle>
                                <CardDescription>Create your first election to get started.</CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        elections.map((election) => (
                            <Card key={election.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">{election.title}</CardTitle>
                                        <Badge variant={election.is_active ? "default" : "secondary"}>
                                            {election.is_active ? "Active" : "Closed"}
                                        </Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {election.description || "No description provided."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {new Date(election.end_date).toLocaleDateString()} (End)
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <VoteIcon className="mr-2 h-4 w-4" />
                                            {election.candidates?.length || 0} Candidates
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline" size="sm" className="w-full" asChild>
                                            <Link href={`/admin/elections/${election.id}/results`}>
                                                View Results
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" className="w-full" asChild>
                                            <Link href={`/admin/elections/${election.id}/edit`}>
                                                Edit
                                            </Link>
                                        </Button>
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
