import api from './api';

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
        const response = await api.get(`/events/${eventId}/tickets`);
        return response.data;
    },

    createTicketType: async (eventId: number, data: TicketTypeCreate): Promise<TicketType> => {
        const response = await api.post(`/events/${eventId}/tickets`, data);
        return response.data;
    },

    registerForEvent: async (eventId: number, ticketTypeId: number): Promise<EventRegistration> => {
        const response = await api.post(`/events/${eventId}/register`, {
            event_id: eventId,
            ticket_type_id: ticketTypeId
        });
        return response.data;
    },

    getMyRegistrations: async (): Promise<EventRegistration[]> => {
        const response = await api.get('/registrations/me');
        return response.data;
    }
};
