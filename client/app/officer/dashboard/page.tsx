"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "/api";
const DEPTS = ["PWD", "WATER", "ELEC", "ENV", "HEALTH", "POLICE", "REVENUE", "GENERAL"];
const STATUS_LABELS: Record<string, string> = {
    submitted: "Submitted", under_review: "Under Review",
    in_progress: "In Progress", resolved: "Resolved", rejected: "Rejected",
};

export default function OfficerDashboard() {
    const router = useRouter();
    const [complaints, setComplaints] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ name: string; email: string; role: string; department?: string } | null>(null);
    const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
    const [statusNote, setStatusNote] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [updating, setUpdating] = useState(false);
    const [updateMsg, setUpdateMsg] = useState("");

    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem("govtech_user") || "null");
            if (!u || u.role !== "officer") { router.push("/login"); return; }
            setUser(u);
            fetchComplaints(u.department);
        } catch { router.push("/login"); }
    }, []);

    const fetchComplaints = async (dept?: string) => {
        try {
            const url = dept ? `${API}/complaints?department=${dept}` : `${API}/complaints`;
            const res = await fetch(url);
            const data = await res.json();
            setComplaints(data.complaints || []);
        } finally { setLoading(false); }
    };

    const updateStatus = async () => {
        if (!selected || !newStatus) return;
        setUpdating(true); setUpdateMsg("");
        try {
            const res = await fetch(`${API}/complaints/${selected.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, note: statusNote, officer_email: user?.email }),
            });
            const updated = await res.json();
            setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
            setSelected(updated);
            setUpdateMsg("✅ Status updated successfully!");
            setStatusNote(""); setNewStatus("");
        } catch { setUpdateMsg("❌ Update failed"); }
        finally { setUpdating(false); }
    };

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === "submitted").length,
        inprogress: complaints.filter(c => c.status === "in_progress" || c.status === "under_review").length,
        resolved: complaints.filter(c => c.status === "resolved").length,
    };

    if (!user) return null;

    return (
        <main className="page-container">
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "26px", fontWeight: 700, marginBottom: "4px" }}>
                            🏢 Officer Dashboard
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{user.name} · {user.department} Department</p>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="grid-4" style={{ marginBottom: "28px" }}>
                    {[
                        { label: "Total Assigned", value: stats.total, color: "#60a5fa" },
                        { label: "New Pending", value: stats.pending, color: "#fbbf24" },
                        { label: "In Progress", value: stats.inprogress, color: "#f97316" },
                        { label: "Resolved", value: stats.resolved, color: "#4ade80" },
                    ].map(s => (
                        <div key={s.label} className="stat-card">
                            <div style={{ fontSize: "30px", fontWeight: 800, color: s.color, fontFamily: "'Sora', sans-serif" }}>{s.value}</div>
                            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: "20px" }}>
                    {/* Complaints list */}
                    <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: "15px" }}>
                            Complaint Queue {loading && "..."}
                        </div>
                        <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                            {complaints.map(c => (
                                <div key={c.id as string} onClick={() => { setSelected(c); setNewStatus(c.status as string); setUpdateMsg(""); }}
                                    style={{
                                        padding: "16px 20px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                                        background: selected?.id === c.id ? "rgba(249,115,22,0.06)" : "transparent",
                                        transition: "all 0.2s",
                                        borderLeft: selected?.id === c.id ? "3px solid var(--accent-orange)" : "3px solid transparent",
                                    }}
                                    onMouseEnter={e => { if (selected?.id !== c.id) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                                    onMouseLeave={e => { if (selected?.id !== c.id) e.currentTarget.style.background = "transparent"; }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--accent-orange)", fontWeight: 700 }}>{c.id as string}</span>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <span className={`badge badge-${c.status}`} style={{ fontSize: "10px" }}>{STATUS_LABELS[c.status as string] || (c.status as string)}</span>
                                            <span className={`badge badge-${c.severity}`} style={{ fontSize: "10px" }}>{c.severity as string}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>{c.title as string}</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>📍 {c.location as string}</div>
                                </div>
                            ))}
                            {complaints.length === 0 && !loading && (
                                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                                    No complaints assigned to your department.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail panel */}
                    {selected && (
                        <div className="glass-card" style={{ padding: "24px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Complaint Details</h3>
                                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "18px" }}>×</button>
                            </div>

                            <div style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--accent-orange)", marginBottom: "8px" }}>{selected.id as string}</div>
                            <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>{selected.title as string}</h4>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "16px" }}>{selected.description as string}</p>

                            {(selected.translated as boolean) && (
                                <div style={{ fontSize: "12px", color: "#60a5fa", background: "rgba(59,130,246,0.1)", padding: "8px 12px", borderRadius: "8px", marginBottom: "16px" }}>
                                    🌐 Auto-translated from {selected.original_language as string}
                                </div>
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px", fontSize: "13px" }}>
                                {[
                                    ["Category", (selected.category as string).toUpperCase()],
                                    ["Severity", selected.severity as string],
                                    ["Status", STATUS_LABELS[selected.status as string]],
                                    ["Location", selected.location as string],
                                ].map(([k, v]) => (
                                    <div key={k} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>{k}</div>
                                        <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{v}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Update Status */}
                            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                                <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Update Status</h4>
                                <div className="form-group">
                                    <select className="input-field" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                                        <option value="submitted">Submitted</option>
                                        <option value="under_review">Under Review</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <textarea className="input-field" rows={3} placeholder="Add a note for the citizen..."
                                        value={statusNote} onChange={e => setStatusNote(e.target.value)} style={{ resize: "none" }} />
                                </div>
                                {updateMsg && <div className={updateMsg.startsWith("✅") ? "alert-success" : "alert-error"} style={{ marginBottom: "12px" }}>{updateMsg}</div>}
                                <button className="btn-primary" onClick={updateStatus} disabled={updating} style={{ width: "100%", justifyContent: "center" }}>
                                    {updating ? "Updating..." : "Update Status"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
