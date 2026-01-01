import { fetchJson } from '@/lib/api';

export interface TicketType {
    id: number;
    event_id: number;
    name: string;
    description?: string;
    price: number;
    currency: string;
    quantity_available: number;
    quantity_sold: number;
    sale_start?: string;
    sale_end?: string;
    is_active: boolean;
}

export interface TicketTypeCreate {
    name: string;
    description?: string;
    price: number;
    quantity_available: number;
    event_id: number;
}

export interface EventRegistration {
    id: number;
    event_id: number;
    user_id: number;
    ticket_type_id: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
    payment_status: 'UNPAID' | 'PAID';
    payment_id?: string;
    check_in_status: boolean;
    qr_code_data?: string;
    created_at: string;
    event?: any; // Using any for simplicity or import Event interface
    ticket_type?: TicketType;
}

export const TicketService = {
    getEventTickets: async (eventId: number): Promise<TicketType[]> => {
        return fetchJson<TicketType[]>(`/api/v1/events/${eventId}/tickets`);
    },

    createTicketType: async (eventId: number, data: TicketTypeCreate): Promise<TicketType> => {
        return fetchJson<TicketType>(`/api/v1/events/${eventId}/tickets`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    registerForEvent: async (eventId: number, ticketTypeId: number): Promise<EventRegistration> => {
        return fetchJson<EventRegistration>(`/api/v1/events/${eventId}/register`, {
            method: 'POST',
            body: JSON.stringify({
                event_id: eventId,
                ticket_type_id: ticketTypeId
            })
        });
    },

    getMyRegistrations: async (): Promise<EventRegistration[]> => {
        return fetchJson<EventRegistration[]>('/api/v1/registrations/me');
    },

    getEventRegistrations: async (eventId: number): Promise<EventRegistration[]> => {
        return fetchJson<EventRegistration[]>(`/api/v1/events/${eventId}/registrations`);
    },

    checkInAttendee: async (regId: number): Promise<EventRegistration> => {
        return fetchJson<EventRegistration>(`/api/v1/registrations/${regId}/check-in`, {
            method: 'PUT'
        });
    },

    updateRegistrationStatus: async (regId: number, status: string): Promise<EventRegistration> => {
        return fetchJson<EventRegistration>(`/api/v1/registrations/${regId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
};
