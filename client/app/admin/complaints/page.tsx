"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = "/api";

export default function AdminComplaintsPage() {
    const router = useRouter();
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let u: any = null;
        try {
            u = JSON.parse(localStorage.getItem("govtech_user") || "null");
        } catch {}
        const hdrs: Record<string, string> = u ? { "X-User-Email": u.email } : {};

        const load = async () => {
            try {
                // In a real app we'd attach auth token headers here to properly authenticate
                const res = await fetch(`${API}/complaints`, { headers: hdrs });
                const data = await res.json();
                setComplaints(data.complaints || []);
            } catch (err) {
                console.error("Failed to fetch complaints", err);
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
                            📋 All Complaints
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                            Admin view of all citizen complaints.
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
                                    <th>Title</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Citizen</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map(c => (
                                    <tr key={c.id}>
                                        <td style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{c.id}</td>
                                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.title}</td>
                                        <td>{c.department}</td>
                                        <td>
                                            <span className={`status-badge status-${c.status}`}>
                                                {c.status.replace("_", " ").toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{c.citizen_email}</td>
                                        <td>
                                            <Link href={`/track/${c.id}`} style={{ color: "var(--accent-orange)", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
                                                View →
                                            </Link>
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
