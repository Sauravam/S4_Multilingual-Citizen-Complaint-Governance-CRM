"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";

const API = "/api";

const LANGUAGES = [
    { code: "en", name: "English" }, { code: "hi", name: "हिंदी (Hindi)" },
    { code: "bn", name: "বাংলা (Bengali)" }, { code: "te", name: "తెలుగు (Telugu)" },
    { code: "mr", name: "मराठी (Marathi)" }, { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "gu", name: "ગુજરાતી (Gujarati)" }, { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
    { code: "ml", name: "മലയാളം (Malayalam)" }, { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
    { code: "ur", name: "اردو (Urdu)" }, { code: "fr", name: "Français (French)" },
    { code: "ar", name: "العربية (Arabic)" },
];

const CATEGORIES = [
    { value: "roads", label: "Roads & Transport", icon: "🛣️" },
    { value: "water", label: "Water & Sanitation", icon: "💧" },
    { value: "electricity", label: "Electricity", icon: "⚡" },
    { value: "garbage", label: "Garbage & Waste", icon: "🗑️" },
    { value: "health", label: "Public Health", icon: "🏥" },
    { value: "safety", label: "Safety & Crime", icon: "🚔" },
    { value: "land", label: "Land & Construction", icon: "🏗️" },
    { value: "other", label: "Other", icon: "📋" },
];

const STEPS = ["Language & Category", "Complaint Details", "Location", "Review & Submit"];

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Chandigarh", "Puducherry", "Jammu and Kashmir", "Ladakh",
];

interface FormData {
    language: string;
    category: string;
    title: string;
    description: string;
    location: string;
    state: string;
    citizen_email: string;
    image_base64: string | null;
}

export default function SubmitComplaintPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ id: string; department: string; severity: string; category: string } | null>(null);
    const [error, setError] = useState("");
    const [form, setForm] = useState<FormData>({
        language: "en",
        category: "",
        title: "",
        description: "",
        location: "",
        state: "",
        citizen_email: "",
        image_base64: null,
    });

    const user = typeof window !== "undefined"
        ? (() => { try { return JSON.parse(localStorage.getItem("govtech_user") || "null"); } catch { return null; } })()
        : null;

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            const payload = {
                ...form,
                citizen_email: user?.email,
            };
            const headers: Record<string, string> = { 
                "Content-Type": "application/json",
                "X-User-Email": user.email 
            };
            
            const res = await fetch(`${API}/complaints`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Submission failed. Please try again.");
            const data = await res.json();
            setResult({
                id: data.complaint.id,
                department: data.department_assigned,
                severity: data.complaint.severity,
                category: data.complaint.category,
            });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    const isStepValid = () => {
        if (step === 0) return form.language && form.category;
        if (step === 1) return form.title.length > 5 && form.description.length > 10;
        if (step === 2) return form.location.length > 3 && form.state.length > 0;
        return true;
    };

    // Success state
    if (result) {
        return (
            <main className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <div style={{ textAlign: "center", maxWidth: "500px", padding: "0 24px" }}>
                    <div className="glass-card" style={{ padding: "48px" }}>
                        <div style={{ fontSize: "64px", marginBottom: "16px" }}>✅</div>
                        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "26px", fontWeight: 700, marginBottom: "12px" }}>
                            Complaint Submitted!
                        </h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "28px" }}>
                            Your complaint has been registered and is being processed by AI.
                        </p>

                        <div style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "12px", padding: "20px", marginBottom: "24px", textAlign: "left" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Complaint ID</span>
                                <span style={{ fontWeight: 700, fontFamily: "monospace", color: "var(--accent-orange)", fontSize: "15px" }}>{result.id}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Assigned To</span>
                                <span style={{ fontWeight: 600, fontSize: "13px" }}>{result.department}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Category</span>
                                <span style={{ fontWeight: 600, fontSize: "13px", textTransform: "capitalize" }}>{result.category}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>AI Severity</span>
                                <span className={`badge badge-${result.severity}`}>{result.severity}</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                            <Link href={`/track/${result.id}`} className="btn-primary">
                                🔍 Track This Complaint
                            </Link>
                            <button onClick={() => { setResult(null); setStep(0); setForm({ language: "en", category: "", title: "", description: "", location: "", state: "", citizen_email: "", image_base64: "" }); }}
                                className="btn-secondary">
                                + Submit Another
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="page-container">
            <div style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 24px" }}>
                {/* Header */}
                <div style={{ marginBottom: "36px" }}>
                    <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>
                        {t("submit.title")}
                    </h1>
                    <p style={{ color: "var(--text-secondary)" }}>
                        {t("submit.subtitle")}
                    </p>
                </div>

                {/* Step indicator */}
                <div style={{ display: "flex", gap: "0", marginBottom: "36px" }}>
                    {STEPS.map((s, i) => (
                        <div key={s} style={{ flex: 1, position: "relative" }}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div style={{
                                    width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                                    background: i <= step ? "linear-gradient(135deg, #f97316, #ea580c)" : "var(--bg-card)",
                                    border: `2px solid ${i <= step ? "#f97316" : "var(--border)"}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "13px", fontWeight: 700, color: "white",
                                    zIndex: 1, position: "relative",
                                }}>
                                    {i < step ? "✓" : i + 1}
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div style={{ flex: 1, height: "2px", background: i < step ? "#f97316" : "var(--border)" }} />
                                )}
                            </div>
                            <div style={{ fontSize: "11px", color: i === step ? "var(--accent-orange)" : "var(--text-muted)", marginTop: "6px", fontWeight: 600 }}>
                                {t(`submit.step${i + 1}`)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Step content */}
                <div className="glass-card" style={{ padding: "32px" }}>
                    {/* Step 0: Language & Category */}
                    {step === 0 && (
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "24px" }}>Choose Language & Category</h2>
                            <div className="form-group">
                                <label className="form-label">🌍 Complaint Language</label>
                                <select className="input-field" value={form.language}
                                    onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
                                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                                </select>
                                {form.language !== "en" && (
                                    <div className="alert-info" style={{ marginTop: "10px", fontSize: "13px" }}>
                                        🤖 AI will auto-detect and translate your complaint to English for processing.
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">📂 Complaint Category</label>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                                    {CATEGORIES.map(cat => (
                                        <button key={cat.value} onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                                            style={{
                                                padding: "12px 16px", borderRadius: "10px", border: "1px solid",
                                                borderColor: form.category === cat.value ? "var(--accent-orange)" : "var(--border)",
                                                background: form.category === cat.value ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.02)",
                                                color: form.category === cat.value ? "var(--accent-orange)" : "var(--text-secondary)",
                                                cursor: "pointer", textAlign: "left", fontSize: "13px", fontWeight: 600,
                                                transition: "all 0.2s",
                                            }}>
                                            {cat.icon} {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Complaint Details */}
                    {step === 1 && (
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Describe Your Complaint</h2>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "24px" }}>
                                Write in <strong style={{ color: "var(--accent-orange)" }}>{LANGUAGES.find(l => l.code === form.language)?.name}</strong> — AI will translate automatically.
                            </p>
                            <div className="form-group">
                                <label className="form-label">Title / Subject</label>
                                <input className="input-field" placeholder="Brief title of the issue (e.g. Large pothole on MG Road)"
                                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Detailed Description</label>
                                <textarea className="input-field" rows={6}
                                    placeholder={form.language === "hi" ? "यहाँ अपनी समस्या विस्तार से लिखें..." : "Describe the issue in detail..."}
                                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    style={{ resize: "vertical", marginBottom: "16px" }} />
                            </div>

                            <div className="form-group" style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px", border: "1px dashed var(--border)" }}>
                                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                    <span>📸</span> Attach Photo Evidence <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Optional)</span>
                                </label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="input-field" 
                                    style={{ padding: "8px", fontSize: "13px", background: "rgba(0,0,0,0.2)", cursor: "pointer" }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setForm(f => ({ ...f, image_base64: reader.result as string }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }} 
                                />
                                {form.image_base64 && (
                                    <div style={{ marginTop: "12px", fontSize: "13px", color: "#4ade80", display: "flex", alignItems: "center", gap: "6px" }}>
                                        ✅ Image attached successfully
                                    </div>
                                )}
                            </div>

                            {!user && (
                                <div className="form-group">
                                    <label className="form-label">Your Email (for tracking updates)</label>
                                    <input className="input-field" type="email" placeholder="you@example.com"
                                        value={form.citizen_email} onChange={e => setForm(f => ({ ...f, citizen_email: e.target.value }))} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Location */}
                    {step === 2 && (
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "24px" }}>Where is the Issue?</h2>
                            <div className="form-group">
                                <label className="form-label">🗺️ State</label>
                                <select className="input-field" value={form.state}
                                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}>
                                    <option value="">Select your State</option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">📍 Location / Address</label>
                                <input className="input-field" placeholder="e.g. MG Road, near bus stop, Pune"
                                    value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                                    Be as specific as possible — include landmark, street name, and city.
                                </p>
                            </div>
                            <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "12px", padding: "16px", fontSize: "13px", color: "#60a5fa" }}>
                                💡 GPS auto-detection coming soon. For now, select your state and type your address above.
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "24px" }}>Review Your Complaint</h2>
                            {[
                                { label: "Language", value: LANGUAGES.find(l => l.code === form.language)?.name || form.language },
                                { label: "Category", value: CATEGORIES.find(c => c.value === form.category)?.label || form.category },
                                { label: "Title", value: form.title },
                                { label: "State", value: form.state },
                                { label: "Location", value: form.location },
                                { label: "Photo Evidence", value: form.image_base64 ? "📸 Attached (Will upload on submit)" : "None" },
                            ].map(item => (
                                <div key={item.label} style={{ display: "flex", gap: "16px", marginBottom: "14px", padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid var(--border)" }}>
                                    <div style={{ minWidth: "90px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>{item.label}</div>
                                    <div style={{ fontSize: "14px", color: "var(--text-primary)" }}>{item.value}</div>
                                </div>
                            ))}
                            <div style={{ padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid var(--border)", marginBottom: "14px" }}>
                                <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, marginBottom: "8px" }}>Description</div>
                                <div style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.6 }}>{form.description}</div>
                            </div>
                            <div className="alert-info" style={{ fontSize: "13px" }}>
                                🤖 AI will classify, translate (if needed), and auto-assign to the right department.
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {error && <div className="alert-error" style={{ margin: "16px 0" }}>⚠️ {error}</div>}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "28px" }}>
                        {step > 0 ? (
                            <button onClick={() => setStep(s => s - 1)} className="btn-secondary">← Back</button>
                        ) : <div />}
                        {step < 3 ? (
                            <button onClick={() => setStep(s => s + 1)} className="btn-primary" disabled={!isStepValid()}>
                                Continue →
                            </button>
                        ) : (
                            <button onClick={handleSubmit} className="btn-primary" disabled={loading}>
                                {loading ? "Submitting..." : "🚀 Submit Complaint"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
