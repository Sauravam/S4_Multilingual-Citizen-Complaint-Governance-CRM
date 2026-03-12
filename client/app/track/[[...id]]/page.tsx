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
            const res = await fetch(`${API}/complaints/${cid}`);
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

    const currentStepIndex = complaint
        ? STATUS_STEPS.indexOf(complaint.status as string)
        : -1;

    return (
        <main className="page-container">
            <div style={{ maxWidth: "780px", margin: "0 auto", padding: "40px 24px" }}>
                <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>
                    🔍 Track Your Complaint
                </h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
                    Enter your Complaint ID to see real-time status updates.
                </p>

                {/* Search */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
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

                {/* Demo IDs */}
                <div style={{ marginBottom: "24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Try: </span>
                    {["GOV-2026-00001", "GOV-2026-00002", "GOV-2026-00003"].map(did => (
                        <button key={did} onClick={() => { setSearchId(did); setActiveId(did); }}
                            style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--accent-orange)", cursor: "pointer", fontFamily: "monospace" }}>
                            {did}
                        </button>
                    ))}
                </div>

                {loading && activeId && (
                    <div style={{ textAlign: "center", padding: "60px" }}>
                        <div className="spinner" style={{ margin: "0 auto" }} />
                    </div>
                )}

                {error && <div className="alert-error">⚠️ {error} — Check the ID and try again.</div>}

                {complaint && !loading && (
                    <div>
                        {/* Status header */}
                        <div className="glass-card" style={{ padding: "28px", marginBottom: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                                <div>
                                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Complaint ID</div>
                                    <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "20px", color: "var(--accent-orange)" }}>{complaint.id as string}</div>
                                </div>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    <span className={`badge badge-${complaint.status}`}>
                                        {STATUS_ICONS[complaint.status as string]} {STATUS_LABELS[complaint.status as string] || (complaint.status as string)}
                                    </span>
                                    <span className={`badge badge-${complaint.severity}`}>{complaint.severity as string}</span>
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
                                <span>📂 {(complaint.category as string).toUpperCase()}</span>
                                <span>🏢 {complaint.department as string}</span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="glass-card" style={{ padding: "24px", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>Resolution Progress</h3>
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

                        {/* Timeline */}
                        <div className="glass-card" style={{ padding: "24px" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>Activity Timeline</h3>
                            <div className="timeline">
                                {(complaint.history as Array<{ status: string; note: string; timestamp: string; officer?: string }>).map((h, i) => (
                                    <div key={i} className="timeline-item">
                                        <div className={`timeline-dot ${i === (complaint.history as unknown[]).length - 1 ? "active" : ""}`} />
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
                    </div>
                )}

                {!activeId && !loading && (
                    <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
                        <p>Enter your Complaint ID above to track its status.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
