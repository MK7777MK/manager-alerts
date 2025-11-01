import { AlertItem, Manager } from "./types";

const API_BASE = "http://127.0.0.1:8000/api";

export async function fetchAlerts(
    params: Record<string, string | undefined>
): Promise<AlertItem[]> {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            sp.set(key, value);
        }
    });

    const url = `${API_BASE}/alerts?${sp.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(
            `Failed to fetch alerts: ${res.status} ${res.statusText}`
        );
    }

    return res.json();
}

export async function dismissAlert(id: string): Promise<AlertItem> {
    const res = await fetch(`${API_BASE}/alerts/${id}/dismiss`, {
        method: "POST"
    });

    if (!res.ok) {
        throw new Error(
            `Failed to dismiss alert: ${res.status} ${res.statusText}`
        );
    }

    return res.json();
}

export async function fetchManagers(): Promise<Manager[]> {
    const res = await fetch(`${API_BASE}/managers`);

    if (!res.ok) {
        throw new Error(
            `Failed to fetch managers: ${res.status} ${res.statusText}`
        );
    }

    return res.json();
}
