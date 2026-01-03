"use client";

import React from "react";
import { systemAdminService, GlobalStats } from "@/services/systemAdmin";
import { Tenant } from "@/services/member";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    Building2,
    Calendar,
    Heart,
    Loader2,
    Plus,
    Settings2,
    CheckCircle2,
    XCircle,
    ShieldAlert,
    Trash2
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SuperAdminDashboard() {
    const { toast } = useToast();
    const [stats, setStats] = React.useState<GlobalStats | null>(null);
    const [tenants, setTenants] = React.useState<Tenant[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Create Tenant State
    const [isCreating, setIsCreating] = React.useState(false);
    const [showCreate, setShowCreate] = React.useState(false);
    const [newTenantName, setNewTenantName] = React.useState("");
    const [newTenantSlug, setNewTenantSlug] = React.useState("");

    // Delete State
    const [tenantToDelete, setTenantToDelete] = React.useState<Tenant | null>(null);

    React.useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [statsData, tenantsData] = await Promise.all([
                systemAdminService.getStats(),
                systemAdminService.getTenants()
            ]);
            setStats(statsData);
            setTenants(tenantsData);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to load system data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateTenant(e: React.FormEvent) {
        e.preventDefault();
        setIsCreating(true);
        try {
            await systemAdminService.createTenant({
                name: newTenantName,
                slug: newTenantSlug,
                plan_tier: "starter"
            });
            toast({ title: "Success", description: "Tenant created successfully." });
            setShowCreate(false);
            loadData();
            // Reset
            setNewTenantName("");
            setNewTenantSlug("");
        } catch (error) {
            toast({ title: "Error", description: "Failed to create tenant.", variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    }

    async function handleUpdatePlan(id: number, tier: string) {
        try {
            await systemAdminService.updateTenant(id, { plan_tier: tier });
            toast({ title: "Plan Updated", description: "Organization tier updated successfully." });
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update plan.", variant: "destructive" });
        }
    }

    async function handleDeleteTenant() {
        if (!tenantToDelete) return;
        try {
            await systemAdminService.deleteTenant(tenantToDelete.id);
            toast({ title: "Tenant Deleted", description: "Organization has been permanently deleted." });
            setTenantToDelete(null);
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete tenant.", variant: "destructive" });
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-red-600">System Admin Control</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">Platform Overview</h1>
                    <p className="text-slate-500 font-medium">Manage all network nodes and organizations.</p>
                </div>

                <Dialog open={showCreate} onOpenChange={setShowCreate}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800">
                            <Plus className="mr-2 h-5 w-5" />
                            Provision New Tenant
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Organization</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateTenant} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Organization Name</Label>
                                <Input value={newTenantName} onChange={(e) => setNewTenantName(e.target.value)} required placeholder="e.g. Hope Foundation" />
                            </div>
                            <div className="space-y-2">
                                <Label>URL Slug</Label>
                                <Input value={newTenantSlug} onChange={(e) => setNewTenantSlug(e.target.value.toLowerCase().replace(/ /g, '-'))} required placeholder="hope-foundation" />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating} className="w-full">
                                    {isCreating ? <Loader2 className="animate-spin h-4 w-4" /> : "Initiate Provisioning"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {[
                    { title: "Total Nodes", value: stats?.total_tenants, icon: Building2, color: "text-blue-600" },
                    { title: "Global Users", value: stats?.total_users, icon: Users, color: "text-purple-600" },
                    { title: "Active Events", value: stats?.total_events, icon: Calendar, color: "text-amber-600" },
                    { title: "Network Revenue", value: `$${stats?.total_donations?.toLocaleString()}`, icon: Heart, color: "text-red-600" },
                ].map((item, i) => (
                    <Card key={i} className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">{item.title}</CardTitle>
                            <item.icon className={`h-4 w-4 ${item.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900">{item.value ?? 0}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">Tenant Registry</CardTitle>
                            <CardDescription>Manage organization access and feature tiers.</CardDescription>
                        </div>
                        <Settings2 className="h-5 w-5 text-slate-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-bold">Organization</TableHead>
                                <TableHead className="font-bold">Slug</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold">Plan Tier</TableHead>
                                <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenants.map((tenant) => (
                                <TableRow key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-bold text-slate-900">{tenant.name}</TableCell>
                                    <TableCell className="font-mono text-xs text-slate-500">{tenant.slug}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            {tenant.is_active ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-slate-300" />}
                                            <span className={`text-xs font-bold uppercase ${tenant.is_active ? 'text-green-700' : 'text-slate-500'}`}>
                                                {tenant.is_active ? "Live" : "Suspended"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`
                                            uppercase text-[10px] font-black px-2 py-0.5
                                            ${tenant.plan_tier === 'business' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                                                tenant.plan_tier === 'professional' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                                                    'border-slate-200 bg-slate-50 text-slate-700'}
                                        `}>
                                            {tenant.plan_tier}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Select
                                                defaultValue={tenant.plan_tier}
                                                onValueChange={(val) => handleUpdatePlan(tenant.id, val)}
                                            >
                                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                                    <SelectValue placeholder="Update Tier" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="starter">Starter</SelectItem>
                                                    <SelectItem value="professional">Professional</SelectItem>
                                                    <SelectItem value="business">Business</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setTenantToDelete(tenant)}
                                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!tenantToDelete} onOpenChange={(open: boolean) => !open && setTenantToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            <span className="font-bold text-slate-900"> {tenantToDelete?.name} </span>
                            and remove all associated data (events, users, donations) from the servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTenant} className="bg-red-600 hover:bg-red-700 text-white">
                            Delete Organization
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
