import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-24 md:py-32 bg-gradient-to-b from-background to-muted/30">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary mb-6">
          United Men Empowering Brotherhood
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-[800px] mb-10">
          A comprehensive management platform for nonprofits. Streamline donations, events, membership, and more.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 bg-secondary hover:bg-secondary/90 text-white">
              Become a Member
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Basic Features Grid (Placeholder) */}
      <section className="py-16 px-4 md:px-6 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="text-xl font-bold mb-2 text-primary">Membership</h3>
            <p className="text-muted-foreground">Manage tiers, renewals, and profiles with ease.</p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="text-xl font-bold mb-2 text-secondary">Events</h3>
            <p className="text-muted-foreground">Ticketing, RSVP, and check-ins all in one place.</p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="text-xl font-bold mb-2 text-primary">Donations</h3>
            <p className="text-muted-foreground">Secure processing and automated tax receipts.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
