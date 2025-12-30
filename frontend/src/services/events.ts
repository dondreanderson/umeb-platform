import { fetchJson } from "@/lib/api";

export interface Event {
    id: number;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location: string;
    capacity?: number;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
    event_type: "WORKSHOP" | "GALA" | "MEETING" | "FUNDRAISER";
    ticket_price: number;
    registration_deadline?: string;
    region?: string;
}

export interface EmailRecipient {
    email: string;
    name?: string;
}

export interface EmailList {
    id: number;
    event_id: number;
    name: string;
    recipients: EmailRecipient[];
    subject: string;
    body: string;
    status: "DRAFT" | "SENT" | "FAILED";
    sent_at?: string;
    created_at: string;
}

export interface EmailListCreate {
    name: string;
    recipients: EmailRecipient[];
    subject: string;
    body: string;
}


export interface EventCreate {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location: string;
    capacity?: number;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
    event_type: "WORKSHOP" | "GALA" | "MEETING" | "FUNDRAISER";
    ticket_price: number;
    region?: string;
    scenario_type?: "IN_PERSON" | "VIRTUAL" | "HYBRID";
    is_public?: boolean;
    registration_deadline?: string;
}

export const eventService = {
    async getAll(skip = 0, limit = 100): Promise<Event[]> {
        return fetchJson<Event[]>(`/api/v1/events/?skip=${skip}&limit=${limit}`);
    },

    async create(event: EventCreate): Promise<Event> {
        // Requires authentication, token is handled by the browser or we might need to attach it in api.ts
        // For now, let's assume api.ts or the context handles auth, but looking at api.ts it doesn't automatically attach token.
        // We need to update api.ts to attach token if it exists.

        // Actually, looking at previous steps, api.ts is simple fetch. 
        // I should update api.ts to include Authorization header if token exists in localStorage.

        // For this step I will just write the service calling fetchJson.
        // I I will update api.ts in a separate step to ensure security.
        return fetchJson<Event>("/api/v1/events/", {
            method: "POST",
            body: JSON.stringify(event),
        });
    },

    async getEmailLists(eventId: number): Promise<EmailList[]> {
        return fetchJson<EmailList[]>(`/api/v1/events/${eventId}/email-lists`);
    },

    async createEmailList(eventId: number, emailList: EmailListCreate): Promise<EmailList> {
        return fetchJson<EmailList>(`/api/v1/events/${eventId}/email-lists`, {
            method: "POST",
            body: JSON.stringify(emailList),
        });
    },

    async sendEmailList(eventId: number, listId: number): Promise<EmailList> {
        return fetchJson<EmailList>(`/api/v1/events/${eventId}/email-lists/${listId}/send`, {
            method: "POST",
        });
    },

    async cloneEvent(id: number): Promise<Event> {
        return fetchJson<Event>(`/api/v1/events/${id}/clone`, {
            method: "POST"
        });
    }
};
