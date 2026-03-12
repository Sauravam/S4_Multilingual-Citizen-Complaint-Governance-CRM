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
            if (data.user.role === "citizen") router.push("/citizen/dashboard");
            else if (data.user.role === "officer") router.push("/officer/dashboard");
            else if (data.user.role === "admin") router.push("/admin/analytics");
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

    return (
        <main className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <div style={{ width: "100%", maxWidth: "420px", padding: "0 24px" }}>
                <div className="glass-card" style={{ padding: "40px" }}>
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏛️</div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
                            Welcome Back
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                            Login to GovTech CRM
                        </p>
                    </div>

                    {/* Quick login buttons */}
                    <div style={{ marginBottom: "24px" }}>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px", textAlign: "center" }}>Quick Demo Login:</p>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {["citizen", "officer", "admin"].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => quickLogin(role)}
                                    style={{
                                        flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid var(--border)",
                                        background: "rgba(255,255,255,0.03)", color: "var(--text-secondary)",
                                        cursor: "pointer", fontSize: "11px", fontWeight: 600, textTransform: "capitalize",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent-orange)")}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                                >
                                    {role === "citizen" ? "👤" : role === "officer" ? "🏢" : "🔧"} {role}
                                </button>
                            ))}
                        </div>
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
                        {error && <div className="alert-error" style={{ marginBottom: "16px" }}>⚠️ {error}</div>}
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "14px" }}>
                            {loading ? "Logging in..." : "Login →"}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        New citizen?{" "}
                        <Link href="/register" style={{ color: "var(--accent-orange)", textDecoration: "none", fontWeight: 600 }}>
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
