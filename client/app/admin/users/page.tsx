"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "/api";

const ROLE_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
    citizen: { bg: "rgba(34,197,94,0.1)", color: "#4ade80", icon: "👤" },
    officer: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", icon: "🏢" },
    admin: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", icon: "⚙️" },
};

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState("all");

    useEffect(() => {
        let u: any = null;
        try {
            u = JSON.parse(localStorage.getItem("govtech_user") || "null");
            if (!u || u.role !== "admin") { router.push("/login"); return; }
        } catch { router.push("/login"); return; }

        const load = async () => {
            try {
                const res = await fetch(`${API}/auth/users`, { headers: { "X-User-Email": u.email } });
                const data = await res.json();
                setUsers(data || []);
            } catch (err) {
                console.error("Failed to fetch users", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = filterRole === "all" ? users : users.filter(u => u.role === filterRole);
    const counts = {
        all: users.length,
        citizen: users.filter(u => u.role === "citizen").length,
        officer: users.filter(u => u.role === "officer").length,
        admin: users.filter(u => u.role === "admin").length,
    };

    if (loading) {
        return (
            <main className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <div className="spinner" />
            </main>
        );
    }

    return (
        <main className="page-container">
            <div className="hero-bg" style={{ height: "250px" }} />
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px", position: "relative" }}>
                <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "24px", fontWeight: 700, marginBottom: "4px", letterSpacing: "-0.02em" }}>
                            👥 User Management
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                            All registered citizens, officers, and administrators — {users.length} total
                        </p>
                    </div>
                    <button className="btn-secondary" onClick={() => router.push("/admin/dashboard")} style={{ fontSize: "13px" }}>
                        ← Dashboard
                    </button>
                </div>

                {/* Stats */}
                <div className="grid-4" style={{ marginBottom: "20px" }}>
                    {[
                        { label: "Total Users", value: counts.all, icon: "👥", color: "#f97316" },
                        { label: "Citizens", value: counts.citizen, icon: "👤", color: "#4ade80" },
                        { label: "Officers", value: counts.officer, icon: "🏢", color: "#60a5fa" },
                        { label: "Admins", value: counts.admin, icon: "⚙️", color: "#fbbf24" },
                    ].map(s => (
                        <div key={s.label} className="stat-card" style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "20px", marginBottom: "2px" }}>{s.icon}</div>
                            <div style={{ fontSize: "26px", fontWeight: 800, color: s.color, fontFamily: "'Sora', sans-serif" }}>{s.value}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                    {["all", "citizen", "officer", "admin"].map(r => (
                        <button key={r} onClick={() => setFilterRole(r)} style={{
                            padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                            border: `1px solid ${filterRole === r ? "var(--accent-orange)" : "var(--border)"}`,
                            background: filterRole === r ? "rgba(249,115,22,0.1)" : "transparent",
                            color: filterRole === r ? "var(--accent-orange)" : "var(--text-secondary)",
                            cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize",
                        }}>
                            {r === "all" ? `All (${counts.all})` : `${r} (${counts[r as keyof typeof counts]})`}
                        </button>
                    ))}
                </div>

                <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u, i) => {
                                    const s = ROLE_STYLES[u.role] || ROLE_STYLES.citizen;
                                    return (
                                        <tr key={u.id} style={{ animation: `fadeInUp 0.3s ease-out ${i * 0.03}s both` }}>
                                            <td style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-muted)" }}>{u.id}</td>
                                            <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</td>
                                            <td style={{ fontSize: "13px" }}>{u.email}</td>
                                            <td>
                                                <span style={{
                                                    padding: "4px 10px", borderRadius: "12px", fontSize: "10px", fontWeight: 700,
                                                    background: s.bg, color: s.color, display: "inline-flex", alignItems: "center", gap: "4px",
                                                }}>
                                                    {s.icon} {u.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                {u.department ? (
                                                    <span style={{
                                                        fontSize: "11px", fontWeight: 600, color: "#60a5fa",
                                                        background: "rgba(59,130,246,0.08)", padding: "3px 8px", borderRadius: "6px",
                                                    }}>{u.department}</span>
                                                ) : (
                                                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                    🔒 Admin read-only view. Officers are shown with their assigned department.
                </div>
            </div>
        </main>
    );
}
