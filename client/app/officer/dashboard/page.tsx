"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "/api";
const STATUS_LABELS: Record<string, string> = {
    submitted: "Submitted", under_review: "Under Review",
    in_progress: "In Progress", resolved: "Resolved", rejected: "Rejected",
};
const STATUS_ICONS: Record<string, string> = {
    submitted: "📩", under_review: "🔍", in_progress: "🔧", resolved: "✅", rejected: "❌",
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
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem("govtech_user") || "null");
            if (!u || u.role !== "officer") { router.push("/login"); return; }
            setUser(u);
            fetchComplaints(u.email);
        } catch { router.push("/login"); }
    }, []);

    const fetchComplaints = async (email: string) => {
        try {
            const res = await fetch(`${API}/complaints`, { headers: { "X-User-Email": email } });
            const data = await res.json();
            setComplaints(data.complaints || []);
        } finally { setLoading(false); }
    };

    const updateStatus = async () => {
        if (!selected || !newStatus || !user) return;
        setUpdating(true); setUpdateMsg("");
        try {
            const res = await fetch(`${API}/complaints/${selected.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "X-User-Email": user.email },
                body: JSON.stringify({ status: newStatus, note: statusNote, officer_email: user.email }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Update failed");
            }
            const updated = await res.json();
            setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
            setSelected(updated);
            setUpdateMsg("✅ Status updated successfully!");
            setStatusNote(""); setNewStatus("");
        } catch (e: unknown) { setUpdateMsg(`❌ ${e instanceof Error ? e.message : "Update failed"}`); }
        finally { setUpdating(false); }
    };

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === "submitted").length,
        active: complaints.filter(c => c.status === "in_progress" || c.status === "under_review").length,
        resolved: complaints.filter(c => c.status === "resolved").length,
    };

    const filteredList = filterStatus === "all" ? complaints : complaints.filter(c => c.status === filterStatus);

    if (!user) return null;

    return (
        <main className="page-container">
            <div className="hero-bg" style={{ height: "280px" }} />
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px", position: "relative" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{
                            width: "48px", height: "48px", borderRadius: "14px",
                            background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "22px", boxShadow: "0 4px 15px rgba(59,130,246,0.3)",
                        }}>🏢</div>
                        <div>
                            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                                Officer Dashboard
                            </h1>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "2px" }}>
                                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{user.name}</span>
                                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>•</span>
                                <span style={{
                                    fontSize: "11px", fontWeight: 700, color: "#60a5fa",
                                    background: "rgba(59,130,246,0.1)", padding: "2px 8px", borderRadius: "6px"
                                }}>{user.department} Dept</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid-4" style={{ marginBottom: "24px" }}>
                    {[
                        { label: "Total Assigned", value: stats.total, icon: "📋", color: "#60a5fa" },
                        { label: "New Pending", value: stats.pending, icon: "📩", color: "#fbbf24" },
                        { label: "Active Work", value: stats.active, icon: "🔧", color: "#f97316" },
                        { label: "Resolved", value: stats.resolved, icon: "✅", color: "#4ade80" },
                    ].map(s => (
                        <div key={s.label} className="stat-card" style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "22px", marginBottom: "4px" }}>{s.icon}</div>
                            <div style={{ fontSize: "28px", fontWeight: 800, color: s.color, fontFamily: "'Sora', sans-serif" }}>{s.value}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
                    {[
                        { key: "all", label: "All" },
                        { key: "submitted", label: "New" },
                        { key: "under_review", label: "Reviewing" },
                        { key: "in_progress", label: "In Progress" },
                        { key: "resolved", label: "Resolved" },
                    ].map(t => (
                        <button key={t.key} onClick={() => setFilterStatus(t.key)} style={{
                            padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                            border: `1px solid ${filterStatus === t.key ? "var(--accent-orange)" : "var(--border)"}`,
                            background: filterStatus === t.key ? "rgba(249,115,22,0.1)" : "transparent",
                            color: filterStatus === t.key ? "var(--accent-orange)" : "var(--text-secondary)",
                            cursor: "pointer", transition: "all 0.2s",
                        }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Split layout */}
                <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: "20px" }}>
                    {/* List */}
                    <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: 600, fontSize: "14px" }}>Complaint Queue</span>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{filteredList.length} items</span>
                        </div>
                        <div style={{ maxHeight: "580px", overflowY: "auto" }}>
                            {filteredList.map((c, i) => (
                                <div key={c.id as string} onClick={() => { setSelected(c); setNewStatus(c.status as string); setUpdateMsg(""); }}
                                    style={{
                                        padding: "14px 20px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                                        background: selected?.id === c.id ? "rgba(249,115,22,0.05)" : "transparent",
                                        borderLeft: selected?.id === c.id ? "3px solid var(--accent-orange)" : "3px solid transparent",
                                        transition: "all 0.15s",
                                        animation: `fadeInUp 0.3s ease-out ${i * 0.03}s both`,
                                    }}
                                    onMouseEnter={e => { if (selected?.id !== c.id) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                                    onMouseLeave={e => { if (selected?.id !== c.id) e.currentTarget.style.background = "transparent"; }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--accent-orange)", fontWeight: 700 }}>{c.id as string}</span>
                                        <div style={{ display: "flex", gap: "4px" }}>
                                            <span className={`badge badge-${c.status}`} style={{ fontSize: "9px" }}>
                                                {STATUS_ICONS[c.status as string]} {STATUS_LABELS[c.status as string]}
                                            </span>
                                            <span className={`badge badge-${c.severity}`} style={{ fontSize: "9px" }}>{c.severity as string}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "3px", color: "var(--text-primary)" }}>{c.title as string}</div>
                                    <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "var(--text-muted)" }}>
                                        <span>📍 {c.location as string}</span>
                                        <span>👤 {(c.citizen_email as string).split("@")[0]}</span>
                                    </div>
                                </div>
                            ))}
                            {filteredList.length === 0 && !loading && (
                                <div style={{ padding: "50px 20px", textAlign: "center" }}>
                                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
                                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No complaints match this filter.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail panel */}
                    {selected && (
                        <div className="glass-card" style={{ padding: "24px", animation: "slideInRight 0.3s ease-out" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <h3 style={{ fontSize: "15px", fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>📋 Details</h3>
                                <button onClick={() => setSelected(null)} style={{
                                    background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
                                    color: "var(--text-muted)", cursor: "pointer", width: "28px", height: "28px",
                                    borderRadius: "8px", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center",
                                }}>×</button>
                            </div>

                            <div style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--accent-orange)", marginBottom: "8px", fontWeight: 700 }}>{selected.id as string}</div>
                            <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px", lineHeight: 1.4 }}>{selected.title as string}</h4>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "16px" }}>{selected.description as string}</p>

                            {(selected.translated as boolean) && (
                                <div style={{ fontSize: "12px", color: "#60a5fa", background: "rgba(59,130,246,0.08)", padding: "8px 12px", borderRadius: "8px", marginBottom: "16px" }}>
                                    🌐 Translated from {selected.original_language as string}
                                </div>
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
                                {[
                                    ["Category", (selected.category as string)?.toUpperCase()],
                                    ["Severity", selected.severity as string],
                                    ["Status", STATUS_LABELS[selected.status as string]],
                                    ["Location", selected.location as string],
                                ].map(([k, v]) => (
                                    <div key={k} style={{ padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                                        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{k}</div>
                                        <div style={{ fontSize: "13px", fontWeight: 600, textTransform: "capitalize" }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Evidence Link */}
                            {Array.isArray(selected.media_urls) && selected.media_urls.length > 0 && typeof selected.media_urls[0] === "string" && (
                                <div style={{ marginBottom: "20px" }}>
                                    <a href={selected.media_urls[0]} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "var(--accent-orange)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(249,115,22,0.1)", padding: "6px 12px", borderRadius: "6px" }}>
                                        📎 View Uploaded Evidence
                                    </a>
                                </div>
                            )}

                            {/* Update form */}
                            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "18px" }}>
                                <h4 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "12px", fontFamily: "'Sora', sans-serif" }}>✏️ Update Status</h4>
                                <div className="form-group" style={{ marginBottom: "12px" }}>
                                    <select className="input-field" value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ fontSize: "13px" }}>
                                        <option value="submitted">📩 Submitted</option>
                                        <option value="under_review">🔍 Under Review</option>
                                        <option value="in_progress">🔧 In Progress</option>
                                        <option value="resolved">✅ Resolved</option>
                                        <option value="rejected">❌ Rejected</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: "12px" }}>
                                    <textarea className="input-field" rows={3} placeholder="Add note for citizen..."
                                        value={statusNote} onChange={e => setStatusNote(e.target.value)} style={{ resize: "none", fontSize: "13px" }} />
                                </div>
                                {updateMsg && <div className={updateMsg.startsWith("✅") ? "alert-success" : "alert-error"} style={{ marginBottom: "12px", fontSize: "13px" }}>{updateMsg}</div>}
                                <button className="btn-primary" onClick={updateStatus} disabled={updating} style={{ width: "100%", justifyContent: "center", fontSize: "13px" }}>
                                    {updating ? "Updating..." : "Update Status →"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
