import { fetchJson } from '@/lib/api';

export interface Sponsor {
    id: number;
    event_id: number;
    name: string;
    logo_url?: string;
    tier: string;
    website?: string;
    bio?: string;
    created_at: string;
    updated_at: string;
}

export interface SponsorCreate {
    name: string;
    logo_url?: string;
    tier?: string;
    website?: string;
    bio?: string;
    event_id: number;
}

export interface SponsorUpdate {
    name?: string;
    logo_url?: string;
    tier?: string;
    website?: string;
    bio?: string;
}

export const SponsorService = {
    getEventSponsors: async (eventId: number): Promise<Sponsor[]> => {
        return fetchJson<Sponsor[]>(`/api/v1/events/${eventId}/sponsors`);
    },

    createSponsor: async (eventId: number, data: SponsorCreate): Promise<Sponsor> => {
        return fetchJson<Sponsor>(`/api/v1/events/${eventId}/sponsors`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    updateSponsor: async (sponsorId: number, data: SponsorUpdate): Promise<Sponsor> => {
        return fetchJson<Sponsor>(`/api/v1/sponsors/${sponsorId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    deleteSponsor: async (sponsorId: number): Promise<void> => {
        await fetchJson<void>(`/api/v1/sponsors/${sponsorId}`, {
            method: 'DELETE'
        });
    }
};
