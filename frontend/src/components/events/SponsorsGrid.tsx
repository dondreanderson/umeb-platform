import React from "react";
import { SponsorService, Sponsor } from "@/services/sponsor";
import { Loader2, ExternalLink, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SponsorsGridProps {
    eventId: number;
}

export function SponsorsGrid({ eventId }: SponsorsGridProps) {
    const [sponsors, setSponsors] = React.useState<Sponsor[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadSponsors();
    }, [eventId]);

    async function loadSponsors() {
        try {
            const data = await SponsorService.getEventSponsors(eventId);
            setSponsors(data);
        } catch (error) {
            console.error("Failed to load sponsors", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;

    if (sponsors.length === 0) return null;

    // Group by tier
    const tiers = ["Platinum", "Gold", "Silver", "Bronze"];
    const grouped = sponsors.reduce((acc, s) => {
        if (!acc[s.tier]) acc[s.tier] = [];
        acc[s.tier].push(s);
        return acc;
    }, {} as Record<string, Sponsor[]>);

    return (
        <div className="space-y-12">
            {tiers.map((tier) => {
                const tierSponsors = grouped[tier];
                if (!tierSponsors || tierSponsors.length === 0) return null;

                return (
                    <div key={tier} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-border" />
                            <h3 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${tier === "Platinum" ? "text-blue-600" :
                                tier === "Gold" ? "text-yellow-600" :
                                    tier === "Silver" ? "text-slate-500" : "text-orange-600"
                                }`}>
                                <Award className="h-5 w-5" />
                                {tier} Partners
                            </h3>
                            <div className="h-px flex-1 bg-border" />
                        </div>

                        <div className={`grid gap-8 ${tier === "Platinum" ? "grid-cols-1 md:grid-cols-2" :
                            tier === "Gold" ? "grid-cols-2 md:grid-cols-3" :
                                "grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
                            }`}>
                            {tierSponsors.map((sponsor) => (
                                <div key={sponsor.id} className="group relative flex flex-col items-center text-center space-y-3 bg-muted/20 p-6 rounded-2xl border border-transparent transition-all hover:bg-background hover:border-primary/20 hover:shadow-xl">
                                    {sponsor.logo_url ? (
                                        <div className="relative h-24 w-full flex items-center justify-center p-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={sponsor.logo_url}
                                                alt={sponsor.name}
                                                className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                                            {sponsor.name.charAt(0)}
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-bold text-lg">{sponsor.name}</h4>
                                        {sponsor.website && (
                                            <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors">
                                                Visit Website <ExternalLink className="ml-1 h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
