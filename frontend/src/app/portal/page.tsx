import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MemberPortalPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">My Portal</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="tracking-tight text-lg font-medium mb-2">My Membership</h3>
                    <p>Status: <span className="text-green-600 font-bold">Active</span></p>
                    <p>Tier: Gold Member</p>
                    <p>Renews: Dec 2026</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 overflow-hidden relative">
                    <h3 className="tracking-tight text-lg font-medium mb-2">Upcoming Events</h3>
                    <p className="text-muted-foreground">No upcoming registered events.</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="tracking-tight text-lg font-medium mb-2">Member Elections</h3>
                        <p className="text-sm text-muted-foreground mb-4">Participate in organizational decisions and vote for your representatives.</p>
                    </div>
                    <Button asChild className="w-full">
                        <Link href="/portal/vote">
                            Go to Voting Portal
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
