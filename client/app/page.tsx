"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const FEATURES = [
  { icon: "🌍", title: "Multilingual Support", desc: "Submit complaints in 15+ Indian & global languages. Our AI auto-detects and translates." },
  { icon: "🤖", title: "AI Classification", desc: "Smart AI classifies your complaint category and severity instantly." },
  { icon: "⚡", title: "Real-time Tracking", desc: "Track your complaint status live — from submission to resolution." },
  { icon: "🏢", title: "Smart Assignment", desc: "Automatically routed to the right government department and officer." },
  { icon: "📊", title: "Analytics Dashboard", desc: "Citizens and officers get data-driven insights into civic issues." },
  { icon: "🔔", title: "Status Updates", desc: "Instant notifications when your complaint status changes." },
];

const STATS = [
  { value: "50K+", label: "Complaints Resolved" },
  { value: "15+", label: "Languages Supported" },
  { value: "98%", label: "Citizen Satisfaction" },
  { value: "2.1d", label: "Avg. Resolution Time" },
];

const CATEGORIES = [
  { icon: "🛣️", name: "Roads & Transport", color: "#f97316" },
  { icon: "💧", name: "Water & Sanitation", color: "#3b82f6" },
  { icon: "⚡", name: "Electricity", color: "#fbbf24" },
  { icon: "🗑️", name: "Garbage & Waste", color: "#22c55e" },
  { icon: "🏥", name: "Public Health", color: "#a78bfa" },
  { icon: "🚔", name: "Safety & Crime", color: "#ef4444" },
  { icon: "🏗️", name: "Land & Construction", color: "#06b6d4" },
  { icon: "📋", name: "Other Issues", color: "#94a3b8" },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <main className="page-container">
      {/* Hero */}
      <section style={{ position: "relative", padding: "80px 24px 100px", textAlign: "center", overflow: "hidden" }}>
        <div className="hero-bg" />

        {/* Floating language chips */}
        {mounted && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {["हिंदी", "தமிழ்", "বাংলা", "తెలుగు", "मराठी", "ਪੰਜਾਬੀ"].map((lang, i) => (
              <span key={lang} style={{
                position: "absolute",
                fontSize: "12px",
                fontWeight: 600,
                color: "rgba(249,115,22,0.5)",
                padding: "4px 10px",
                borderRadius: "12px",
                border: "1px solid rgba(249,115,22,0.2)",
                background: "rgba(249,115,22,0.05)",
                top: `${15 + (i * 12)}%`,
                left: i % 2 === 0 ? `${5 + i * 3}%` : undefined,
                right: i % 2 !== 0 ? `${5 + i * 3}%` : undefined,
                animation: `float ${3 + i * 0.5}s ease-in-out infinite alternate`,
              }}>
                {lang}
              </span>
            ))}
          </div>
        )}

        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)",
            borderRadius: "20px", padding: "6px 16px", marginBottom: "24px",
            fontSize: "13px", color: "#f97316", fontWeight: 600,
          }}>
            🇮🇳 Powered by AI · Serving 1.4 Billion Citizens
          </div>

          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, lineHeight: 1.1, marginBottom: "24px" }}>
            Your Voice,{" "}
            <span className="gradient-text">Your Language,</span>
            <br />Your Government
          </h1>

          <p style={{ fontSize: "18px", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto 40px", lineHeight: 1.7 }}>
            Submit civic complaints in <strong style={{ color: "var(--text-primary)" }}>any language</strong>.
            Our AI translates, classifies, and routes them to the right authority — automatically.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/submit" className="btn-primary" style={{ fontSize: "16px", padding: "14px 32px" }}>
              📝 Submit a Complaint
            </Link>
            <Link href="/track" className="btn-secondary" style={{ fontSize: "16px", padding: "14px 32px" }}>
              🔍 Track Complaint
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "0 24px 60px", maxWidth: "1200px", margin: "0 auto" }}>
        <div className="grid-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: "'Sora', sans-serif" }} className="gradient-text">
                {stat.value}
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "28px", fontWeight: 700, textAlign: "center", marginBottom: "8px" }}>
          What Can You Report?
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "40px" }}>
          8 categories covering every civic issue
        </p>
        <div className="grid-4">
          {CATEGORIES.map((cat) => (
            <Link href="/submit" key={cat.name} style={{ textDecoration: "none" }}>
              <div className="glass-card" style={{
                padding: "20px", textAlign: "center", cursor: "pointer",
                transition: "all 0.3s", border: "1px solid var(--border)",
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = cat.color + "44")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>{cat.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>{cat.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: "var(--bg-secondary)", maxWidth: "100%", padding: "60px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "28px", fontWeight: 700, textAlign: "center", marginBottom: "8px" }}>
            AI-Powered Governance
          </h2>
          <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "40px" }}>
            Technology that bridges citizens and government
          </p>
          <div className="grid-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="stat-card">
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>{f.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: "8px", fontFamily: "'Sora', sans-serif" }}>{f.title}</div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "28px", fontWeight: 700, textAlign: "center", marginBottom: "8px" }}>
          How It Works
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "48px" }}>
          From complaint to resolution in 4 simple steps
        </p>
        <div style={{ display: "flex", gap: "0", maxWidth: "900px", margin: "0 auto", position: "relative" }}>
          {["Submit in Your Language", "AI Translates & Classifies", "Routed to Right Dept.", "Resolved & Notified"].map((step, i) => (
            <div key={step} style={{ flex: 1, textAlign: "center", padding: "0 16px", position: "relative" }}>
              {i < 3 && (
                <div style={{
                  position: "absolute", top: "24px", right: 0, width: "100%",
                  height: "2px", background: "linear-gradient(90deg, var(--accent-orange), transparent)",
                  zIndex: 0,
                }} />
              )}
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", fontWeight: 800, margin: "0 auto 16px",
                color: "white", fontFamily: "'Sora', sans-serif",
                position: "relative", zIndex: 1,
                boxShadow: "0 0 20px rgba(249,115,22,0.4)",
              }}>
                {i + 1}
              </div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", lineHeight: 1.5 }}>{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "60px 24px", textAlign: "center", background: "var(--bg-secondary)" }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "32px", fontWeight: 700, marginBottom: "16px" }}>
          Ready to Report a Civic Issue?
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "16px" }}>
          It takes less than 2 minutes. No paperwork. No queues.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" className="btn-primary" style={{ fontSize: "16px", padding: "14px 36px" }}>
            🚀 Get Started Free
          </Link>
          <Link href="/login" className="btn-secondary" style={{ fontSize: "16px", padding: "14px 36px" }}>
            Already Registered? Login
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "30px 24px", textAlign: "center", borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "13px" }}>
        © 2026 GovTech CRM — Government of India Initiative · Built with 🤖 AI & ❤️ for 1.4B citizens
      </footer>

      <style>{`
        @keyframes float {
          from { transform: translateY(0px); }
          to { transform: translateY(-10px); }
        }
      `}</style>
    </main>
  );
}
