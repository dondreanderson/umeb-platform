import { fetchJson } from "@/lib/api";

export interface EventGoal {
    id: number;
    event_id: number;
    metric_name: string;
    target_value: number;
    actual_value: number;
}

export interface EventBudget {
    id: number;
    event_id: number;
    category: string;
    planned_amount: number;
    actual_amount: number;
    forecast_amount: number;
}

export interface EventESG {
    id: number;
    event_id: number;
    metric: string;
    value: number;
    unit: string;
}

export interface StrategyDashboardStats {
    total_events: number;
    total_budget_planned: number;
    total_budget_actual: number;
    total_carbon_footprint: number;
}

export const strategyService = {
    async getGoals(eventId: number): Promise<EventGoal[]> {
        return fetchJson<EventGoal[]>(`/api/v1/strategy/${eventId}/goals`);
    },

    async createGoal(eventId: number, goal: Partial<EventGoal>): Promise<EventGoal> {
        return fetchJson<EventGoal>(`/api/v1/strategy/${eventId}/goals`, {
            method: "POST",
            body: JSON.stringify(goal)
        });
    },

    async getBudget(eventId: number): Promise<EventBudget[]> {
        return fetchJson<EventBudget[]>(`/api/v1/strategy/${eventId}/budget`);
    },

    async createBudgetItem(eventId: number, item: Partial<EventBudget>): Promise<EventBudget> {
        return fetchJson<EventBudget>(`/api/v1/strategy/${eventId}/budget`, {
            method: "POST",
            body: JSON.stringify(item)
        });
    },

    async getESG(eventId: number): Promise<EventESG[]> {
        return fetchJson<EventESG[]>(`/api/v1/strategy/${eventId}/esg`);
    },

    async createESGMetric(eventId: number, metric: Partial<EventESG>): Promise<EventESG> {
        return fetchJson<EventESG>(`/api/v1/strategy/${eventId}/esg`, {
            method: "POST",
            body: JSON.stringify(metric)
        });
    },

    async getDashboardStats(): Promise<StrategyDashboardStats> {
        return fetchJson<StrategyDashboardStats>(`/api/v1/strategy/dashboard/stats`);
    }
};
