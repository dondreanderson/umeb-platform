import { fetchJson } from "@/lib/api";

export interface Position {
    id: number;
    title: string;
    description?: string;
    term_length?: string;
    is_executive: boolean;
    current_holder_id?: number;
}

export const positionService = {
    async getPositions(): Promise<Position[]> {
        return fetchJson<Position[]>("/api/v1/positions/");
    },

    async createPosition(data: Partial<Position>): Promise<Position> {
        return fetchJson<Position>("/api/v1/positions/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    }
};
