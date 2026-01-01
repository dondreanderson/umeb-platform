import { fetchJson } from '@/lib/api';

export interface EventSession {
    id: number;
    event_id: number;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    speaker_name?: string;
    created_at: string;
    updated_at: string;
}

export interface EventSessionCreate {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    speaker_name?: string;
    event_id: number;
}

export interface EventSessionUpdate {
    title?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    speaker_name?: string;
}

export const AgendaService = {
    getEventSessions: async (eventId: number): Promise<EventSession[]> => {
        return fetchJson<EventSession[]>(`/api/v1/events/${eventId}/sessions`);
    },

    createSession: async (eventId: number, data: EventSessionCreate): Promise<EventSession> => {
        return fetchJson<EventSession>(`/api/v1/events/${eventId}/sessions`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    updateSession: async (sessionId: number, data: EventSessionUpdate): Promise<EventSession> => {
        return fetchJson<EventSession>(`/api/v1/sessions/${sessionId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    deleteSession: async (sessionId: number): Promise<void> => {
        await fetchJson<void>(`/api/v1/sessions/${sessionId}`, {
            method: 'DELETE'
        });
    }
};
