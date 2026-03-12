"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = "/api";

const LANGUAGES = [
    { code: "en", name: "English" }, { code: "hi", name: "हिंदी (Hindi)" },
    { code: "bn", name: "বাংলা (Bengali)" }, { code: "te", name: "తెలుగు (Telugu)" },
    { code: "mr", name: "मराठी (Marathi)" }, { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "gu", name: "ગુજરાતી (Gujarati)" }, { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
    { code: "ml", name: "മലയാളം (Malayalam)" }, { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
];

const DEPARTMENTS = [
    { id: "PWD", name: "Public Works Department" },
    { id: "WATER", name: "Water & Sanitation Board" },
    { id: "ELEC", name: "Electricity Department" },
    { id: "ENV", name: "Environment & Waste Dept." },
    { id: "HEALTH", name: "Public Health Department" },
    { id: "POLICE", name: "Law & Order / Police" },
    { id: "REVENUE", name: "Revenue & Land Records" },
    { id: "GENERAL", name: "General Administration" },
];

const ROLES = [
    { key: "citizen", icon: "👤", name: "Citizen", desc: "Submit & track complaints", color: "#4ade80" },
    { key: "officer", icon: "🏢", name: "Officer", desc: "Validate & update complaints", color: "#60a5fa" },
    { key: "admin", icon: "⚙️", name: "Admin", desc: "Monitor all complaints", color: "#fbbf24" },
];

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "", email: "", password: "", phone: "",
        preferred_language: "en", role: "citizen", department: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        if (form.role === "officer" && !form.department) {
            setError("Officers must select a department.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Registration failed");
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
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", position: "relative" }}>
            <div className="hero-bg" />
            <div style={{ width: "100%", maxWidth: "500px", padding: "0 24px", position: "relative", zIndex: 1 }}>
                <div className="glass-card" style={{ padding: "40px 36px" }}>
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                        <div style={{
                            width: "60px", height: "60px", borderRadius: "16px",
                            background: "linear-gradient(135deg, #22c55e, #16a34a)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "26px", margin: "0 auto 16px",
                            boxShadow: "0 4px 20px rgba(34,197,94,0.3)",
                        }}>🌟</div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "24px", fontWeight: 700, marginBottom: "6px", letterSpacing: "-0.02em" }}>Create Account</h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Join GovTech CRM Portal</p>
                    </div>

                    {/* Role Selector */}
                    <div style={{ marginBottom: "24px" }}>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Select Your Role</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                            {ROLES.map(r => (
                                <button key={r.key} onClick={() => setForm(f => ({ ...f, role: r.key, department: "" }))}
                                    style={{
                                        padding: "14px 8px", borderRadius: "12px",
                                        border: `2px solid ${form.role === r.key ? r.color : "var(--border)"}`,
                                        background: form.role === r.key ? `${r.color}12` : "transparent",
                                        cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                                    }}>
                                    <div style={{ fontSize: "22px", marginBottom: "4px" }}>{r.icon}</div>
                                    <div style={{ fontSize: "13px", fontWeight: 700, color: form.role === r.key ? r.color : "var(--text-secondary)" }}>{r.name}</div>
                                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{r.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Department Selector — only for officers */}
                    {form.role === "officer" && (
                        <div className="form-group" style={{ animation: "fadeInUp 0.3s ease-out" }}>
                            <label className="form-label">🏢 Select Department <span style={{ color: "#ef4444" }}>*</span></label>
                            <select className="input-field" value={form.department}
                                onChange={e => setForm(f => ({ ...f, department: e.target.value }))} required>
                                <option value="">Choose your department...</option>
                                {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                                You will only see complaints assigned to this department.
                            </p>
                        </div>
                    )}

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>account details</span>
                        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                    </div>

                    <form onSubmit={handleRegister}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="input-field" placeholder="Ravi Kumar" value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input className="input-field" type="tel" placeholder="+91 9876543210" value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="input-field" type="email" placeholder="you@example.com" value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input className="input-field" type="password" placeholder="Min. 6 chars" value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={6} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Language</label>
                                <select className="input-field" value={form.preferred_language}
                                    onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value }))}>
                                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                                </select>
                            </div>
                        </div>
                        {error && <div className="alert-error" style={{ marginBottom: "16px", fontSize: "13px" }}>⚠️ {error}</div>}
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "15px" }}>
                            {loading ? "Creating Account..." : "Create Account →"}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        Already have an account?{" "}
                        <Link href="/login" style={{ color: "var(--accent-orange)", textDecoration: "none", fontWeight: 600 }}>Login →</Link>
                    </p>
                </div>

                <div style={{ textAlign: "center", marginTop: "16px", fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <span>🔒</span> Your data is encrypted and secure
                </div>
            </div>
        </main>
    );
}
