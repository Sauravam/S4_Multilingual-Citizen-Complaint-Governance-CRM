"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "/api";

export default function AdminDepartmentsPage() {
    const router = useRouter();
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let u: any = null;
        try {
            u = JSON.parse(localStorage.getItem("govtech_user") || "null");
        } catch {}
        const hdrs: Record<string, string> = u ? { "X-User-Email": u.email } : {};

        const load = async () => {
            try {
                const res = await fetch(`${API}/analytics/departments`, { headers: hdrs });
                const data = await res.json();
                setDepartments(data.departments || []);
            } catch (err) {
                console.error("Failed to fetch departments", err);
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
                            🏢 Department Management
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                            Manage civic departments and view their performance.
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
                                    <th>Total Complaints</th>
                                    <th>Resolved</th>
                                    <th>Avg Resolution Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map(d => (
                                    <tr key={d.department_id}>
                                        <td style={{ color: "var(--text-secondary)" }}>{d.department_id}</td>
                                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{d.department_name}</td>
                                        <td>{d.total}</td>
                                        <td style={{ color: "#4ade80" }}>{d.resolved}</td>
                                        <td>{d.avg_resolution_days} days</td>
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
