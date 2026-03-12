"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = "/api";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Login failed");
            }
            const data = await res.json();

            localStorage.setItem("govtech_token", data.token);
            localStorage.setItem("govtech_user", JSON.stringify(data.user));
            document.cookie = `govtech_user_role=${data.user.role}; path=/; max-age=86400`;
            document.cookie = `govtech_user_email=${data.user.email}; path=/; max-age=86400`;

            if (data.user.role === "citizen") router.push("/user/dashboard");
            else if (data.user.role === "officer") router.push("/officer/dashboard");
            else if (data.user.role === "admin") router.push("/admin/dashboard");
            else router.push("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = (role: string) => {
        const creds: Record<string, { email: string; password: string }> = {
            citizen: { email: "citizen@gov.in", password: "citizen123" },
            officer: { email: "officer@gov.in", password: "officer123" },
            admin: { email: "admin@gov.in", password: "admin123" },
        };
        setEmail(creds[role].email);
        setPassword(creds[role].password);
    };

    const roles = [
        { key: "citizen", icon: "👤", label: "Citizen", desc: "Submit & track complaints", color: "#4ade80" },
        { key: "officer", icon: "🏢", label: "Officer", desc: "Validate & update status", color: "#60a5fa" },
        { key: "admin", icon: "⚙️", label: "Admin", desc: "Monitor all complaints", color: "#fbbf24" },
    ];

    return (
        <main className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", position: "relative" }}>
            <div className="hero-bg" />

            <div style={{ width: "100%", maxWidth: "440px", padding: "0 24px", position: "relative", zIndex: 1 }}>
                <div className="glass-card" style={{ padding: "44px 36px" }}>
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "36px" }}>
                        <div style={{
                            width: "64px", height: "64px", borderRadius: "16px",
                            background: "linear-gradient(135deg, #f97316, #ea580c)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "28px", margin: "0 auto 16px",
                            boxShadow: "0 4px 20px rgba(249,115,22,0.35)",
                        }}>🏛️</div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "26px", fontWeight: 700, marginBottom: "6px", letterSpacing: "-0.02em" }}>
                            Welcome Back
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                            Sign in to GovTech CRM Portal
                        </p>
                    </div>

                    {/* Quick login role cards */}
                    <div style={{ marginBottom: "28px" }}>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px", textAlign: "center", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Quick Demo Login</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                            {roles.map((r) => (
                                <button
                                    key={r.key}
                                    onClick={() => quickLogin(r.key)}
                                    style={{
                                        padding: "12px 8px", borderRadius: "12px",
                                        border: `1px solid ${r.color}20`,
                                        background: `${r.color}08`,
                                        cursor: "pointer", textAlign: "center",
                                        transition: "all 0.3s",
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = `${r.color}40`;
                                        e.currentTarget.style.background = `${r.color}12`;
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = `${r.color}20`;
                                        e.currentTarget.style.background = `${r.color}08`;
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <div style={{ fontSize: "20px", marginBottom: "4px" }}>{r.icon}</div>
                                    <div style={{ fontSize: "12px", fontWeight: 700, color: r.color }}>{r.label}</div>
                                    <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.3 }}>{r.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>or sign in</span>
                        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                className="input-field"
                                type="email" placeholder="you@example.com"
                                value={email} onChange={e => setEmail(e.target.value)} required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                className="input-field"
                                type="password" placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)} required
                            />
                        </div>
                        {error && <div className="alert-error" style={{ marginBottom: "16px", fontSize: "13px" }}>⚠️ {error}</div>}
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "15px" }}>
                            {loading ? (
                                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                                    Signing in...
                                </span>
                            ) : "Sign In →"}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        New citizen?{" "}
                        <Link href="/register" style={{ color: "var(--accent-orange)", textDecoration: "none", fontWeight: 600 }}>
                            Register here →
                        </Link>
                    </p>
                </div>

                {/* Security notice */}
                <div style={{ textAlign: "center", marginTop: "16px", fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <span>🔒</span> Secured with end-to-end encryption
                </div>
            </div>
        </main>
    );
}
