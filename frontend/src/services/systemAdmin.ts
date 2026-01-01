import { fetchJson } from "@/lib/api";
import { Tenant } from "./member";

export interface GlobalStats {
    total_tenants: number;
    total_users: number;
    total_events: number;
    total_donations: number;
}

export interface TenantCreate {
    name: string;
    slug: string;
    plan_tier?: string;
}

export interface TenantUpdate {
    name?: string;
    plan_tier?: string;
    is_active?: boolean;
}

export const systemAdminService = {
    async getTenants(): Promise<Tenant[]> {
        return fetchJson<Tenant[]>("/api/v1/super-admin/tenants");
    },

    async createTenant(data: TenantCreate): Promise<Tenant> {
        return fetchJson<Tenant>("/api/v1/super-admin/tenants", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    async updateTenant(id: number, data: TenantUpdate): Promise<Tenant> {
        return fetchJson<Tenant>(`/api/v1/super-admin/tenants/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    async getStats(): Promise<GlobalStats> {
        return fetchJson<GlobalStats>("/api/v1/super-admin/stats");
    }
};
