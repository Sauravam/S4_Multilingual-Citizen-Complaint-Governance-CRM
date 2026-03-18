"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = "/api";

const STATUS_LABELS: Record<string, string> = {
    submitted: "Submitted", under_review: "Under Review",
    in_progress: "In Progress", resolved: "Resolved", rejected: "Rejected",
};
const STATUS_ICONS: Record<string, string> = {
    submitted: "📩", under_review: "🔍", in_progress: "🔧", resolved: "✅", rejected: "❌",
};

function daysSince(iso: string): number {
    try { return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000); } catch { return 0; }
}

export default function CitizenDashboard() {
    const router = useRouter();
    const [complaints, setComplaints] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
    const [activeTab, setActiveTab] = useState("all");
    const [searchId, setSearchId] = useState("");
    const [escalating, setEscalating] = useState<string | null>(null);
    const [escalateMsg, setEscalateMsg] = useState("");

    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem("govtech_user") || "null");
            if (!u || u.role !== "citizen") { router.push("/login"); return; }
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

    const handleEscalate = async (complaintId: string) => {
        if (!user) return;
        setEscalating(complaintId);
        setEscalateMsg("");
        try {
            const res = await fetch(`${API}/complaints/${complaintId}/escalate`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-User-Email": user.email },
                body: JSON.stringify({ reason: "Delayed resolution — citizen escalation" }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Escalation failed");
            }
            setEscalateMsg("✅ Escalated to CRITICAL priority!");
            fetchComplaints(user.email); // refresh
        } catch (e: unknown) {
            setEscalateMsg(`❌ ${e instanceof Error ? e.message : "Failed"}`);
        } finally {
            setTimeout(() => { setEscalating(null); setEscalateMsg(""); }, 3000);
        }
    };

    const filtered = activeTab === "all"
        ? complaints
        : activeTab === "sla_breached"
            ? complaints.filter(c => c.sla_breached)
            : complaints.filter(c => c.status === activeTab);

    const counts = {
        all: complaints.length,
        submitted: complaints.filter(c => c.status === "submitted").length,
        in_progress: complaints.filter(c => c.status === "in_progress" || c.status === "under_review").length,
        resolved: complaints.filter(c => c.status === "resolved").length,
        sla_breached: complaints.filter(c => c.sla_breached).length,
    };

    if (!user) return null;

    return (
        <main className="page-container">
            <div className="hero-bg" style={{ height: "300px" }} />
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px", position: "relative" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <div style={{
                                width: "44px", height: "44px", borderRadius: "12px",
                                background: "linear-gradient(135deg, #4ade80, #22c55e)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "20px", boxShadow: "0 4px 15px rgba(34,197,94,0.3)",
                            }}>👤</div>
                            <div>
                                <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                                    Welcome, {user.name.split(" ")[0]}
                                </h1>
                                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>{user.email}</p>
                            </div>
                        </div>
                    </div>
                    <Link href="/submit" className="btn-primary" style={{ fontSize: "14px" }}>
                        📝 New Complaint
                    </Link>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", marginBottom: "28px" }}>
                    {[
                        { label: "Total Filed", value: counts.all, icon: "📋", color: "#60a5fa" },
                        { label: "Pending", value: counts.submitted, icon: "📩", color: "#f97316" },
                        { label: "In Progress", value: counts.in_progress, icon: "🔧", color: "#fbbf24" },
                        { label: "Resolved", value: counts.resolved, icon: "✅", color: "#4ade80" },
                        { label: "SLA Breached", value: counts.sla_breached, icon: "🚨", color: "#ef4444", urgent: true },
                    ].map((s: any) => (
                        <div key={s.label} className="stat-card" style={{
                            textAlign: "center",
                            ...(s.urgent && s.value > 0 ? { borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.04)" } : {}),
                        }}>
                            <div style={{ fontSize: "22px", marginBottom: "4px" }}>{s.icon}</div>
                            <div style={{ fontSize: "28px", fontWeight: 800, color: s.color, fontFamily: "'Sora', sans-serif" }}>{s.value}</div>
                            <div style={{ fontSize: "11px", color: s.urgent && s.value > 0 ? "#ef4444" : "var(--text-secondary)", fontWeight: s.urgent ? 600 : 400, marginTop: "4px" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Track by ID */}
                <div className="glass-card" style={{ padding: "16px 20px", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>🔍 Quick Track:</span>
                    <input
                        className="input-field" style={{ flex: 1, fontSize: "13px", fontFamily: "monospace" }}
                        placeholder="Enter Complaint ID (e.g. GOV-2026-XXXXXX)"
                        value={searchId} onChange={e => setSearchId(e.target.value.toUpperCase())}
                        onKeyDown={e => { if (e.key === "Enter" && searchId) router.push(`/track/${searchId}`); }}
                    />
                    <button className="btn-primary" style={{ padding: "10px 18px", fontSize: "13px" }}
                        onClick={() => { if (searchId) router.push(`/track/${searchId}`); }}>
                        Track →
                    </button>
                </div>

                {/* Escalation message */}
                {escalateMsg && (
                    <div className={escalateMsg.startsWith("✅") ? "alert-success" : "alert-error"} style={{ marginBottom: "16px", fontSize: "13px" }}>
                        {escalateMsg}
                    </div>
                )}

                {/* Tab filters */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
                    {[
                        { key: "all", label: "All", count: counts.all },
                        { key: "submitted", label: "Pending", count: counts.submitted },
                        { key: "in_progress", label: "Active", count: counts.in_progress },
                        { key: "resolved", label: "Resolved", count: counts.resolved },
                        { key: "sla_breached", label: "⏰ SLA Alert", count: counts.sla_breached },
                    ].map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                            padding: "8px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                            border: `1px solid ${activeTab === t.key ? (t.key === "sla_breached" ? "#ef4444" : "var(--accent-orange)") : "var(--border)"}`,
                            background: activeTab === t.key ? (t.key === "sla_breached" ? "rgba(239,68,68,0.1)" : "rgba(249,115,22,0.1)") : "transparent",
                            color: activeTab === t.key ? (t.key === "sla_breached" ? "#ef4444" : "var(--accent-orange)") : "var(--text-secondary)",
                            cursor: "pointer", transition: "all 0.2s",
                        }}>
                            {t.label} ({t.count})
                        </button>
                    ))}
                </div>

                {/* Complaints list */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px" }}>
                        <div className="spinner" style={{ margin: "0 auto" }} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="glass-card" style={{ padding: "60px", textAlign: "center" }}>
                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", marginBottom: "8px" }}>No complaints found</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
                            {activeTab === "all" ? "You haven't submitted any complaints yet." : "No complaints match this filter."}
                        </p>
                        <Link href="/submit" className="btn-primary">📝 Submit Your First Complaint</Link>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "12px" }}>
                        {filtered.map((c, i) => {
                            const age = daysSince(c.submitted_at as string);
                            const breached = c.sla_breached as boolean;
                            const canEscalate = !["resolved", "rejected"].includes(c.status as string) && age >= 3;
                            const latestNote = ((c.history as any[]) || []).filter((h: any) => h.officer && h.officer !== "SYSTEM").pop();

                            return (
                                <div key={c.id as string} className="glass-card" style={{
                                    padding: "20px 24px",
                                    animation: `fadeInUp 0.4s ease-out ${i * 0.05}s both`,
                                    borderLeft: breached ? "3px solid #ef4444" : "3px solid transparent",
                                }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "flex-start", gap: "16px" }}>
                                        <Link href={`/track/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                                                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--accent-orange)", fontWeight: 700, background: "rgba(249,115,22,0.08)", padding: "2px 8px", borderRadius: "6px" }}>
                                                        {c.id as string}
                                                    </span>
                                                    <span className={`badge badge-${c.severity}`} style={{ fontSize: "9px" }}>{c.severity as string}</span>
                                                    {breached && (
                                                        <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
                                                            ⏰ SLA BREACHED ({age}d)
                                                        </span>
                                                    )}
                                                    {!breached && age > 0 && (
                                                        <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>📅 {age}d ago</span>
                                                    )}
                                                </div>
                                                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{c.title as string}</h3>
                                                <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
                                                    <span>📍 {c.location as string}</span>
                                                    {c.state && <span>🗺️ {c.state as string}</span>}
                                                    <span>🏢 {c.department as string}</span>
                                                </div>

                                                {/* Latest officer note */}
                                                {latestNote && (
                                                    <div style={{
                                                        marginTop: "10px", padding: "8px 12px", borderRadius: "8px",
                                                        background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)",
                                                        fontSize: "12px", color: "var(--text-secondary)",
                                                    }}>
                                                        <span style={{ color: "#60a5fa", fontWeight: 600 }}>🏢 Officer: </span>
                                                        {latestNote.note}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                                            <span className={`badge badge-${c.status}`} style={{ fontSize: "10px" }}>
                                                {STATUS_ICONS[c.status as string]} {STATUS_LABELS[c.status as string]}
                                            </span>
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                                {c.submitted_at ? new Date(c.submitted_at as string).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                                            </div>
                                            {canEscalate && (
                                                <button
                                                    onClick={(e) => { e.preventDefault(); handleEscalate(c.id as string); }}
                                                    disabled={escalating === c.id}
                                                    style={{
                                                        padding: "4px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: 700,
                                                        border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)",
                                                        color: "#ef4444", cursor: "pointer", transition: "all 0.2s",
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                                                >
                                                    {escalating === c.id ? "..." : "⚡ Escalate"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
