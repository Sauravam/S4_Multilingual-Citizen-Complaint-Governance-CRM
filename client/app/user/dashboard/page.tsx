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

export default function CitizenDashboard() {
    const router = useRouter();
    const [complaints, setComplaints] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
    const [activeTab, setActiveTab] = useState("all");
    const [searchId, setSearchId] = useState("");

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
                <div className="grid-4" style={{ marginBottom: "28px" }}>
                    {[
                        { label: "Total Filed", value: counts.all, icon: "📋", color: "#60a5fa" },
                        { label: "New / Pending", value: counts.submitted, icon: "📩", color: "#f97316" },
                        { label: "In Progress", value: counts.in_progress, icon: "🔧", color: "#fbbf24" },
                        { label: "Resolved", value: counts.resolved, icon: "✅", color: "#4ade80" },
                    ].map(s => (
                        <div key={s.label} className="stat-card" style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "24px", marginBottom: "4px" }}>{s.icon}</div>
                            <div style={{ fontSize: "32px", fontWeight: 800, color: s.color, fontFamily: "'Sora', sans-serif" }}>{s.value}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{s.label}</div>
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

                {/* Tab filters */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
                    {[
                        { key: "all", label: "All", count: counts.all },
                        { key: "submitted", label: "Pending", count: counts.submitted },
                        { key: "in_progress", label: "Active", count: counts.in_progress },
                        { key: "resolved", label: "Resolved", count: counts.resolved },
                    ].map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                            padding: "8px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                            border: `1px solid ${activeTab === t.key ? "var(--accent-orange)" : "var(--border)"}`,
                            background: activeTab === t.key ? "rgba(249,115,22,0.1)" : "transparent",
                            color: activeTab === t.key ? "var(--accent-orange)" : "var(--text-secondary)",
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
                        {filtered.map((c, i) => (
                            <Link key={c.id as string} href={`/track/${c.id}`} style={{ textDecoration: "none" }}>
                                <div className="glass-card" style={{
                                    padding: "20px 24px", cursor: "pointer",
                                    display: "grid", gridTemplateColumns: "1fr auto",
                                    alignItems: "center", gap: "16px",
                                    animation: `fadeInUp 0.4s ease-out ${i * 0.05}s both`,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(249,115,22,0.25)"; e.currentTarget.style.transform = "translateX(4px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateX(0)"; }}
                                >
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                            <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--accent-orange)", fontWeight: 700, background: "rgba(249,115,22,0.08)", padding: "2px 8px", borderRadius: "6px" }}>
                                                {c.id as string}
                                            </span>
                                            <span className={`badge badge-${c.severity}`} style={{ fontSize: "9px" }}>{c.severity as string}</span>
                                        </div>
                                        <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{c.title as string}</h3>
                                        <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
                                            <span>📍 {c.location as string}</span>
                                            {c.state && <span>🗺️ {c.state as string}</span>}
                                            <span>🏢 {c.department as string}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span className={`badge badge-${c.status}`} style={{ fontSize: "10px" }}>
                                            {STATUS_ICONS[c.status as string]} {STATUS_LABELS[c.status as string]}
                                        </span>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                                            {c.submitted_at ? new Date(c.submitted_at as string).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
