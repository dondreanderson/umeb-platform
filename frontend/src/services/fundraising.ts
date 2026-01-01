import { fetchJson } from "@/lib/api";

export interface Donation {
    id: number;
    amount: number;
    currency: string;
    payment_status: string;
    campaign_id?: number;
    created_at: string;
}

export interface FundraisingCampaign {
    id: number;
    title: string;
    description?: string;
    target_amount: number;
    current_amount: number;
    start_date: string;
    end_date?: string;
    is_active: boolean;
    donations?: Donation[];
}

export interface FundraisingCampaignCreate {
    title: string;
    description?: string;
    target_amount: number;
    end_date?: string;
}

export interface Donor {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
}

export interface DonationCreate {
    amount: number;
    currency: string;
    donor_id: number;
    campaign_id?: number;
}

export const fundraisingService = {
    async getCampaigns(): Promise<FundraisingCampaign[]> {
        return fetchJson<FundraisingCampaign[]>("/api/v1/donors/campaigns");
    },

    async getCampaign(id: number): Promise<FundraisingCampaign> {
        return fetchJson<FundraisingCampaign>(`/api/v1/donors/campaigns/${id}`);
    },

    async createCampaign(campaign: FundraisingCampaignCreate): Promise<FundraisingCampaign> {
        return fetchJson<FundraisingCampaign>("/api/v1/donors/campaigns", {
            method: "POST",
            body: JSON.stringify(campaign),
        });
    },

    async createDonor(donor: { first_name: string; last_name: string; email: string; phone?: string }): Promise<Donor> {
        return fetchJson<Donor>("/api/v1/donors/", {
            method: "POST",
            body: JSON.stringify(donor),
        });
    },

    async createDonation(donation: DonationCreate): Promise<Donation> {
        return fetchJson<Donation>("/api/v1/donors/donations", {
            method: "POST",
            body: JSON.stringify(donation),
        });
    },

    async getDonors(): Promise<Donor[]> {
        return fetchJson<Donor[]>("/api/v1/donors/");
    }
};
