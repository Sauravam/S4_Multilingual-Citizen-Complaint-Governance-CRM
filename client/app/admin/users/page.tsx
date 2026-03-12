"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = "/api";

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const uStr = localStorage.getItem("govtech_user");
                if (!uStr) { router.push("/login"); return; }
                const user = JSON.parse(uStr);

                if (user.role !== "admin") {
                    router.push("/login");
                    return;
                }

                const res = await fetch(`${API}/auth/users`, {
                    headers: { "X-User-Email": user.email }
                });

                if (!res.ok) throw new Error("Failed to load users");
                const data = await res.json();
                setUsers(data);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Error loading users");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [router]);

    return (
        <main className="page-container">
            <div className="hero-bg" style={{ height: "250px" }} />
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px", position: "relative" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>
                            👥 Users Directory
                        </h1>
                        <p style={{ color: "var(--text-secondary)" }}>Manage Citizens, Officers, and Admins across the platform.</p>
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
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
                            <thead style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)" }}>
                                <tr>
                                    <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-secondary)" }}>User</th>
                                    <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-secondary)" }}>Role</th>
                                    <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-secondary)" }}>Department</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, i) => (
                                    <tr key={u.id} style={{
                                        borderBottom: i === users.length - 1 ? "none" : "1px solid var(--border)",
                                        animation: `fadeInUp 0.3s ease-out ${i * 0.05}s both`,
                                    }}>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{u.email}</div>
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <span style={{
                                                padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                                                background: u.role === "admin" ? "rgba(251,191,36,0.1)" : u.role === "officer" ? "rgba(96,165,250,0.1)" : "rgba(74,222,128,0.1)",
                                                color: u.role === "admin" ? "#f59e0b" : u.role === "officer" ? "#3b82f6" : "#22c55e",
                                                textTransform: "uppercase"
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px 20px", color: "var(--text-secondary)" }}>
                                            {u.department ? <span style={{ fontFamily: "monospace", fontSize: "12px", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "6px" }}>{u.department}</span> : <span style={{ color: "var(--text-muted)" }}>-</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
