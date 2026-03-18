"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

const FEATURES = [
  { icon: "🌍", title: "Multilingual AI", desc: "Submit in 15+ Indian languages. Our NLP engine auto-detects, translates, and processes.", gradient: "linear-gradient(135deg, #f97316, #fbbf24)" },
  { icon: "🤖", title: "Smart Classification", desc: "AI classifies complaint category, severity, and urgency in real-time.", gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)" },
  { icon: "⚡", title: "Live Tracking", desc: "Track your complaint lifecycle — from submission through resolution.", gradient: "linear-gradient(135deg, #a78bfa, #8b5cf6)" },
  { icon: "🏢", title: "Auto-Routing", desc: "Smart assignment routes complaints to the right department and officer.", gradient: "linear-gradient(135deg, #22c55e, #16a34a)" },
  { icon: "📊", title: "Analytics Engine", desc: "Real-time dashboards with state-wise, category, and trend analytics.", gradient: "linear-gradient(135deg, #f43f5e, #e11d48)" },
  { icon: "🔔", title: "Instant Updates", desc: "Officers validate, update, and resolve — you see it all in real-time.", gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)" },
];

const STATS = [
  { value: "50K+", label: "Complaints Resolved", icon: "✅" },
  { value: "15+", label: "Languages Supported", icon: "🌐" },
  { value: "98%", label: "Citizen Satisfaction", icon: "⭐" },
  { value: "2.1d", label: "Avg. Resolution Time", icon: "⚡" },
];

const CATEGORIES = [
  { icon: "🛣️", name: "Roads & Transport", color: "#f97316", desc: "Potholes, traffic, highways" },
  { icon: "💧", name: "Water & Sanitation", color: "#3b82f6", desc: "Supply, drainage, sewage" },
  { icon: "⚡", name: "Electricity", color: "#fbbf24", desc: "Power cuts, street lights" },
  { icon: "🗑️", name: "Garbage & Waste", color: "#22c55e", desc: "Collection, disposal" },
  { icon: "🏥", name: "Public Health", color: "#a78bfa", desc: "Hospitals, sanitation" },
  { icon: "🚔", name: "Safety & Crime", color: "#ef4444", desc: "Law & order issues" },
  { icon: "🏗️", name: "Land & Construction", color: "#06b6d4", desc: "Encroachment, permits" },
  { icon: "📋", name: "Other Issues", color: "#94a3b8", desc: "General civic issues" },
];

const ROLES = [
  { icon: "👤", title: "Citizen", desc: "Submit complaints in your language, track status, and get updates.", color: "#4ade80", link: "/submit" },
  { icon: "🏢", title: "Officer", desc: "Validate complaints, update status, and resolve issues for your department.", color: "#60a5fa", link: "/login" },
  { icon: "⚙️", title: "Admin", desc: "Monitor all complaints across states and departments (read-only).", color: "#fbbf24", link: "/login" },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [activeRole, setActiveRole] = useState(0);
  const { t } = useLanguage();

  useEffect(() => { setMounted(true); }, []);

  return (
    <main className="page-container">
      {/* LIVE SIMULATION TOP BANNER */}
      <div style={{
          background: "linear-gradient(90deg, #1e293b, #0f172a, #1e293b)",
          borderBottom: "1px solid rgba(249, 115, 22, 0.1)",
          padding: "10px 24px",
          textAlign: "center",
          fontSize: "13px",
          color: "#94a3b8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          position: "sticky",
          top: "0",
          zIndex: 100,
          backdropFilter: "blur(12px)"
      }}>
          <span style={{ 
              display: "flex", alignItems: "center", gap: "6px", 
              color: "#f97316", fontWeight: 700, textTransform: "uppercase", 
              letterSpacing: "0.5px" 
          }}>
              <span style={{ width: "6px", height: "6px", background: "#f97316", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
              Simulation Mode
          </span>
          <span>Explore the inner technical workings of the CRM pipeline.</span>
          <Link href="/platform/simulation" style={{ color: "#f97316", textDecoration: "none", fontWeight: 700, marginLeft: "4px", borderBottom: "1px solid #f97316" }}>
              Launch Full Simulation →
          </Link>
      </div>

      {/* ═══════ HERO ═══════ */}
      <section style={{ position: "relative", padding: "100px 24px 120px", textAlign: "center", overflow: "hidden" }}>
        <div className="hero-bg" />

        {/* Floating language chips */}
        {mounted && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {["हिंदी", "தமிழ்", "বাংলা", "తెలుగు", "मराठी", "ਪੰਜਾਬੀ", "ગુજરાતી", "ಕನ್ನಡ"].map((lang, i) => (
              <span key={lang} style={{
                position: "absolute",
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(249,115,22,0.35)",
                padding: "4px 10px",
                borderRadius: "12px",
                border: "1px solid rgba(249,115,22,0.12)",
                background: "rgba(249,115,22,0.03)",
                top: `${12 + (i * 10)}%`,
                left: i % 2 === 0 ? `${3 + i * 3}%` : undefined,
                right: i % 2 !== 0 ? `${3 + i * 2}%` : undefined,
                animation: `float ${3 + i * 0.4}s ease-in-out infinite alternate`,
              }}>
                {lang}
              </span>
            ))}
          </div>
        )}

        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)",
            borderRadius: "24px", padding: "6px 18px", marginBottom: "28px",
            fontSize: "12px", color: "#f97316", fontWeight: 600, letterSpacing: "0.02em",
          }}>
            <span className="pulse-dot" style={{ background: "#f97316" }} />
            {t("hero.badge")}
          </div>

          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(38px, 6vw, 68px)",
            fontWeight: 800,
            lineHeight: 1.08,
            marginBottom: "24px",
            letterSpacing: "-0.03em",
          }}>
            {t("hero.title1")}{" "}
            <span className="gradient-text">{t("hero.title_gradient")}</span>
            <br />{t("hero.title2")}
          </h1>

          <p style={{ fontSize: "18px", color: "var(--text-secondary)", maxWidth: "580px", margin: "0 auto 44px", lineHeight: 1.7 }}>
            {t("hero.desc")}
          </p>

          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/submit" className="btn-primary" style={{ fontSize: "16px", padding: "16px 36px" }}>
              {t("hero.btn_submit")}
            </Link>
            <Link href="/track" className="btn-secondary" style={{ fontSize: "16px", padding: "16px 36px" }}>
              {t("hero.btn_track")}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section style={{ padding: "0 24px 70px", maxWidth: "1100px", margin: "0 auto" }}>
        <div className="grid-4">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="stat-card" style={{
              textAlign: "center",
              animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both`,
            }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{ fontSize: "38px", fontWeight: 800, fontFamily: "'Sora', sans-serif" }} className="gradient-text">
                {stat.value}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                {i === 0 ? t("stats.resolved") : i === 1 ? t("stats.languages") : i === 2 ? t("stats.satisfaction") : t("stats.time")}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ 3 ROLES SECTION ═══════ */}
      <section style={{ padding: "70px 24px", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "30px", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.02em" }}>
              Three Roles, One Platform
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
              A complete pipeline from complaint submission to resolution
            </p>
          </div>
          <div className="grid-3">
            {ROLES.map((r, i) => (
              <Link key={r.title} href={r.link} style={{ textDecoration: "none" }}>
                <div className="stat-card" style={{
                  textAlign: "center", padding: "36px 24px", cursor: "pointer",
                  animation: `fadeInUp 0.5s ease-out ${i * 0.12}s both`,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${r.color}40`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  <div style={{
                    width: "56px", height: "56px", borderRadius: "16px",
                    background: `${r.color}15`, border: `1px solid ${r.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "28px", margin: "0 auto 16px",
                  }}>{r.icon}</div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: r.color }}>{r.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{r.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CATEGORIES ═══════ */}
      <section className="section">
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "30px", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.02em" }}>
            What Can You Report?
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            8 categories covering every civic issue across India
          </p>
        </div>
        <div className="grid-4">
          {CATEGORIES.map((cat, i) => (
            <Link href="/submit" key={cat.name} style={{ textDecoration: "none" }}>
              <div className="glass-card" style={{
                padding: "24px 16px", textAlign: "center", cursor: "pointer",
                animation: `fadeInUp 0.4s ease-out ${i * 0.06}s both`,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color + "40"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>{cat.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{cat.name}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{cat.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section style={{ padding: "70px 24px", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "30px", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.02em" }}>
              AI-Powered Governance
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
              Technology that bridges citizens and government
            </p>
          </div>
          <div className="grid-3">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="stat-card" style={{
                animation: `fadeInUp 0.5s ease-out ${i * 0.08}s both`,
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: f.gradient, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", marginBottom: "16px",
                  boxShadow: `0 4px 15px ${f.gradient.includes("#f97316") ? "rgba(249,115,22,0.3)" : "rgba(59,130,246,0.2)"}`,
                }}>{f.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: "8px", fontFamily: "'Sora', sans-serif", fontSize: "15px" }}>{f.title}</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="section">
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "30px", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.02em" }}>
            How It Works
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            From complaint to resolution in 4 simple steps
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "0", maxWidth: "900px", margin: "0 auto", position: "relative" }}>
          {[
            { label: "Submit in\nYour Language", icon: "📝" },
            { label: "AI Translates\n& Classifies", icon: "🤖" },
            { label: "Routed to\nRight Dept.", icon: "🏢" },
            { label: "Resolved &\nNotified", icon: "✅" },
          ].map((step, i) => (
            <div key={step.label} style={{ flex: 1, textAlign: "center", padding: "0 16px", position: "relative" }}>
              {i < 3 && (
                <div style={{
                  position: "absolute", top: "28px", right: 0, width: "100%",
                  height: "2px", background: "linear-gradient(90deg, var(--accent-orange), transparent)",
                  zIndex: 0,
                }} />
              )}
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", margin: "0 auto 16px",
                position: "relative", zIndex: 1,
                boxShadow: "0 0 25px rgba(249,115,22,0.35)",
                animation: `fadeInUp 0.5s ease-out ${i * 0.15}s both`,
              }}>
                {step.icon}
              </div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", lineHeight: 1.5, whiteSpace: "pre-line" }}>{step.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ TECHNICAL SIMULATION SECTION ═══════ */}
      <section style={{ 
        padding: "80px 24px", 
        background: "radial-gradient(circle at 10% 20%, rgba(249, 115, 22, 0.05) 0%, transparent 40%)",
        borderTop: "1px solid rgba(255, 255, 255, 0.03)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.03)"
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div>
            <div style={{ color: "#f97316", fontWeight: 700, fontSize: "14px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Technical Simulation
            </div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "36px", fontWeight: 800, color: "#f1f5f9", marginBottom: "20px", lineHeight: 1.2 }}>
              See the <span className="gradient-text">Inner Workings</span> of GovTech
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "17px", lineHeight: 1.7, marginBottom: "32px" }}>
              Ever wondered how your local language complaint reaches the right officer in seconds? 
              Launch our technical simulation to track data packets moving through API Gateways, 
              ML translation layers, and high-performance databases in real-time.
            </p>
            <Link href="/platform/simulation" className="btn-primary" style={{ display: "inline-block", fontSize: "16px", padding: "14px 32px" }}>
              🛠️ View Technical Simulation
            </Link>
          </div>
          
          <div style={{ position: "relative" }}>
            <div style={{ 
              background: "rgba(15, 23, 42, 0.6)", 
              border: "1px solid rgba(249, 115, 22, 0.2)", 
              borderRadius: "24px", 
              padding: "32px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              backdropFilter: "blur(8px)"
            }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fbbf24" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#64748b", lineHeight: 1.8 }}>
                <div style={{ color: "#f97316", marginBottom: "8px" }}>// Initializing GovTech Pipeline...</div>
                <div style={{ marginBottom: "4px" }}>COMPLAINT_RECEIVED: "Garbage near main market"</div>
                <div style={{ color: "#3b82f6", marginBottom: "4px" }}>→ ML_ENGINE: Detecting Language (EN)...</div>
                <div style={{ color: "#a78bfa", marginBottom: "4px" }}>→ ML_ENGINE: Category (Sanitation)...</div>
                <div style={{ color: "#22c55e", marginBottom: "4px" }}>→ ROUTER: Notifying Dept. XYZ...</div>
                <div style={{ color: "#94a3b8", marginTop: "12px", fontStyle: "italic" }}>[SYSTEM_HEALTH: 98% | LATENCY: 124ms]</div>
              </div>
            </div>
            <div style={{ 
              position: "absolute", 
              top: "-20px", 
              right: "-20px", 
              width: "80px", 
              height: "80px", 
              background: "rgba(249, 115, 22, 0.1)", 
              borderRadius: "50%", 
              filter: "blur(20px)",
              zIndex: -1 
            }} />
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section style={{ padding: "80px 24px", textAlign: "center", background: "var(--bg-secondary)", position: "relative", overflow: "hidden" }}>
        <div className="hero-bg" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "34px", fontWeight: 700, marginBottom: "16px", letterSpacing: "-0.02em" }}>
            Ready to Report a Civic Issue?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "36px", fontSize: "16px", maxWidth: "500px", margin: "0 auto 36px" }}>
            It takes less than 2 minutes. No paperwork. No queues.
            <br />Your complaint goes straight to the right authority.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn-primary" style={{ fontSize: "16px", padding: "16px 40px" }}>
              🚀 Get Started Free
            </Link>
            <Link href="/login" className="btn-secondary" style={{ fontSize: "16px", padding: "16px 40px" }}>
              Already Registered? Login
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer style={{
        padding: "36px 24px", textAlign: "center",
        borderTop: "1px solid var(--border)", color: "var(--text-muted)",
        fontSize: "13px", lineHeight: 1.8,
      }}>
        <div style={{ marginBottom: "8px" }}>
          © 2026 <strong style={{ color: "var(--text-secondary)" }}>GovTech CRM</strong> — Government of India Initiative
        </div>
        <div style={{ fontSize: "11px" }}>
          Built with 🤖 AI & ❤️ for 1.4 Billion Citizens · Multilingual · Open & Transparent
        </div>
      </footer>

      <style>{`
        @keyframes float {
          from { transform: translateY(0px); }
          to { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
