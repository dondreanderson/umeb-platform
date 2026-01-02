"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="mb-4 text-lg text-muted-foreground">Page not found</p>
            <Button asChild>
                <Link href="/">
                    Go back home
                </Link>
            </Button>
        </div>
    );
}
