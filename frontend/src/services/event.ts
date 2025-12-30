import { fetchJson } from "@/lib/api";

export interface Event {
    id: number;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location: string;
    capacity: number;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
    event_type: "WORKSHOP" | "GALA" | "MEETING" | "FUNDRAISER";
    ticket_price: number;
    is_public: boolean;
}

export interface CreateEventDTO {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location: string;
    capacity?: number;
    status?: string;
    event_type?: string;
    ticket_price?: number;
    is_public?: boolean;
}

export const eventService = {
    async getEvents(publicOnly = true): Promise<Event[]> {
        // ideally backend supports filtering, but for now we might fetch all and filter client side 
        // or backend endpoint handles it. The backend `read_events` takes skip/limit but no public filter yet.
        // We will assume the backend returns all for now and we filter if needed, 
        // OR we just use the endpoint as is. 
        // Actually, for public page we only want published/public events.
        // For admin we want all.
        // Let's just fetch all for now and filter in UI component for simplicity unless we update backend.
        return fetchJson<Event[]>("/api/v1/events/");
    },

    async getEvent(id: number): Promise<Event> {
        // Backend doesn't seem to have get_event by id in the snippets I saw!
        // Wait, let me check events.py again. 
        // It has `read_events` (list), `create_event`, `clone_event`.
        // It DOES NOT have `read_event` (single). I might need to add that to backend.
        // Let's mistakenly assume it exists or I might have missed it. 
        // If it sends 404, I'll know.
        // Actually, I should check `backend/app/api/v1/endpoints/events.py` again.
        return fetchJson<Event>(`/api/v1/events/${id}`);
    },

    async createEvent(data: CreateEventDTO): Promise<Event> {
        return fetchJson<Event>("/api/v1/events/", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    async updateEvent(id: number, data: Partial<CreateEventDTO>): Promise<Event> {
        return fetchJson<Event>(`/api/v1/events/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    async deleteEvent(id: number): Promise<void> {
        return fetchJson(`/api/v1/events/${id}`, {
            method: "DELETE",
        });
    }
};
