import { fetchJson } from "@/lib/api";

export interface Tenant {
    id: number;
    name: string;
    slug: string;
    plan_tier: "starter" | "professional" | "business";
    is_active: boolean;
}

export interface Member {
    id: number;
    email: string;
    full_name: string;
    role: string;
    membership_tier: string;
    bio?: string;
    phone_number?: string;
    avatar_url?: string;
    linkedin_url?: string;
    is_active: boolean;
    tenant_id?: number;
    tenant?: Tenant;
}

export const memberService = {
    async getMembers(skip = 0, limit = 100): Promise<Member[]> {
        return fetchJson<Member[]>(`/api/v1/users/?skip=${skip}&limit=${limit}`);
    },

    async updateMe(data: Partial<Member>): Promise<Member> {
        return fetchJson<Member>("/api/v1/users/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async getMe(): Promise<Member> {
        return fetchJson<Member>("/api/v1/users/me");
    },

    async createMember(data: any): Promise<Member> {
        return fetchJson<Member>("/api/v1/users/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async updateMember(id: number, data: Partial<Member>): Promise<Member> {
        return fetchJson<Member>(`/api/v1/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async getMember(id: number): Promise<Member> {
        return fetchJson<Member>(`/api/v1/users/${id}`);
    }
};
