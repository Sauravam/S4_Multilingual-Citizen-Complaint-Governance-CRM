"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = "/api";

const STATUS_LABELS: Record<string, string> = {
    submitted: "Submitted", under_review: "Under Review",
    in_progress: "In Progress", resolved: "Resolved", rejected: "Rejected",
};

export default function CitizenDashboard() {
    const router = useRouter();
    const [complaints, setComplaints] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
    const [activeTab, setActiveTab] = useState("all");

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
            const res = await fetch(`${API}/complaints?citizen_email=${encodeURIComponent(email)}`, {
                headers: { "X-User-Email": email }
            });
            const data = await res.json();
            setComplaints(data.complaints || []);
        } finally { setLoading(false); }
    };

    const filtered = activeTab === "all"
        ? complaints
        : complaints.filter(c => c.status === activeTab);

    const counts = {
        all: complaints.length,
        submitted: complaints.filter(c => c.status === "submitted").length,
        in_progress: complaints.filter(c => c.status === "in_progress" || c.status === "under_review").length,
        resolved: complaints.filter(c => c.status === "resolved").length,
    };

    if (!user) return null;

    return (
        <main className="page-container">
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "26px", fontWeight: 700, marginBottom: "4px" }}>
                            👋 Welcome, {user.name.split(" ")[0]}
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Track all your submitted civic complaints</p>
                    </div>
                    <Link href="/submit" className="btn-primary">+ Submit New Complaint</Link>
                </div>

                {/* Stats */}
                <div className="grid-4" style={{ marginBottom: "32px" }}>
                    {[
                        { label: "Total Filed", value: counts.all, icon: "📋", color: "#60a5fa" },
                        { label: "Pending", value: counts.submitted, icon: "📩", color: "#fbbf24" },
                        { label: "In Progress", value: counts.in_progress, icon: "🔧", color: "#f97316" },
                        { label: "Resolved", value: counts.resolved, icon: "✅", color: "#4ade80" },
                    ].map(s => (
                        <div key={s.label} className="stat-card">
                            <div style={{ fontSize: "28px", marginBottom: "4px" }}>{s.icon}</div>
                            <div style={{ fontSize: "28px", fontWeight: 800, color: s.color, fontFamily: "'Sora', sans-serif" }}>{s.value}</div>
                            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--bg-card)", padding: "4px", borderRadius: "12px", width: "fit-content" }}>
                    {[["all", "All"], ["submitted", "Pending"], ["in_progress", "In Progress"], ["resolved", "Resolved"]].map(([val, label]) => (
                        <button key={val} onClick={() => setActiveTab(val)}
                            style={{
                                padding: "8px 16px", borderRadius: "9px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                                background: activeTab === val ? "linear-gradient(135deg, #f97316, #ea580c)" : "transparent",
                                color: activeTab === val ? "white" : "var(--text-secondary)",
                                transition: "all 0.2s",
                            }}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Complaints list */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
                        <p>No complaints found. {activeTab === "all" && <Link href="/submit" style={{ color: "var(--accent-orange)" }}>Submit your first one →</Link>}</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {filtered.map(c => (
                            <div key={c.id as string} className="glass-card" style={{ padding: "20px", transition: "all 0.2s" }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(249,115,22,0.3)")}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap", alignItems: "center" }}>
                                            <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--accent-orange)", fontWeight: 700 }}>{c.id as string}</span>
                                            <span className={`badge badge-${c.status}`}>{STATUS_LABELS[c.status as string] || (c.status as string)}</span>
                                            <span className={`badge badge-${c.severity}`}>{c.severity as string}</span>
                                            {(c.translated as boolean) && <span style={{ fontSize: "11px", color: "#60a5fa", padding: "2px 8px", background: "rgba(59,130,246,0.1)", borderRadius: "8px", border: "1px solid rgba(59,130,246,0.2)" }}>🌐 Translated</span>}
                                        </div>
                                        <div style={{ fontWeight: 600, marginBottom: "4px" }}>{c.title as string}</div>
                                        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                            📍 {c.location as string} · 🏢 {c.department as string}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px", flexDirection: "column", alignItems: "flex-end" }}>
                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                            {new Date(c.submitted_at as string).toLocaleDateString("en-IN")}
                                        </div>
                                        <Link href={`/track/${c.id}`} className="btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}>
                                            Track →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
