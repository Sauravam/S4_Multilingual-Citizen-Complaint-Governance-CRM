"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "/api";

export default function AdminOfficersPage() {
    const router = useRouter();
    const [officers, setOfficers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let u: any = null;
        try {
            u = JSON.parse(localStorage.getItem("govtech_user") || "null");
        } catch {}
        const hdrs: Record<string, string> = u ? { "X-User-Email": u.email } : {};

        const load = async () => {
            try {
                const res = await fetch(`${API}/auth/users`, { headers: hdrs });
                const data = await res.json();
                setOfficers((data || []).filter((u: any) => u.role === "officer"));
            } catch (err) {
                console.error("Failed to fetch officers", err);
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
                            👮 Officer Roster
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                            Manage assigned government officers and personnel.
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
                                    <th>Role Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {officers.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ color: "var(--text-secondary)" }}>{u.id}</td>
                                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span style={{
                                                padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 600,
                                                background: "rgba(59,130,246,0.1)", color: "#3b82f6"
                                            }}>
                                                ACTIVE
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {officers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                                            No officers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
