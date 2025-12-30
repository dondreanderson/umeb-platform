import { fetchJson } from "@/lib/api";

export interface MembershipFee {
    id: number;
    name: string;
    amount: number;
    interval: "MONTHLY" | "YEARLY" | "ONE_TIME";
    description?: string;
    is_active: boolean;
}

export interface CreateFeeDTO {
    name: string;
    amount: number;
    interval: "MONTHLY" | "YEARLY" | "ONE_TIME";
    description?: string;
}

export interface Payment {
    id: number;
    user_id: number;
    fee_id: number;
    amount: number;
    status: "PENDING" | "PAID" | "FAILED";
    transaction_id?: string;
    payment_date?: string;
    created_at: string;
    fee?: MembershipFee;
}

export const feeService = {
    async getFees(): Promise<MembershipFee[]> {
        return fetchJson<MembershipFee[]>("/api/v1/fees/fees");
    },

    async createFee(data: CreateFeeDTO): Promise<MembershipFee> {
        return fetchJson<MembershipFee>("/api/v1/fees/fees", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    async makePayment(feeId: number): Promise<Payment> {
        return fetchJson<Payment>("/api/v1/fees/payments", {
            method: "POST",
            body: JSON.stringify({ fee_id: feeId }),
        });
    },

    async getMyPayments(): Promise<Payment[]> {
        return fetchJson<Payment[]>("/api/v1/fees/payments/me");
    },

    async getAllPayments(): Promise<Payment[]> {
        return fetchJson<Payment[]>("/api/v1/fees/payments");
    }
};
