"use client";

import React from "react";
import { positionService, Position } from "@/services/position";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Briefcase } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function PositionsPage() {
    const [positions, setPositions] = React.useState<Position[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [open, setOpen] = React.useState(false);

    // Form State
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [termLength, setTermLength] = React.useState("1 Year");
    const [isExecutive, setIsExecutive] = React.useState(false);

    React.useEffect(() => {
        loadPositions();
    }, []);

    const loadPositions = async () => {
        try {
            const data = await positionService.getPositions();
            setPositions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async () => {
        try {
            await positionService.createPosition({
                title,
                description,
                term_length: termLength,
                is_executive: isExecutive
            });
            setOpen(false);
            loadPositions();
            // Reset form
            setTitle("");
            setDescription("");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Leadership Roles</h2>
                    <p className="text-muted-foreground">Manage officer positions and board roles.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Position
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Position</DialogTitle>
                            <DialogDescription>Define a new leadership role.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="President" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="term">Term Length</Label>
                                <Input id="term" value={termLength} onChange={(e) => setTermLength(e.target.value)} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="exec" checked={isExecutive} onCheckedChange={setIsExecutive} />
                                <Label htmlFor="exec">Executive Board Role?</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={onSubmit}>Create Position</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {positions.map((pos) => (
                        <Card key={pos.id} className={pos.is_executive ? "border-primary" : ""}>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Briefcase className="mr-2 h-5 w-5 opacity-70" />
                                    {pos.title}
                                </CardTitle>
                                <CardDescription>{pos.term_length} Term</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {pos.description || "No description provided."}
                                </p>
                                <div className="text-xs bg-muted p-2 rounded">
                                    Current Holder: <span className="font-medium">
                                        {pos.current_holder_id ? "Occupied" : "Vacant"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
