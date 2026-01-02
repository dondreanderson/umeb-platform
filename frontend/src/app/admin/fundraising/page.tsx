"use client";

import React from "react";
import { fundraisingService, FundraisingCampaign, Donor } from "@/services/fundraising";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Plus,
    Target,
    TrendingUp,
    Users,
    Calendar,
    Loader2,
    Heart
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

export default function AdminFundraisingPage() {
    const { toast } = useToast();
    const [campaigns, setCampaigns] = React.useState<FundraisingCampaign[]>([]);
    const [donors, setDonors] = React.useState<Donor[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isCreating, setIsCreating] = React.useState(false);
    const [showCreateDialog, setShowCreateDialog] = React.useState(false);

    // Create Campaign Form State
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [targetAmount, setTargetAmount] = React.useState("");
    const [endDate, setEndDate] = React.useState("");

    React.useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [campaignsData, donorsData] = await Promise.all([
                fundraisingService.getCampaigns(),
                fundraisingService.getDonors()
            ]);
            setCampaigns(campaignsData);
            setDonors(donorsData);
        } catch (error) {
            console.error("Failed to load fundraising data", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateCampaign(e: React.FormEvent) {
        e.preventDefault();
        setIsCreating(true);
        try {
            await fundraisingService.createCampaign({
                title,
                description,
                target_amount: Number(targetAmount),
                end_date: endDate ? new Date(endDate).toISOString() : undefined
            });
            setShowCreateDialog(false);
            loadData();
            toast({
                title: "Campaign Created",
                description: "Your new fundraising campaign is now live.",
            });
            // Reset form
            setTitle("");
            setDescription("");
            setTargetAmount("");
            setEndDate("");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create campaign.",
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const totalDonated = campaigns.reduce((acc, curr) => acc + curr.current_amount, 0);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fundraising Management</h1>
                    <p className="text-muted-foreground">Track campaigns, goals, and donor contributions.</p>
                </div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Fundraising Campaign</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateCampaign} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Campaign Title</Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Annual Gala 2025" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc">Description</Label>
                                <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What are we raising money for?" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target">Target Amount ($)</Label>
                                <Input id="target" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required placeholder="5000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end">End Date (Optional)</Label>
                                <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Campaign"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalDonated.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Across {campaigns.length} campaigns</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{donors.length}</div>
                        <p className="text-xs text-muted-foreground">Generous contributors</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Goal Success Rate</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {campaigns.length > 0
                                ? Math.round((campaigns.filter(c => c.current_amount >= c.target_amount).length / campaigns.length) * 100)
                                : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Campaigns hitting target</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Active Campaigns</h2>
                    <div className="grid gap-4">
                        {campaigns.map((campaign) => {
                            const progress = Math.min(Math.round((campaign.current_amount / campaign.target_amount) * 100), 100);
                            return (
                                <Card key={campaign.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle>{campaign.title}</CardTitle>
                                                <CardDescription className="line-clamp-1">{campaign.description}</CardDescription>
                                            </div>
                                            <Badge variant={campaign.is_active ? "default" : "secondary"}>
                                                {campaign.is_active ? "Active" : "Closed"}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">${campaign.current_amount.toLocaleString()} raised</span>
                                            <span className="text-muted-foreground">of ${campaign.target_amount.toLocaleString()}</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            Starts: {new Date(campaign.start_date).toLocaleDateString()}
                                            {campaign.end_date && ` • Ends: ${new Date(campaign.end_date).toLocaleDateString()}`}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {campaigns.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">No campaigns created yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Recent Donors</h2>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Donor</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Contact</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {donors.map((donor) => (
                                    <TableRow key={donor.id}>
                                        <TableCell className="font-medium">{donor.first_name} {donor.last_name}</TableCell>
                                        <TableCell>{donor.email}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{donor.phone || "N/A"}</TableCell>
                                    </TableRow>
                                ))}
                                {donors.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            No donor records yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </div>
    );
}
