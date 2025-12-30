import { fetchJson } from "@/lib/api";

export interface Candidate {
    id: number;
    election_id: number;
    name: string;
    bio?: string;
    photo_url?: string;
}

export interface Election {
    id: number;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    candidates: Candidate[];
}

export interface ElectionCreate {
    title: string;
    description: string;
    end_date: string;
    is_active?: boolean;
    position_id?: number | null;
}

export interface CandidateCreate {
    name: string;
    bio?: string;
    photo_url?: string;
}

export interface ElectionResults {
    election_id: number;
    title: string;
    results: {
        candidate_id: number;
        name: string;
        votes: number;
    }[];
}

export const electionService = {
    async getElections(): Promise<Election[]> {
        return fetchJson<Election[]>("/api/v1/elections/");
    },

    async createElection(election: ElectionCreate): Promise<Election> {
        return fetchJson<Election>("/api/v1/elections/", {
            method: "POST",
            body: JSON.stringify(election),
        });
    },

    async addCandidate(electionId: number, candidate: CandidateCreate): Promise<Candidate> {
        return fetchJson<Candidate>(`/api/v1/elections/${electionId}/candidates`, {
            method: "POST",
            body: JSON.stringify(candidate),
        });
    },

    async castVote(electionId: number, candidateId: number): Promise<any> {
        return fetchJson(`/api/v1/elections/${electionId}/vote`, {
            method: "POST",
            body: JSON.stringify({ candidate_id: candidateId }),
        });
    },

    async getResults(electionId: number): Promise<ElectionResults> {
        return fetchJson<ElectionResults>(`/api/v1/elections/${electionId}/results`);
    }
};
