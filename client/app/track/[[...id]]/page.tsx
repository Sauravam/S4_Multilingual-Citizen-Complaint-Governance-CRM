"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const API = "/api";

const STATUS_STEPS = ["submitted", "under_review", "in_progress", "resolved"];
const STATUS_LABELS: Record<string, string> = {
    submitted: "Submitted", under_review: "Under Review",
    in_progress: "In Progress", resolved: "Resolved", rejected: "Rejected",
};
const STATUS_ICONS: Record<string, string> = {
    submitted: "📩", under_review: "🔍", in_progress: "🔧", resolved: "✅", rejected: "❌",
};
const STATUS_COLORS: Record<string, string> = {
    submitted: "#64748b", under_review: "#3b82f6", in_progress: "#fbbf24", resolved: "#4ade80", rejected: "#ef4444",
};

type HistoryItem = { status: string; note: string; timestamp: string; officer?: string };

function daysSince(isoString: string): number {
    try {
        const d = new Date(isoString);
        return Math.floor((Date.now() - d.getTime()) / 86400000);
    } catch { return 0; }
}

export default function TrackComplaintPage() {
    const { id } = useParams();
    const [complaint, setComplaint] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchId, setSearchId] = useState(typeof id === "string" ? id : "");
    const [activeId, setActiveId] = useState(typeof id === "string" ? id : "");

    const fetchComplaint = async (cid: string) => {
        if (!cid) return;
        setLoading(true); setError("");
        try {
            const uStr = localStorage.getItem("govtech_user");
            const u = uStr ? JSON.parse(uStr) : null;
            const hdrs = u?.email ? { "X-User-Email": u.email } : {};
            const res = await fetch(`${API}/complaints/${cid}`, { headers: hdrs });
            if (!res.ok) throw new Error("Complaint not found");
            const data = await res.json();
            setComplaint(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Not found");
            setComplaint(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (activeId) fetchComplaint(activeId); else setLoading(false); }, [activeId]);

    const currentStepIndex = complaint ? STATUS_STEPS.indexOf(complaint.status as string) : -1;
    const history = (complaint?.history as HistoryItem[]) || [];
    const officerUpdates = history.filter(h => h.status !== "submitted" && h.note);
    const ageInDays = complaint ? daysSince(complaint.submitted_at as string) : 0;
    const isSLABreached = complaint && !["resolved", "rejected"].includes(complaint.status as string) && ageInDays >= 7;

    const TOOLTIP_STYLE = {
        backgroundColor: "#0f1f3d", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "10px", color: "#f1f5f9", fontSize: "13px",
    };

    return (
        <main className="page-container">
            <div className="hero-bg" style={{ height: "250px" }} />
            <div style={{ maxWidth: "780px", margin: "0 auto", padding: "40px 24px", position: "relative" }}>
                <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "28px", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.02em" }}>
                    🔍 Track Your Complaint
                </h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
                    Enter your Complaint ID to see real-time status and officer review notes.
                </p>

                {/* Search */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                    <input
                        className="input-field"
                        placeholder="Enter Complaint ID (e.g. GOV-2026-00001)"
                        value={searchId}
                        onChange={e => setSearchId(e.target.value.toUpperCase())}
                        onKeyDown={e => { if (e.key === "Enter") { setActiveId(searchId); fetchComplaint(searchId); } }}
                        style={{ flex: 1, fontFamily: "monospace", letterSpacing: "1px" }}
                    />
                    <button className="btn-primary" onClick={() => { setActiveId(searchId); fetchComplaint(searchId); }}>
                        Track →
                    </button>
                </div>

                <div style={{ marginBottom: "32px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Try:</span>
                    {["GOV-2026-00001", "GOV-2026-00002"].map(did => (
                        <button key={did} onClick={() => { setSearchId(did); setActiveId(did); }}
                            style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--accent-orange)", cursor: "pointer", fontFamily: "monospace" }}>
                            {did}
                        </button>
                    ))}
                    <Link href="/user/dashboard" style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "auto", textDecoration: "none" }}>
                        View all my complaints →
                    </Link>
                </div>

                {loading && activeId && (
                    <div style={{ textAlign: "center", padding: "60px" }}>
                        <div className="spinner" style={{ margin: "0 auto" }} />
                    </div>
                )}

                {error && <div className="alert-error">⚠️ {error} — Check the ID and try again.</div>}

                {complaint && !loading && (
                    <div style={{ animation: "fadeInUp 0.4s ease-out" }}>
                        {/* SLA Breach Banner */}
                        {isSLABreached && (
                            <div style={{
                                padding: "14px 20px", borderRadius: "12px", marginBottom: "16px",
                                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
                                display: "flex", alignItems: "center", gap: "12px",
                            }}>
                                <span style={{ fontSize: "22px" }}>🚨</span>
                                <div>
                                    <div style={{ fontWeight: 700, color: "#ef4444", fontSize: "14px" }}>SLA Deadline Exceeded</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                        This complaint has been open for <strong style={{ color: "#ef4444" }}>{ageInDays} days</strong> — the 7-day resolution SLA is breached. It has been flagged for admin review.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status header */}
                        <div className="glass-card" style={{ padding: "28px", marginBottom: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                                <div>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Complaint ID</div>
                                    <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "20px", color: "var(--accent-orange)" }}>{complaint.id as string}</div>
                                </div>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    <span className={`badge badge-${complaint.status}`}>
                                        {STATUS_ICONS[complaint.status as string]} {STATUS_LABELS[complaint.status as string] || (complaint.status as string)}
                                    </span>
                                    <span className={`badge badge-${complaint.severity}`}>{complaint.severity as string}</span>
                                    {ageInDays > 0 && (
                                        <span style={{
                                            padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                                            background: isSLABreached ? "rgba(239,68,68,0.1)" : "rgba(100,116,139,0.1)",
                                            color: isSLABreached ? "#ef4444" : "#64748b",
                                        }}>
                                            {isSLABreached ? "⏰" : "📅"} {ageInDays}d old
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>{complaint.title as string}</h2>
                            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: 1.6 }}>
                                {complaint.description as string}
                            </p>

                            {(complaint.translated as boolean) && (
                                <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", fontSize: "12px", color: "#60a5fa", background: "rgba(59,130,246,0.1)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(59,130,246,0.2)", marginBottom: "16px" }}>
                                    🌐 Auto-translated from {complaint.original_language as string} by AI
                                </div>
                            )}

                            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "13px", color: "var(--text-secondary)" }}>
                                <span>📍 {complaint.location as string}</span>
                                <span>📂 {(complaint.category as string)?.toUpperCase()}</span>
                                <span>🏢 {complaint.department as string}</span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="glass-card" style={{ padding: "24px", marginBottom: "16px" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>📊 Resolution Progress</h3>
                            <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: "8px" }}>
                                <div style={{ position: "absolute", top: "14px", left: 0, right: 0, height: "3px", background: "var(--border)", zIndex: 0 }} />
                                <div style={{
                                    position: "absolute", top: "14px", left: 0,
                                    width: `${Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1) * 100}%`,
                                    height: "3px", background: "linear-gradient(90deg, #f97316, #fbbf24)", zIndex: 1,
                                    transition: "width 0.5s ease",
                                }} />
                                {STATUS_STEPS.map((s, i) => (
                                    <div key={s} style={{ textAlign: "center", zIndex: 2 }}>
                                        <div style={{
                                            width: "30px", height: "30px", borderRadius: "50%", margin: "0 auto 8px",
                                            background: i <= currentStepIndex ? "linear-gradient(135deg, #f97316, #ea580c)" : "var(--bg-card)",
                                            border: `2px solid ${i <= currentStepIndex ? "#f97316" : "var(--border)"}`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "12px",
                                        }}>
                                            {i < currentStepIndex ? "✓" : STATUS_ICONS[s]}
                                        </div>
                                        <div style={{ fontSize: "11px", color: i <= currentStepIndex ? "var(--accent-orange)" : "var(--text-muted)", fontWeight: 600 }}>
                                            {STATUS_LABELS[s]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Officer Review Notes — PROMINENT section */}
                        {officerUpdates.length > 0 && (
                            <div className="glass-card" style={{ padding: "24px", marginBottom: "16px", border: "1px solid rgba(96,165,250,0.2)" }}>
                                <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(96,165,250,0.12)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🏢</span>
                                    Officer Review Notes
                                    <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 600, color: "#60a5fa", background: "rgba(59,130,246,0.1)", padding: "3px 8px", borderRadius: "12px" }}>
                                        {officerUpdates.length} update{officerUpdates.length > 1 ? "s" : ""}
                                    </span>
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {officerUpdates.map((h, i) => (
                                        <div key={i} style={{
                                            padding: "14px 16px", borderRadius: "10px",
                                            background: "rgba(255,255,255,0.03)",
                                            border: `1px solid ${i === officerUpdates.length - 1 ? "rgba(96,165,250,0.25)" : "var(--border)"}`,
                                            borderLeft: `3px solid ${STATUS_COLORS[h.status] || "#64748b"}`,
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span style={{
                                                        fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px",
                                                        background: `${STATUS_COLORS[h.status]}20`,
                                                        color: STATUS_COLORS[h.status] || "#64748b",
                                                    }}>
                                                        {STATUS_ICONS[h.status]} {STATUS_LABELS[h.status] || h.status}
                                                    </span>
                                                    {h.officer && (
                                                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>by {h.officer}</span>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                                    {new Date(h.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>{h.note}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Full Activity Timeline */}
                        <div className="glass-card" style={{ padding: "24px" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>📋 Activity Timeline</h3>
                            <div className="timeline">
                                {history.map((h, i) => (
                                    <div key={i} className="timeline-item">
                                        <div className={`timeline-dot ${i === history.length - 1 ? "active" : ""}`} />
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
                                                    {STATUS_ICONS[h.status]} {STATUS_LABELS[h.status] || h.status}
                                                </div>
                                                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{h.note}</div>
                                                {h.officer && <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>by {h.officer}</div>}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap", marginLeft: "16px" }}>
                                                {new Date(h.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Share link  */}
                        <div style={{ marginTop: "16px", display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button className="btn-secondary" style={{ fontSize: "13px" }}
                                onClick={() => { navigator.clipboard.writeText(window.location.href); }}>
                                🔗 Copy Tracking Link
                            </button>
                            <Link href="/submit" className="btn-primary" style={{ fontSize: "13px", textDecoration: "none" }}>
                                + Submit Another
                            </Link>
                        </div>
                    </div>
                )}

                {!activeId && !loading && (
                    <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
                        <div style={{ fontSize: "52px", marginBottom: "12px" }}>🔍</div>
                        <p style={{ fontSize: "15px", marginBottom: "8px" }}>Enter your Complaint ID above to track its status.</p>
                        <p style={{ fontSize: "13px" }}>You received this ID when you submitted your complaint.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
