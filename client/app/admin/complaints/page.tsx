"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = "/api";

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Chandigarh", "Puducherry", "Jammu and Kashmir", "Ladakh",
];

const STATUS_LABELS: Record<string, string> = {
    submitted: "Submitted", under_review: "Under Review",
    in_progress: "In Progress", resolved: "Resolved", rejected: "Rejected",
};

export default function AdminComplaintsPage() {
    const router = useRouter();
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterState, setFilterState] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    useEffect(() => {
        let u: any = null;
        try {
            u = JSON.parse(localStorage.getItem("govtech_user") || "null");
            if (!u || u.role !== "admin") { router.push("/login"); return; }
        } catch { router.push("/login"); return; }

        const hdrs: Record<string, string> = { "X-User-Email": u.email };

        const load = async () => {
            try {
                const res = await fetch(`${API}/complaints`, { headers: hdrs });
                const data = await res.json();
                setComplaints(data.complaints || []);
            } catch (err) {
                console.error("Failed to fetch complaints", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = complaints.filter(c => {
        if (filterState && c.state !== filterState) return false;
        if (filterStatus && c.status !== filterStatus) return false;
        return true;
    });

    if (loading) {
        return (
            <main className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <div className="spinner" />
            </main>
        );
    }

    return (
        <main className="page-container">
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
                <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "26px", fontWeight: 700, marginBottom: "4px" }}>
                            📋 All Complaints (Read-Only)
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                            Admin monitoring view — {filtered.length} of {complaints.length} complaints shown
                        </p>
                    </div>
                    <button className="btn-primary" onClick={() => router.push("/admin/dashboard")}>
                        ← Dashboard
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <select className="input-field" value={filterState} onChange={e => setFilterState(e.target.value)}
                        style={{ maxWidth: "220px" }}>
                        <option value="">All States</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className="input-field" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        style={{ maxWidth: "180px" }}>
                        <option value="">All Statuses</option>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    {(filterState || filterStatus) && (
                        <button className="btn-secondary" onClick={() => { setFilterState(""); setFilterStatus(""); }}
                            style={{ fontSize: "13px" }}>
                            ✕ Clear Filters
                        </button>
                    )}
                </div>

                <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>State</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Severity</th>
                                    <th>Citizen</th>
                                    <th>Submitted</th>
                                    <th>View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(c => (
                                    <tr key={c.id}>
                                        <td style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--accent-orange)" }}>{c.id}</td>
                                        <td style={{ fontWeight: 600, color: "var(--text-primary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</td>
                                        <td style={{ fontSize: "12px" }}>{c.state || "—"}</td>
                                        <td style={{ fontSize: "12px" }}>{c.department}</td>
                                        <td>
                                            <span className={`badge badge-${c.status}`} style={{ fontSize: "10px" }}>
                                                {STATUS_LABELS[c.status] || c.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${c.severity}`} style={{ fontSize: "10px" }}>
                                                {c.severity}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{c.citizen_email}</td>
                                        <td style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                            {c.submitted_at ? new Date(c.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                                        </td>
                                        <td>
                                            <Link href={`/track/${c.id}`} style={{ color: "var(--accent-orange)", textDecoration: "none", fontSize: "12px", fontWeight: 600 }}>
                                                View →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                                            No complaints match your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Read-only notice */}
                <div style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                    🔒 Admin view is read-only. Only officers can update complaint statuses.
                </div>
            </div>
        </main>
    );
}
