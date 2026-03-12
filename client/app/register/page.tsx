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

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", preferred_language: "en" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
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
            router.push("/user/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <div style={{ width: "100%", maxWidth: "460px", padding: "0 24px" }}>
                <div className="glass-card" style={{ padding: "40px" }}>
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🌟</div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Create Account</h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Join GovTech CRM as a citizen</p>
                    </div>
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="input-field" placeholder="Ravi Kumar" value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="input-field" type="email" placeholder="you@example.com" value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input className="input-field" type="tel" placeholder="+91 9876543210" value={form.phone}
                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Preferred Language</label>
                            <select className="input-field" value={form.preferred_language}
                                onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value }))}>
                                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="input-field" type="password" placeholder="Min. 6 characters" value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={6} required />
                        </div>
                        {error && <div className="alert-error" style={{ marginBottom: "16px" }}>⚠️ {error}</div>}
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "14px" }}>
                            {loading ? "Creating Account..." : "Register & Continue →"}
                        </button>
                    </form>
                    <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        Already have an account?{" "}
                        <Link href="/login" style={{ color: "var(--accent-orange)", textDecoration: "none", fontWeight: 600 }}>Login</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
