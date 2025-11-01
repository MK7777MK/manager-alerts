import { beforeEach, test, expect, vi } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import App from "../App";
import type { AlertItem } from "../types";

const SAMPLE_DATA: AlertItem[] = [
    {
        id: "A1",
        employee: { id: "E3", name: "Jordan" },
        severity: "high",
        category: "retention",
        created_at: "2025-09-01T09:00:00Z",
        status: "open"
    },
    {
        id: "A2",
        employee: { id: "E4", name: "Casey" },
        severity: "medium",
        category: "engagement",
        created_at: "2025-09-02T09:00:00Z",
        status: "open"
    }
];

beforeEach(() => {
    const mockFetch = vi.fn().mockImplementation(async (input: RequestInfo) => {
        const url = input.toString();
        // dismiss endpoint returns a single updated item
        if (url.includes("/dismiss")) {
            return { ok: true, json: async () => SAMPLE_DATA[0] };
        }

        // If the backend is queried with a severity param, simulate filtering
        try {
            const u = new URL(url);
            const sev = u.searchParams.get("severity");
            if (sev) {
                const filtered = SAMPLE_DATA.filter(a => a.severity === sev);
                return { ok: true, json: async () => filtered };
            }
        } catch (e) {
            // fall through to return full set
        }

        return { ok: true, json: async () => SAMPLE_DATA };
    });

    // TypeScript complains about the mock implementation but it works at runtime
    global.fetch = mockFetch;

    // Mock window.alert
    vi.stubGlobal("alert", vi.fn());
});

test("filters to high severity", async () => {
    const user = userEvent.setup();
    render(<App />);

    // wait for initial data load
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    // Use the native select API for reliability
    const select = (await screen.findByLabelText(
        /severity/i
    )) as HTMLSelectElement;
    await user.selectOptions(select, "high");

    // now expect only the high row
    await waitFor(() => expect(screen.getByText("Jordan")).toBeInTheDocument());
    expect(screen.queryByText("Casey")).not.toBeInTheDocument();
});

test("optimistic dismiss rollback on failure", async () => {
    const user = userEvent.setup();
    const mockAlert = vi.fn();

    // Override fetch to simulate failure on dismiss
    const mockFetch = vi
        .fn()
        .mockImplementation(async (input: RequestInfo | URL) => {
            const url = input.toString();
            if (url.includes("/dismiss")) {
                return { ok: false, json: async () => ({}) };
            }
            return { ok: true, json: async () => SAMPLE_DATA };
        });

    vi.stubGlobal("fetch", mockFetch);
    vi.stubGlobal("alert", mockAlert);

    await act(async () => {
        render(<App />);
    });

    // Wait for initial data load
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    // Find Jordan's row and click its dismiss button
    const row = screen.getByText("Jordan").closest("tr");
    const btn = within(row!).getByRole("button", { name: /dismiss/i });
    await user.click(btn);

    // Should show error state in that row after dismiss failure
    await waitFor(() => {
        expect(within(row!).getByText("open")).toBeInTheDocument();
    });
});

test("optimistic dismiss rollback on failure", async () => {
    const user = userEvent.setup();

    // Override fetch to simulate failure on dismiss
    const mockFetch = vi
        .fn()
        .mockImplementation(async (input: RequestInfo | URL) => {
            const url = input.toString();
            if (url.includes("/dismiss")) {
                return { ok: false, json: async () => ({}) };
            }
            return { ok: true, json: async () => SAMPLE_DATA };
        });

    vi.stubGlobal("fetch", mockFetch);

    // Mock window.alert
    const mockAlert = vi.fn();
    vi.stubGlobal("alert", mockAlert);

    render(<App />);

    // Wait for initial data load and elements to be ready
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    // Find Jordan's row and verify the initial state
    await waitFor(() => expect(screen.getByText("Jordan")).toBeInTheDocument());
    const row = screen.getByRole("row", { name: /Jordan/ });

    // Find and click the dismiss button
    const btn = within(row).getByRole("button", { name: /dismiss/i });
    await user.click(btn);

    // Wait for alert and verify rollback
    await waitFor(() =>
        expect(mockAlert).toHaveBeenCalledWith("Failed to dismiss alert")
    );
    expect(within(row).getByText("open")).toBeInTheDocument();
});
