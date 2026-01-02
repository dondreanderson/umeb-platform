"use client";

import React from "react";
import { memberService, Member } from "@/services/member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, User as UserIcon, Plus, MoreHorizontal, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MemberDirectoryPage() {
    const [members, setMembers] = React.useState<Member[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [viewMember, setViewMember] = React.useState<Member | null>(null);

    // Filters
    const [roleFilter, setRoleFilter] = React.useState("all");

    // Form
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [fullName, setFullName] = React.useState("");
    const [role, setRole] = React.useState("member");
    const [tier, setTier] = React.useState("none");

    React.useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            setLoading(true);
            const data = await memberService.getMembers();
            setMembers(data);
        } catch (error) {
            console.error("Failed to load members", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            setSaving(true);
            await memberService.createMember({
                email,
                password,
                full_name: fullName,
                role,
                membership_tier: tier
            });
            setOpen(false);
            // Reset form
            setEmail("");
            setPassword("");
            setFullName("");
            setRole("member");
            setTier("none");
            loadMembers();
        } catch (error) {
            console.error("Failed to create member", error);
            alert("Failed to create member.");
        } finally {
            setSaving(false);
        }
    };

    const handleStatusToggle = async (member: Member) => {
        const action = member.is_active ? "deactivate" : "activate";
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;
        try {
            await memberService.updateMember(member.id, { is_active: !member.is_active });
            loadMembers();
        } catch (error) {
            console.error(`Failed to ${action} member`, error);
            alert(`Failed to ${action} member.`);
        }
    };

    const filteredMembers = members.filter(m => {
        const matchesSearch =
            m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" || m.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Members</h2>
                    <p className="text-muted-foreground">Manage accounts, roles, and membership statuses.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Member</DialogTitle>
                                <DialogDescription>Create a new user account.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <Select value={role} onValueChange={setRole}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="member">Member</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Membership Tier</Label>
                                        <Select value={tier} onValueChange={setTier}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                <SelectItem value="bronze">Bronze</SelectItem>
                                                <SelectItem value="silver">Silver</SelectItem>
                                                <SelectItem value="gold">Gold</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreate} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Member
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search members..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Filter Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Avatar</TableHead>
                                <TableHead>Name / Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Tier</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredMembers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No members found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMembers.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                <UserIcon className="h-5 w-5 text-slate-500" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{member.full_name || "N/A"}</div>
                                            <div className="text-xs text-muted-foreground">{member.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={member.role === 'admin' ? "default" : "secondary"}>
                                                {member.role?.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {member.membership_tier !== "none" && (
                                                <Badge variant="outline" className="capitalize">
                                                    {member.membership_tier}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={member.is_active ? "text-green-600 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}>
                                                {member.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(member.email)}>
                                                        Copy Email
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => setViewMember(member)}>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className={member.is_active ? "text-destructive" : "text-green-600"}
                                                        onClick={() => handleStatusToggle(member)}
                                                    >
                                                        {member.is_active ? "Deactivate" : "Activate"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!viewMember} onOpenChange={(open) => !open && setViewMember(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Member Details</DialogTitle>
                        <DialogDescription>Full profile information.</DialogDescription>
                    </DialogHeader>
                    {viewMember && (
                        <div className="grid gap-4 py-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                                    <UserIcon className="h-8 w-8 text-slate-500" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg">{viewMember.full_name}</div>
                                    <div className="text-sm text-muted-foreground">{viewMember.email}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Role</Label>
                                    <div className="font-medium capitalize">{viewMember.role}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Tier</Label>
                                    <div className="font-medium capitalize">{viewMember.membership_tier}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Phone</Label>
                                    <div className="font-medium">{viewMember.phone_number || "N/A"}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div className={viewMember.is_active ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                        {viewMember.is_active ? "Active" : "Inactive"}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Bio</Label>
                                <div className="text-sm mt-1">{viewMember.bio || "No bio provided."}</div>
                            </div>
                            {viewMember.linkedin_url && (
                                <div>
                                    <Label className="text-muted-foreground">LinkedIn</Label>
                                    <div><a href={viewMember.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{viewMember.linkedin_url}</a></div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
}
