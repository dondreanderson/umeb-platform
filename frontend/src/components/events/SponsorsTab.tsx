import React from "react";
import { SponsorService, Sponsor, SponsorCreate } from "@/services/sponsor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, ExternalLink, Award } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SponsorsTabProps {
    eventId: number;
}

const TIER_COLORS: Record<string, string> = {
    Platinum: "bg-blue-100 text-blue-800 border-blue-200",
    Gold: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Silver: "bg-slate-100 text-slate-800 border-slate-200",
    Bronze: "bg-orange-100 text-orange-800 border-orange-200"
};

export function SponsorsTab({ eventId }: SponsorsTabProps) {
    const [sponsors, setSponsors] = React.useState<Sponsor[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isAdding, setIsAdding] = React.useState(false);
    const { toast } = useToast();

    const [newSponsor, setNewSponsor] = React.useState<Partial<SponsorCreate>>({
        name: "",
        logo_url: "",
        tier: "Bronze",
        website: "",
        bio: ""
    });

    React.useEffect(() => {
        loadSponsors();
    }, [eventId]);

    async function loadSponsors() {
        try {
            const data = await SponsorService.getEventSponsors(eventId);
            setSponsors(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load sponsors.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleAddSponsor() {
        if (!newSponsor.name) {
            toast({
                title: "Validation Error",
                description: "Sponsor name is required.",
                variant: "destructive"
            });
            return;
        }

        try {
            await SponsorService.createSponsor(eventId, {
                ...newSponsor as SponsorCreate,
                event_id: eventId
            });
            toast({ title: "Success", description: "Sponsor added." });
            setIsAdding(false);
            setNewSponsor({ name: "", logo_url: "", tier: "Bronze", website: "", bio: "" });
            loadSponsors();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add sponsor.",
                variant: "destructive"
            });
        }
    }

    async function handleDeleteSponsor(sponsorId: number) {
        if (!confirm("Are you sure you want to remove this sponsor?")) return;
        try {
            await SponsorService.deleteSponsor(sponsorId);
            toast({ title: "Deleted", description: "Sponsor removed." });
            loadSponsors();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove sponsor.",
                variant: "destructive"
            });
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Event Partners & Sponsors</h3>
                <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"}>
                    {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Add Sponsor</>}
                </Button>
            </div>

            {isAdding && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-sm">New Sponsor Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                placeholder="Sponsor Name"
                                value={newSponsor.name}
                                onChange={e => setNewSponsor({ ...newSponsor, name: e.target.value })}
                            />
                            <Select
                                value={newSponsor.tier}
                                onValueChange={val => setNewSponsor({ ...newSponsor, tier: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Tier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Platinum">Platinum</SelectItem>
                                    <SelectItem value="Gold">Gold</SelectItem>
                                    <SelectItem value="Silver">Silver</SelectItem>
                                    <SelectItem value="Bronze">Bronze</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Logo URL"
                                value={newSponsor.logo_url}
                                onChange={e => setNewSponsor({ ...newSponsor, logo_url: e.target.value })}
                            />
                            <Input
                                placeholder="Website URL"
                                value={newSponsor.website}
                                onChange={e => setNewSponsor({ ...newSponsor, website: e.target.value })}
                            />
                            <Textarea
                                className="md:col-span-2"
                                placeholder="Sponsor Bio / Description"
                                value={newSponsor.bio}
                                onChange={e => setNewSponsor({ ...newSponsor, bio: e.target.value })}
                            />
                        </div>
                        <Button className="w-full" onClick={handleAddSponsor}>Save Sponsor</Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                {sponsors.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 col-span-3">No sponsors added yet.</p>
                ) : (
                    sponsors.map((sponsor) => (
                        <Card key={sponsor.id} className="overflow-hidden">
                            <div className="h-2 bg-muted flex">
                                <div className={`h-full w-full ${TIER_COLORS[sponsor.tier]?.split(' ')[0] || 'bg-gray-200'}`} />
                            </div>
                            <CardContent className="pt-4">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className={TIER_COLORS[sponsor.tier]}>
                                        <Award className="mr-1 h-3 w-3" />
                                        {sponsor.tier}
                                    </Badge>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSponsor(sponsor.id)} className="h-8 w-8 text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <h4 className="font-bold text-lg mb-1">{sponsor.name}</h4>
                                {sponsor.website && (
                                    <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center hover:underline mb-2">
                                        <ExternalLink className="mr-1 h-3 w-3" />
                                        Visit Website
                                    </a>
                                )}
                                <p className="text-xs text-muted-foreground line-clamp-2">{sponsor.bio || "No bio provided."}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
