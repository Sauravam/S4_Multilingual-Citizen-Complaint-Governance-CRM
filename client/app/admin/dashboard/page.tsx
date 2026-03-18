"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

const API = "/api";

const CATEGORY_COLORS: Record<string, string> = {
    roads: "#f97316", water: "#3b82f6", electricity: "#fbbf24",
    garbage: "#22c55e", health: "#a78bfa", safety: "#ef4444",
    land: "#06b6d4", other: "#94a3b8",
};

const STATUS_COLORS: Record<string, string> = {
    submitted: "#64748b", under_review: "#3b82f6",
    in_progress: "#fbbf24", resolved: "#22c55e", rejected: "#ef4444",
};

export default function AdminAnalyticsDashboard() {
    const router = useRouter();
    const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
    const [trends, setTrends] = useState<Record<string, unknown> | null>(null);
    const [departments, setDepartments] = useState<Record<string, unknown>[]>([]);
    const [langStats, setLangStats] = useState<Record<string, number>>({});
    const [slaBreaches, setSlaBreaches] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

    useEffect(() => {
        let u: any = null;
        try {
            u = JSON.parse(localStorage.getItem("govtech_user") || "null");
            if (!u || u.role !== "admin") { router.push("/login"); return; }
            setUser(u);
        } catch { router.push("/login"); return; }

        const hdrs = { "X-User-Email": u.email };

        const load = async () => {
            try {
                const [sumRes, trendRes, deptRes, langRes, slaRes] = await Promise.all([
                    fetch(`${API}/analytics/summary`, { headers: hdrs }),
                    fetch(`${API}/analytics/trends`, { headers: hdrs }),
                    fetch(`${API}/analytics/departments`, { headers: hdrs }),
                    fetch(`${API}/analytics/languages`, { headers: hdrs }),
                    fetch(`${API}/analytics/sla`, { headers: hdrs }),
                ]);
                const [sum, tr, dep, lang, sla] = await Promise.all([sumRes.json(), trendRes.json(), deptRes.json(), langRes.json(), slaRes.json()]);
                setSummary(sum);
                setTrends(tr);
                setDepartments(dep.departments || []);
                setLangStats(lang.by_language || {});
                setSlaBreaches(sla.sla_breaches || []);
            } finally { setLoading(false); }
        };
        load();
    }, []);

    if (!user || loading) {
        return (
            <main className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <div className="spinner" />
            </main>
        );
    }

    const categoryData = summary
        ? Object.entries(summary.by_category as Record<string, number>).map(([name, value]) => ({ name, value }))
        : [];

    const statusData = summary
        ? Object.entries(summary.by_status as Record<string, number>).map(([name, value]) => ({
            name: name.replace("_", " "), value, fill: STATUS_COLORS[name],
        }))
        : [];

    const severityData = summary
        ? Object.entries(summary.by_severity as Record<string, number>).map(([name, value]) => ({ name, value }))
        : [];

    const dailyTrends = (trends?.daily_trends as { date: string; count: number }[] || []).slice(-14);

    const langData = Object.entries(langStats).map(([code, count]) => {
        const names: Record<string, string> = { en: "English", hi: "Hindi", mr: "Marathi", bn: "Bengali", ta: "Tamil" };
        return { name: names[code] || code, value: count };
    });

    const CHART_TOOLTIP_STYLE = {
        backgroundColor: "#0f1f3d", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "10px", color: "#f1f5f9", fontSize: "13px",
    };

    return (
        <main className="page-container">
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
                <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "26px", fontWeight: 700, marginBottom: "4px" }}>
                            📊 Analytics Dashboard
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                            {user.name} · Real-time civic complaint intelligence
                        </p>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "flex-end" }}>
                        <Link href="/admin/users" className="btn-secondary" style={{ padding: "8px 16px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
                            👥 Users
                        </Link>
                        <Link href="/admin/officers" className="btn-secondary" style={{ padding: "8px 16px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
                            👮 Officers
                        </Link>
                        <Link href="/admin/departments" className="btn-secondary" style={{ padding: "8px 16px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
                            🏢 Depts
                        </Link>
                        <Link href="/admin/complaints" className="btn-primary" style={{ padding: "8px 16px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
                            📋 All Complaints
                        </Link>
                    </div>
                </div>

                {/* Top KPIs */}
                {summary && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "28px" }}>
                        {[
                            { label: "Total Complaints", value: summary.total as number, icon: "📋", color: "#60a5fa" },
                            { label: "Resolution Rate", value: `${summary.resolution_rate}%`, icon: "✅", color: "#4ade80" },
                            { label: "Avg Resolution", value: `${summary.avg_resolution_days}d`, icon: "⏱️", color: "#f97316" },
                            { label: "Active Issues", value: (summary.total as number) - ((summary.by_status as Record<string, number>).resolved || 0), icon: "🔥", color: "#fbbf24" },
                            { label: "⚠️ SLA Breached", value: summary.sla_breached as number, icon: "🚨", color: "#ef4444", urgent: true },
                        ].map((s: any) => (
                            <div key={s.label} className="stat-card" style={s.urgent && (s.value as number) > 0 ? { borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.05)" } : {}}>
                                <div style={{ fontSize: "26px", marginBottom: "4px" }}>{s.icon}</div>
                                <div style={{ fontSize: "30px", fontWeight: 800, color: s.color, fontFamily: "'Sora', sans-serif" }}>{s.value}</div>
                                <div style={{ fontSize: "12px", color: s.urgent && (s.value as number) > 0 ? "#ef4444" : "var(--text-secondary)", marginTop: "4px", fontWeight: s.urgent ? 600 : 400 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Trend Line + Category Bar */}
                <div className="grid-2" style={{ marginBottom: "24px" }}>
                    <div className="glass-card" style={{ padding: "24px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>📈 Complaints Over Last 14 Days</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={dailyTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }}
                                    tickFormatter={(v: string) => v.slice(5)} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                                <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2}
                                    dot={{ fill: "#f97316", r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="glass-card" style={{ padding: "24px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>📂 Complaints by Category</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={categoryData} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {categoryData.map((entry) => (
                                        <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#64748b"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Pie + Language Pie + Severity */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                    <div className="glass-card" style={{ padding: "24px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>🎯 By Status</h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                                    dataKey="value" nameKey="name" paddingAngle={3}>
                                    {statusData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                            {statusData.map(s => (
                                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--text-secondary)" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.fill }} />
                                    {s.name} ({s.value})
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: "24px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>🌍 Languages Used</h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={langData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                                    dataKey="value" nameKey="name" paddingAngle={3}>
                                    {langData.map((_, i) => (
                                        <Cell key={i} fill={["#f97316", "#3b82f6", "#22c55e", "#a78bfa", "#fbbf24"][i % 5]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                            {langData.map((l, i) => (
                                <div key={l.name} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--text-secondary)" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ["#f97316", "#3b82f6", "#22c55e", "#a78bfa", "#fbbf24"][i % 5] }} />
                                    {l.name} ({l.value})
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: "24px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>⚠️ By Severity</h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={severityData} layout="vertical" barSize={20}>
                                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} width={55} />
                                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {severityData.map(e => (
                                        <Cell key={e.name} fill={
                                            e.name === "critical" ? "#ef4444" :
                                                e.name === "high" ? "#f97316" :
                                                    e.name === "medium" ? "#fbbf24" : "#22c55e"
                                        } />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Department table */}
                <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 600 }}>🏢 Department Performance</h3>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Department</th>
                                    <th>Total</th>
                                    <th>Resolved</th>
                                    <th>Pending</th>
                                    <th>Resolution Rate</th>
                                    <th>Avg Days</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map(d => (
                                    <tr key={d.department_id as string}>
                                        <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>{d.department_name as string}</td>
                                        <td>{d.total as number}</td>
                                        <td style={{ color: "#4ade80" }}>{d.resolved as number}</td>
                                        <td style={{ color: "#fbbf24" }}>{d.pending as number}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div style={{ flex: 1, height: "6px", background: "var(--border)", borderRadius: "3px", maxWidth: "80px" }}>
                                                    <div style={{ height: "100%", borderRadius: "3px", background: "#22c55e", width: `${d.resolution_rate}%` }} />
                                                </div>
                                                <span style={{ fontSize: "12px", color: "#4ade80" }}>{d.resolution_rate as number}%</span>
                                            </div>
                                        </td>
                                        <td>{d.avg_resolution_days as number}d</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SLA Breach Table */}
                {slaBreaches.length > 0 && (
                    <div style={{ marginTop: "24px" }}>
                        <div className="glass-card" style={{ padding: "0", overflow: "hidden", border: "1px solid rgba(239,68,68,0.25)" }}>
                            <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ef4444", marginBottom: "2px" }}>🚨 SLA Breach Alert</h3>
                                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{slaBreaches.length} complaints unresolved for more than 7 days — immediate action required</p>
                                </div>
                                <span style={{ padding: "4px 12px", borderRadius: "20px", background: "rgba(239,68,68,0.15)", color: "#ef4444", fontSize: "12px", fontWeight: 700 }}>URGENT</span>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Complaint ID</th>
                                            <th>Title</th>
                                            <th>Department</th>
                                            <th>Status</th>
                                            <th>Days Overdue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {slaBreaches.map((b: any, i: number) => (
                                            <tr key={b.id} style={{ animation: `fadeInUp 0.3s ease-out ${i * 0.05}s both` }}>
                                                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--accent-orange)" }}>{b.id}</td>
                                                <td style={{ fontWeight: 600, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.title}</td>
                                                <td><span style={{ fontSize: "11px", fontWeight: 600, color: "#60a5fa", background: "rgba(59,130,246,0.1)", padding: "2px 8px", borderRadius: "6px" }}>{b.department || "—"}</span></td>
                                                <td><span style={{ fontSize: "11px", fontWeight: 600, color: "#fbbf24", background: "rgba(251,191,36,0.1)", padding: "2px 8px", borderRadius: "6px", textTransform: "capitalize" }}>{(b.status as string).replace("_", " ")}</span></td>
                                                <td><span style={{ color: "#ef4444", fontWeight: 700, fontSize: "13px" }}>+{b.days_overdue}d</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Insight */}
                <div style={{ marginTop: "20px", background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "16px", padding: "24px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px" }}>🤖 AI Governance Insights</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        <div>💡 <strong style={{ color: "var(--text-primary)" }}>Roads complaints</strong> peak on Mondays — schedule extra PWD resources.</div>
                        <div>📊 <strong style={{ color: "var(--text-primary)" }}>Fastest dept</strong> resolves 3x quicker — use as best practice model for others.</div>
                        <div>🌍 <strong style={{ color: "var(--text-primary)" }}>Multilingual AI</strong> auto-translates complaints — no language barrier for citizens.</div>
                        <div>⚡ <strong style={{ color: "var(--text-primary)" }}>SLA tracking</strong> flags overdue complaints so nothing slips through the cracks.</div>
                    </div>
                </div>
            </div>
        </main>
    );
}
