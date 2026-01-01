"use client";

import { useEffect, useState } from "react";
import { fundraisingService, FundraisingCampaign } from "@/services/fundraising";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Heart,
    ChevronLeft,
    Gift,
    ShieldCheck,
    Loader2,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function DonationsPage() {
    const { toast } = useToast();
    const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState<FundraisingCampaign | null>(null);
    const [amount, setAmount] = useState("");
    const [isDonating, setIsDonating] = useState(false);

    // Temp donor info (usually would be from logged in user)
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    useEffect(() => {
        loadCampaigns();
    }, []);

    async function loadCampaigns() {
        setLoading(true);
        try {
            const data = await fundraisingService.getCampaigns();
            setCampaigns(data.filter(c => c.is_active));
        } catch (error) {
            console.error("Failed to load campaigns", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDonate(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedCampaign) return;

        setIsDonating(true);
        try {
            // 1. Create or Find Donor
            const donor = await fundraisingService.createDonor({
                first_name: firstName,
                last_name: lastName,
                email: email
            });

            // 2. Create Donation
            await fundraisingService.createDonation({
                amount: Number(amount),
                currency: "USD",
                donor_id: donor.id,
                campaign_id: selectedCampaign.id
            });

            toast({
                title: "Thank you!",
                description: `Successfully donated $${amount} to ${selectedCampaign.title}.`,
            });

            // Reset
            setAmount("");
            setSelectedCampaign(null);
            loadCampaigns();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to process donation.",
                variant: "destructive"
            });
        } finally {
            setIsDonating(false);
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/portal" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back to Portal
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Support Our Mission</h2>
                    <p className="text-muted-foreground">Your contribution helps us build a stronger community.</p>
                </div>
                <div className="hidden md:flex items-center text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Secure Payment Processing
                </div>
            </div>

            {!selectedCampaign ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {campaigns.map((campaign) => {
                        const progress = Math.min(Math.round((campaign.current_amount / campaign.target_amount) * 100), 100);
                        return (
                            <Card key={campaign.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="text-primary border-primary/20">Active Campaign</Badge>
                                        <Heart className={`h-5 w-5 ${progress > 50 ? 'text-red-500 fill-red-500' : 'text-muted-foreground opacity-20'}`} />
                                    </div>
                                    <CardTitle>{campaign.title}</CardTitle>
                                    <CardDescription className="mt-2 h-12 line-clamp-2">{campaign.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold text-lg">${campaign.current_amount.toLocaleString()}</span>
                                            <span className="text-muted-foreground self-end">Target: ${campaign.target_amount.toLocaleString()}</span>
                                        </div>
                                        <Progress value={progress} className="h-3" />
                                        <p className="text-right text-xs text-muted-foreground">{progress}% of goal reached</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full group" onClick={() => setSelectedCampaign(campaign)}>
                                        Donate Now
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="max-w-2xl mx-auto">
                    <Button variant="ghost" className="mb-6 -ml-2" onClick={() => setSelectedCampaign(null)}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Choose different campaign
                    </Button>

                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <Gift className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>Donating to: {selectedCampaign.title}</CardTitle>
                            <CardDescription>Enter your details and contribution amount.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form id="donation-form" onSubmit={handleDonate} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first">First Name</Label>
                                        <Input id="first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Jane" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last">Last Name</Label>
                                        <Input id="last" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Doe" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="jane.doe@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Donation Amount ($)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                        <Input
                                            id="amount"
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                            className="pl-7 text-lg font-bold"
                                            placeholder="25"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {["10", "25", "50", "100", "250", "500"].map((val) => (
                                        <Button
                                            key={val}
                                            type="button"
                                            variant="outline"
                                            onClick={() => setAmount(val)}
                                            className={amount === val ? "border-primary bg-primary/5 text-primary" : ""}
                                        >
                                            ${val}
                                        </Button>
                                    ))}
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter>
                            <Button
                                form="donation-form"
                                type="submit"
                                className="w-full text-lg h-12"
                                disabled={isDonating || !amount || !email}
                            >
                                {isDonating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="mr-2 h-5 w-5 fill-current" />}
                                Complete Donation
                            </Button>
                        </CardFooter>
                    </Card>

                    <p className="text-center text-xs text-muted-foreground mt-8">
                        UMEB is a registered non-profit organization. All donations are tax-deductible to the extent permitted by law.
                    </p>
                </div>
            )}
        </div>
    );
}
