import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Chip, { ChipProps } from "@mui/material/Chip";

export default function AlertsTable({
    alerts,
    loading,
    onDismiss
}: {
    alerts: import("../types").AlertItem[];
    loading: boolean;
    onDismiss: (id: string) => void;
}) {
    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: 16
                }}
            >
                <CircularProgress />
            </div>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {alerts.length > 0 ? (
                        alerts.map(a => {
                            let color: ChipProps["color"] = "default";

                            if (a.severity === "high") {
                                color = "error";
                            } else if (a.severity === "medium") {
                                color = "warning";
                            }

                            return (
                                <TableRow key={a.id}>
                                    <TableCell>{a.employee.name}</TableCell>
                                    <TableCell>{a.category}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={a.severity}
                                            color={color}
                                        />
                                    </TableCell>
                                    <TableCell>{a.status}</TableCell>
                                    <TableCell>
                                        {new Date(
                                            a.created_at
                                        ).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {a.status !== "dismissed" && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => onDismiss(a.id)}
                                            >
                                                Dismiss
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                No alerts found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
