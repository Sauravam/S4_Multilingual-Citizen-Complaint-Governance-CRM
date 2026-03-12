"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "/api";

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let u: any = null;
        try {
            u = JSON.parse(localStorage.getItem("govtech_user") || "null");
        } catch {}
        const hdrs: Record<string, string> = u ? { "X-User-Email": u.email } : {};

        const load = async () => {
            try {
                // In a real app we'd attach Authorization header
                const res = await fetch(`${API}/auth/users`, { headers: hdrs });
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
                <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "26px", fontWeight: 700, marginBottom: "4px" }}>
                            👥 User Management
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                            Manage citizens, officers, and administrators.
                        </p>
                    </div>
                    <button className="btn-primary" onClick={() => router.push("/admin/dashboard")}>
                        Back to Dashboard
                    </button>
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
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ color: "var(--text-secondary)" }}>{u.id}</td>
                                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span style={{
                                                padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 600,
                                                background: u.role === "admin" ? "rgba(239,68,68,0.1)" : u.role === "officer" ? "rgba(59,130,246,0.1)" : "rgba(34,197,94,0.1)",
                                                color: u.role === "admin" ? "#ef4444" : u.role === "officer" ? "#3b82f6" : "#22c55e"
                                            }}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
