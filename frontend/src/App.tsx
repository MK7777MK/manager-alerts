import { useEffect, useState, useCallback } from "react";
import { fetchAlerts, dismissAlert, fetchManagers } from "./api";
import AlertsTable from "./components/AlertsTable";
import type {
    AlertItem,
    Manager,
    Scope,
    SeverityFilter,
    StatusFilter
} from "./types";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

export default function App() {
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [scope, setScope] = useState<Scope>("direct");
    const [severity, setSeverity] = useState<SeverityFilter>("all");
    const [status, setStatus] = useState<StatusFilter>("all");
    const [loading, setLoading] = useState(false);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [managerId, setManagerId] = useState<string>("E2");

    const load = useCallback(async () => {
        setLoading(true);
        const params: Record<string, string> = { manager_id: managerId, scope };
        if (severity !== "all") {
            params["severity"] = severity;
        }
        if (status !== "all") {
            params["status"] = status;
        }
        try {
            const data = await fetchAlerts(params);
            setAlerts(data);
        } finally {
            setLoading(false);
        }
    }, [managerId, scope, severity, status]);

    useEffect(() => {
        // read filters from URL
        const sp = new URLSearchParams(window.location.search);
        const s = sp.get("scope");
        const sev = sp.get("severity");
        const st = sp.get("status");
        const m = sp.get("manager");

        if (s === "subtree") {
            setScope("subtree");
        }
        if (sev) {
            setSeverity(sev as SeverityFilter);
        }
        if (st) {
            setStatus(st as StatusFilter);
        }
        if (m) {
            setManagerId(m);
        }

        // fetch managers and sort numerically by their id (E1, E2, E3...)
        (async () => {
            try {
                const mgrs = await fetchManagers();
                const sorted = mgrs.slice().sort((a: Manager, b: Manager) => {
                    const an = parseInt(a.id.replace(/^[^0-9]+/, ""), 10) || 0;
                    const bn = parseInt(b.id.replace(/^[^0-9]+/, ""), 10) || 0;
                    return an - bn;
                });
                setManagers(sorted);
                if (!m) {
                    // default to E2 if present, else first
                    const hasE2 = sorted.find((x: Manager) => x.id === "E2");
                    setManagerId(hasE2 ? "E2" : (sorted[0]?.id ?? "E2"));
                }
            } catch (err) {
                console.error("Failed to load managers:", err);
            }
        })();
    }, []);

    useEffect(() => {
        // persist to URL
        const sp = new URLSearchParams(window.location.search);
        sp.set("scope", scope);
        if (severity !== "all") {
            sp.set("severity", severity);
        } else {
            sp.delete("severity");
        }
        if (status !== "all") {
            sp.set("status", status);
        } else {
            sp.delete("status");
        }
        sp.set("manager", managerId);
        const newUrl = `${window.location.pathname}?${sp.toString()}`;
        window.history.replaceState(null, "", newUrl);
        load();
    }, [scope, severity, status, managerId, load]);

    const onDismiss = async (id: string) => {
        // optimistic update
        const prev = alerts;
        setAlerts(s =>
            s.map(a => (a.id === id ? { ...a, status: "dismissed" } : a))
        );
        try {
            const updated = await dismissAlert(id);
            setAlerts(s => s.map(a => (a.id === updated.id ? updated : a)));
        } catch (err) {
            // rollback
            setAlerts(prev);
            alert("Failed to dismiss alert");
        }
    };

    const managerName =
        managers.find(m => m.id === managerId)?.name ?? managerId;

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
                Manager Alerts ({managerName})
            </Typography>

            <Box display="flex" gap={2} flexWrap="wrap" marginBottom={2}>
                <FormControl>
                    <InputLabel htmlFor="manager-native">Manager</InputLabel>
                    <Select
                        label="Manager"
                        native
                        value={managerId}
                        onChange={e => setManagerId(e.target.value as string)}
                        inputProps={{ name: "manager", id: "manager-native" }}
                    >
                        {managers.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.name} ({m.id})
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl>
                    <InputLabel htmlFor="scope-native">Scope</InputLabel>
                    <Select
                        label="Scope"
                        native
                        value={scope}
                        onChange={e => setScope(e.target.value as Scope)}
                        inputProps={{ name: "scope", id: "scope-native" }}
                    >
                        <option value="direct">direct</option>
                        <option value="subtree">subtree</option>
                    </Select>
                </FormControl>

                <FormControl>
                    <InputLabel htmlFor="severity-native">Severity</InputLabel>
                    <Select
                        label="Severity"
                        native
                        value={severity}
                        onChange={e =>
                            setSeverity(e.target.value as SeverityFilter)
                        }
                        inputProps={{ name: "severity", id: "severity-native" }}
                    >
                        <option value="all">All</option>
                        <option value="high">high</option>
                        <option value="medium">medium</option>
                        <option value="low">low</option>
                    </Select>
                </FormControl>

                <FormControl>
                    <InputLabel htmlFor="status-native">Status</InputLabel>
                    <Select
                        label="Status"
                        native
                        value={status}
                        onChange={e =>
                            setStatus(e.target.value as StatusFilter)
                        }
                        inputProps={{ name: "status", id: "status-native" }}
                    >
                        <option value="all">All</option>
                        <option value="open">open</option>
                        <option value="dismissed">dismissed</option>
                    </Select>
                </FormControl>
            </Box>

            <AlertsTable
                alerts={alerts}
                loading={loading}
                onDismiss={onDismiss}
            />
        </Container>
    );
}
