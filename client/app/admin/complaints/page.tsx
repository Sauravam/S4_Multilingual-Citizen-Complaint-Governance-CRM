"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = "/api";

const STATUS_LABELS: Record<string, string> = {
    submitted: "Submitted", under_review: "Under Review",
    in_progress: "In Progress", resolved: "Resolved", rejected: "Rejected",
};
const STATUS_ICONS: Record<string, string> = {
    submitted: "📩", under_review: "🔍", in_progress: "🔧", resolved: "✅", rejected: "❌",
};

export default function AdminComplaintsPage() {
    const router = useRouter();
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState<any>(null);
    const [departments, setDepartments] = useState<any[]>([]);

    // Edit modal state
    const [editing, setEditing] = useState<any>(null);
    const [newStatus, setNewStatus] = useState("");
    const [newDept, setNewDept] = useState("");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const uStr = localStorage.getItem("govtech_user");
                if (!uStr) { router.push("/login"); return; }
                const u = JSON.parse(uStr);
                setUser(u);

                if (u.role !== "admin") {
                    router.push("/login");
                    return;
                }

                // Fetch complaints
                const res = await fetch(`${API}/complaints?limit=100`, { headers: { "X-User-Email": u.email } });
                if (!res.ok) throw new Error("Failed to load complaints");
                const data = await res.json();
                setComplaints(data.complaints || []);

                // Fetch departments
                const dRes = await fetch(`${API}/auth/departments`);
                if (dRes.ok) {
                    const dData = await dRes.json();
                    setDepartments(dData.departments || []);
                }
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Error loading data");
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, [router]);

    const handleSave = async () => {
        if (!editing || !user) return;
        setSaving(true);
        try {
            // Update Status if changed
            if (newStatus && newStatus !== editing.status) {
                const sRes = await fetch(`${API}/complaints/${editing.id}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "X-User-Email": user.email },
                    body: JSON.stringify({ status: newStatus, note: note || `Admin updated status to ${newStatus}`, officer_email: "ADMIN" })
                });
                if (!sRes.ok) { const err = await sRes.json(); throw new Error(err.detail); }
            }

            // Assign Dept if changed
            if (newDept && newDept !== editing.department) {
                const aRes = await fetch(`${API}/complaints/${editing.id}/assign`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "X-User-Email": user.email },
                    body: JSON.stringify({ department: newDept, officer_email: "ADMIN" })
                });
                if (!aRes.ok) { const err = await aRes.json(); throw new Error(err.detail); }
            }

            // Refresh list
            const res = await fetch(`${API}/complaints?limit=100`, { headers: { "X-User-Email": user.email } });
            const data = await res.json();
            setComplaints(data.complaints || []);
            setEditing(null);
        } catch (e: any) {
            alert(`Error updating: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to completely delete this complaint? This cannot be undone.")) return;
        setDeletingId(id);
        try {
            const res = await fetch(`${API}/complaints/${id}`, {
                method: "DELETE",
                headers: { "X-User-Email": user.email }
            });
            if (!res.ok) throw new Error("Failed to delete");
            setComplaints(prev => prev.filter(c => c.id !== id));
        } catch (e: any) {
            alert(e.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <main className="page-container">
            <div className="hero-bg" style={{ height: "250px" }} />
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>
                            📋 Manage All Complaints
                        </h1>
                        <p style={{ color: "var(--text-secondary)" }}>Master control panel — Edit statuses, assign departments, and manage records.</p>
                    </div>
                    <Link href="/admin/dashboard" className="btn-secondary" style={{ fontSize: "14px", textDecoration: "none" }}>
                        ← Back to Dashboard
                    </Link>
                </div>

                {error && <div className="alert-error" style={{ marginBottom: "20px" }}>{error}</div>}

                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
                ) : (
                    <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                            <thead style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)" }}>
                                <tr>
                                    <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-secondary)" }}>ID / Details</th>
                                    <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-secondary)" }}>Citizen</th>
                                    <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-secondary)" }}>Status & Dept</th>
                                    <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-secondary)", textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((c, i) => (
                                    <tr key={c.id} style={{ borderBottom: i === complaints.length - 1 ? "none" : "1px solid var(--border)", animation: `fadeInUp 0.3s ease-out ${i * 0.05}s both` }}>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                <Link href={`/track/${c.id}`} style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--accent-orange)", fontWeight: 700, textDecoration: "none" }}>{c.id}</Link>
                                                <span className={`badge badge-${c.severity}`} style={{ fontSize: "9px" }}>{c.severity}</span>
                                                {c.sla_breached && <span style={{ fontSize: "9px", background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "2px 6px", borderRadius: "10px", fontWeight: 700 }}>⚠️ SLA</span>}
                                            </div>
                                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.title}</div>
                                            {Array.isArray(c.media_urls) && c.media_urls.length > 0 && typeof c.media_urls[0] === "string" && (
                                                <div style={{ marginTop: "8px" }}>
                                                    <div style={{ borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border)", maxWidth: "120px", marginBottom: "4px" }}>
                                                        <img src={c.media_urls[0]} alt="Evidence" style={{ width: "100%", height: "auto", display: "block" }} />
                                                    </div>
                                                    <a href={c.media_urls[0]} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "var(--accent-orange)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                        🔗 Full size ↗
                                                    </a>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: "16px 20px", color: "var(--text-secondary)" }}>{c.citizen_email}</td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ marginBottom: "4px" }}><span className={`badge badge-${c.status}`} style={{ fontSize: "10px" }}>{STATUS_ICONS[c.status]} {STATUS_LABELS[c.status] || c.status}</span></div>
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>🏢 {c.department}</div>
                                        </td>
                                        <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                            <button onClick={() => { setEditing(c); setNewStatus(c.status); setNewDept(c.department); setNote(""); }}
                                                style={{ padding: "6px 12px", background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)", borderRadius: "6px", fontSize: "12px", cursor: "pointer", marginRight: "8px" }}>
                                                ✏️ Edit
                                            </button>
                                            <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                                                style={{ padding: "6px 12px", background: "rgba(239,68,68,0.05)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>
                                                {deletingId === c.id ? "..." : "🗑️"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Edit Modal */}
                {editing && (
                    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                        <div className="glass-card" style={{ width: "100%", maxWidth: "500px", background: "#0f1f3d", padding: "32px" }}>
                            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Edit Complaint</h2>
                            <p style={{ fontFamily: "monospace", color: "var(--accent-orange)", marginBottom: "24px" }}>{editing.id}</p>

                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>Status</label>
                                <select className="input-field" value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ width: "100%" }}>
                                    <option value="submitted">Submitted</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>Assign Department</label>
                                <select className="input-field" value={newDept} onChange={e => setNewDept(e.target.value)} style={{ width: "100%" }}>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>

                            <div style={{ marginBottom: "24px" }}>
                                <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>Admin Note (Optional)</label>
                                <textarea className="input-field" value={note} onChange={e => setNote(e.target.value)} placeholder="Reason for change..." style={{ width: "100%", minHeight: "80px", resize: "vertical" }} />
                            </div>

                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                                <button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
                                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
