export interface Employee {
    id: string;
    name: string;
}

export interface Manager {
    id: string;
    name: string;
}

export interface AlertItem {
    id: string;
    employee: Employee;
    severity: "high" | "medium" | "low";
    category: string;
    created_at: string;
    status: "open" | "dismissed";
}

export type Scope = "direct" | "subtree";
export type SeverityFilter = "all" | AlertItem["severity"];
export type StatusFilter = "all" | AlertItem["status"];
