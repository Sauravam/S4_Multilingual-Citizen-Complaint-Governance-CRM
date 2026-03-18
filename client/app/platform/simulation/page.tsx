"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Server, Cpu, Database, LayoutDashboard, Zap, Activity,
  Shield, Globe, ArrowRight, Code2, Lock, RefreshCw, CheckCircle,
  XCircle, AlertTriangle, FileText, Search, BarChart2, GitBranch,
  ChevronRight, Eye, Edit, UserCheck, Layers, Wifi, Key,
  MessageSquare, Upload, Route, Filter, Clock
} from "lucide-react";

// ─────────── DATA ───────────

const PAGES = [
  {
    id: "home", label: "/ Home", icon: Globe, color: "#3b82f6",
    desc: "Public landing page",
    apis: [],
    notes: "No API calls — static + i18n translations only"
  },
  {
    id: "login", label: "/login", icon: Lock, color: "#f59e0b",
    desc: "User Authentication",
    apis: [{ method: "POST", path: "/auth/login", desc: "Validate credentials, return token + user profile" }],
    notes: "Stores token & user in localStorage, sets cookie for middleware"
  },
  {
    id: "register", label: "/register", icon: UserCheck, color: "#a78bfa",
    desc: "New user registration",
    apis: [
      { method: "POST", path: "/auth/register", desc: "Hash password (bcrypt), insert into Supabase users table" },
      { method: "GET", path: "/auth/departments", desc: "Fetch department list for officer signup" }
    ],
    notes: "Roles: citizen, officer (requires dept), admin"
  },
  {
    id: "submit", label: "/submit", icon: FileText, color: "#f97316",
    desc: "Citizen complaint submission",
    apis: [
      { method: "POST", path: "/complaints", desc: "Full pipeline: detect lang → translate → classify → assign dept → insert DB" },
      { method: "GET", path: "/complaints/states", desc: "Fetch Indian states list for location dropdown" }
    ],
    notes: "AI pipeline runs synchronously per request. Image encoded as base64 → uploaded to Supabase Storage (evidence bucket)"
  },
  {
    id: "track", label: "/track", icon: Search, color: "#22c55e",
    desc: "Complaint status tracking",
    apis: [
      { method: "GET", path: "/complaints/{id}", desc: "Fetch complaint by ID, includes SLA status + similar count" }
    ],
    notes: "Public endpoint — no auth required. SLA breach calculated server-side (> 7 days open)"
  },
  {
    id: "user", label: "/user/dashboard", icon: User, color: "#06b6d4",
    desc: "Citizen dashboard",
    apis: [
      { method: "GET", path: "/complaints", desc: "Returns only complaints by logged-in citizen email (RBAC)" },
      { method: "POST", path: "/complaints/{id}/escalate", desc: "Escalate own complaint → severity bumped to CRITICAL" }
    ],
    notes: "RBAC: query automatically filtered by citizen_email via X-User-Email header"
  },
  {
    id: "officer", label: "/officer/dashboard", icon: Edit, color: "#f43f5e",
    desc: "Officer case management",
    apis: [
      { method: "GET", path: "/complaints", desc: "Returns complaints filtered to officer's department only" },
      { method: "PATCH", path: "/complaints/{id}/status", desc: "Update status: submitted → under_review → in_progress → resolved/rejected" },
      { method: "PATCH", path: "/complaints/{id}/assign", desc: "Re-assign to another department + officer email" }
    ],
    notes: "Officers can only modify complaints within their department. Status history is append-only (immutable audit log)"
  },
  {
    id: "admin", label: "/admin/dashboard", icon: BarChart2, color: "#e879f9",
    desc: "Admin read-only analytics",
    apis: [
      { method: "GET", path: "/complaints", desc: "Full view — all complaints across all departments and states" },
      { method: "GET", path: "/analytics/summary", desc: "Aggregated stats: total, by status, by dept, by state" },
      { method: "GET", path: "/analytics/trends", desc: "Time-series data: complaints submitted per day" },
      { method: "GET", path: "/auth/users", desc: "List of all registered users" }
    ],
    notes: "Admin role is read-only — cannot update complaint status"
  },
];

const FLOW_STEPS = [
  {
    id: "citizen",
    label: "Citizen Submits",
    icon: User, color: "#3b82f6",
    detail: "Citizen types complaint in Hindi/Tamil/etc. on /submit page. Browser sends POST /complaints with description, location, state, optional image.",
    layer: "Frontend"
  },
  {
    id: "gateway",
    label: "FastAPI Gateway",
    icon: Server, color: "#f97316",
    detail: "Uvicorn receives request. FastAPI validates schema with Pydantic. X-User-Email header is checked — require_role(['citizen']) dependency confirms role.",
    layer: "Backend"
  },
  {
    id: "lang_detect",
    label: "Language Detection",
    icon: Globe, color: "#a78bfa",
    detail: "ai_service.detect_language() scans Unicode ranges: Devanagari (Hindi), Tamil, Telugu, Bengali, Arabic, etc. Returns 2-letter ISO code (hi, ta, te...).",
    layer: "AI Service"
  },
  {
    id: "translate",
    label: "Translation Engine",
    icon: RefreshCw, color: "#06b6d4",
    detail: "ai_service.translate_text() converts non-English text to English. In production: Google Translate API. Stores both original_text + translated english_description.",
    layer: "AI Service"
  },
  {
    id: "classify",
    label: "AI Classification",
    icon: Cpu, color: "#22c55e",
    detail: "ai_service.classify_complaint() keyword-scores title+description across 8 categories (roads, water, electricity...) and 3 severity levels (critical/high/medium/low). Returns category + subcategory + severity.",
    layer: "AI Service"
  },
  {
    id: "assign",
    label: "Dept. Auto-Assign",
    icon: Route, color: "#f59e0b",
    detail: "auto_assign_department() maps category to department: roads→PWD, water→WATER, electricity→ELEC, garbage→ENV, health→HEALTH, safety→POLICE, land→REVENUE.",
    layer: "AI Service"
  },
  {
    id: "duplicate",
    label: "Duplicate Check",
    icon: Filter, color: "#f43f5e",
    detail: "Supabase query checks for existing unresolved complaints with same category + location. Returns warning with similar_count and IDs. Does NOT block submission.",
    layer: "Database"
  },
  {
    id: "image",
    label: "Image Upload",
    icon: Upload, color: "#e879f9",
    detail: "If image_base64 provided: decoded → uploaded to Supabase Storage 'evidence' bucket as {complaintId}.jpg. Public URL appended to media_urls[].",
    layer: "Database"
  },
  {
    id: "db_insert",
    label: "Supabase INSERT",
    icon: Database, color: "#4ade80",
    detail: "Final complaint object inserted into Supabase PostgreSQL 'complaints' table. Includes: id (GOV-YYYY-XXXXXX), status, category, severity, department, citizen_email, history[], ai_classification, translation_info.",
    layer: "Database"
  },
  {
    id: "response",
    label: "Response to Client",
    icon: CheckCircle, color: "#3b82f6",
    detail: "FastAPI returns 201 Created: {complaint, message, department_assigned, duplicate_warning?}. Frontend shows success state with complaint ID and assigned department name.",
    layer: "Frontend"
  },
];

const SERVICES = [
  {
    id: "auth",
    name: "Auth Service",
    file: "routers/auth.py",
    color: "#f59e0b",
    icon: Key,
    endpoints: [
      { method: "POST", path: "/auth/login", flow: "Query users table → bcrypt.checkpw() → return token + user profile" },
      { method: "POST", path: "/auth/register", flow: "Validate role → bcrypt.hashpw() → insert user → return token" },
      { method: "GET", path: "/auth/departments", flow: "Return hardcoded DEPARTMENTS dict" },
      { method: "GET", path: "/auth/users", flow: "Supabase select all users (admin only)" },
    ],
    rbac: "Header: X-User-Email → supabase.table('users').select().eq('email', ...) → role check"
  },
  {
    id: "complaints",
    name: "Complaints Service",
    file: "routers/complaints.py",
    color: "#f97316",
    icon: MessageSquare,
    endpoints: [
      { method: "GET", path: "/complaints", flow: "Role-filtered query: citizen→own, officer→dept, admin→all + SLA flag" },
      { method: "POST", path: "/complaints", flow: "lang detect → translate → classify → assign → dup check → image upload → INSERT" },
      { method: "GET", path: "/complaints/{id}", flow: "Fetch by ID + SLA calc + similar_count query" },
      { method: "PATCH", path: "/complaints/{id}/status", flow: "Role check → append to history[] → UPDATE" },
      { method: "PATCH", path: "/complaints/{id}/assign", flow: "Update department + assigned_to → status→under_review" },
      { method: "POST", path: "/complaints/{id}/escalate", flow: "Citizen-only → severity→critical → append escalation to history[]" },
    ],
    rbac: "require_role(['citizen']) or require_role(['officer','admin']) per endpoint"
  },
  {
    id: "ai",
    name: "AI Service",
    file: "services/ai_service.py",
    color: "#a78bfa",
    icon: Cpu,
    endpoints: [
      { method: "FUNC", path: "detect_language(text)", flow: "Unicode range scanning: \\u0900-\\u097F=Hindi, \\u0B80-\\u0BFF=Tamil, etc." },
      { method: "FUNC", path: "translate_text(text, lang)", flow: "Mock translations map → in production: Google Translate API" },
      { method: "FUNC", path: "classify_complaint(title, desc)", flow: "Keyword scoring across 8 categories → subcategory match → severity scoring" },
      { method: "FUNC", path: "auto_assign_department(category)", flow: "CATEGORY_TO_DEPT map → returns dept code (PWD/WATER/ELEC/ENV/HEALTH/POLICE/REVENUE/GENERAL)" },
    ],
    rbac: "Internal service — called by complaints router only, not exposed as HTTP endpoint"
  },
  {
    id: "analytics",
    name: "Analytics Service",
    file: "routers/analytics.py",
    color: "#22c55e",
    icon: BarChart2,
    endpoints: [
      { method: "GET", path: "/analytics/summary", flow: "Aggregate count by status, category, department, state" },
      { method: "GET", path: "/analytics/trends", flow: "Group complaints by submitted_at date → time-series array" },
      { method: "GET", path: "/analytics/department-stats", flow: "Per-dept: total, resolved, avg resolution time, SLA breaches" },
    ],
    rbac: "Admin-only access"
  },
];

const DB_TABLES = [
  {
    name: "users",
    color: "#f59e0b",
    columns: ["id (u_hex)", "email", "name", "password (bcrypt)", "role (citizen|officer|admin)", "department?", "preferred_language", "phone", "created_at"],
    indexes: ["email (unique)"]
  },
  {
    name: "complaints",
    color: "#f97316",
    columns: ["id (GOV-YYYY-XXXXXX)", "title", "description (EN)", "original_text", "original_language", "translated (bool)", "category", "subcategory", "severity", "status", "location", "state", "latitude?", "longitude?", "department", "assigned_to?", "citizen_email", "media_urls[]", "history[] (JSONB)", "ai_classification (JSONB)", "translation_info (JSONB)", "submitted_at", "updated_at", "resolved_at?"],
    indexes: ["citizen_email", "department", "status", "category + location (dup check)"]
  },
  {
    name: "evidence (storage)",
    color: "#22c55e",
    columns: ["filename ({complaintId}.jpg|.png)", "public_url", "bucket: evidence"],
    indexes: ["filename"]
  },
];

// ─────────── COMPONENT ───────────

export default function SimulationPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [activePage, setActivePage] = useState(0);
  const [activeService, setActiveService] = useState(0);
  const [flowStep, setFlowStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tabs = ["Architecture Map", "Live Request Flow", "Page → API Map", "Services Deep Dive", "Database Schema"];

  const startFlow = () => {
    setFlowStep(0);
    setIsPlaying(true);
  };

  const resetFlow = () => {
    setIsPlaying(false);
    setFlowStep(-1);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setFlowStep(s => {
          if (s >= FLOW_STEPS.length - 1) {
            setIsPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, 1800);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  const methodColor = (m: string) =>
    m === "GET" ? "#22c55e" : m === "POST" ? "#f97316" : m === "PATCH" ? "#3b82f6" : m === "DELETE" ? "#ef4444" : "#a78bfa";

  const layerColor = (l: string) =>
    l === "Frontend" ? "#3b82f6" : l === "Backend" ? "#f97316" : l === "AI Service" ? "#a78bfa" : "#22c55e";

  return (
    <div style={{
      minHeight: "100vh", background: "#070d1a", color: "#e2e8f0",
      fontFamily: "'Inter', sans-serif", overflowY: "auto"
    }}>
      {/* ── HEADER ── */}
      <div style={{
        background: "rgba(15,23,42,0.95)", borderBottom: "1px solid rgba(249,115,22,0.15)",
        padding: "24px 40px", position: "sticky", top: 0, zIndex: 50,
        backdropFilter: "blur(20px)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316", animation: "pulse 1.4s infinite" }} />
              <span style={{ color: "#f97316", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Live Architecture Simulation</span>
            </div>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
              GovTech CRM — Full Stack Architecture
            </h1>
            <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>
              Next.js 16 → FastAPI → AI Service → Supabase PostgreSQL
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["React 19", "FastAPI", "Supabase", "Uvicorn"].map(t => (
              <span key={t} style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)",
                color: "#f97316"
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 20 }}>
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none",
              cursor: "pointer", transition: "all 0.2s",
              background: activeTab === i ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.04)",
              color: activeTab === i ? "#f97316" : "#64748b",
              borderBottom: activeTab === i ? "2px solid #f97316" : "2px solid transparent"
            }}>{tab}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px 40px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ═══════════════ TAB 0: Architecture Map ═══════════════ */}
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div key="arch" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
                {/* Layer headers */}
                {[
                  { label: "Frontend", sublabel: "Next.js 16 / React 19", color: "#3b82f6", items: PAGES },
                  { label: "API Gateway", sublabel: "FastAPI + Uvicorn", color: "#f97316", items: null },
                  { label: "Services", sublabel: "AI + Auth + Analytics", color: "#a78bfa", items: null },
                  { label: "Database", sublabel: "Supabase PostgreSQL", color: "#22c55e", items: null },
                ].map((layer, li) => (
                  <div key={li}>
                    <div style={{
                      background: `linear-gradient(135deg, ${layer.color}20, ${layer.color}08)`,
                      border: `1px solid ${layer.color}30`, borderRadius: 14, padding: "14px 18px",
                      marginBottom: 12, textAlign: "center"
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: layer.color, fontFamily: "'Sora',sans-serif" }}>{layer.label}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{layer.sublabel}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Architecture rows — one per page */}
              {PAGES.map((page, pi) => {
                const Icon = page.icon;
                return (
                  <div key={page.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 12 }}>
                    {/* Frontend node */}
                    <motion.div whileHover={{ scale: 1.02 }} onClick={() => { setActivePage(pi); setActiveTab(2); }}
                      style={{
                        background: `${page.color}12`, border: `1px solid ${page.color}30`,
                        borderRadius: 12, padding: "12px 16px", cursor: "pointer", display: "flex",
                        alignItems: "center", gap: 10
                      }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${page.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={16} style={{ color: page.color }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", fontFamily: "'JetBrains Mono',monospace" }}>{page.label}</div>
                        <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{page.desc}</div>
                      </div>
                    </motion.div>

                    {/* API node */}
                    <div style={{
                      background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)",
                      borderRadius: 12, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4
                    }}>
                      {page.apis.length === 0 ? (
                        <div style={{ fontSize: 11, color: "#475569", fontStyle: "italic", margin: "auto" }}>No API calls</div>
                      ) : page.apis.map((api, ai) => (
                        <div key={ai} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 5px", borderRadius: 4, background: `${methodColor(api.method)}20`, color: methodColor(api.method), fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{api.method}</span>
                          <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace" }}>{api.path}</span>
                        </div>
                      ))}
                    </div>

                    {/* Services node */}
                    <div style={{
                      background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)",
                      borderRadius: 12, padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "center"
                    }}>
                      {page.id === "submit" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          {["🌐 Lang Detect", "🔄 Translate", "🤖 Classify", "🏢 Auto-Assign"].map(s => (
                            <span key={s} style={{ fontSize: 10, color: "#a78bfa", fontWeight: 600 }}>{s}</span>
                          ))}
                        </div>
                      )}
                      {page.id === "login" && <span style={{ fontSize: 10, color: "#a78bfa", fontWeight: 600 }}>🔐 bcrypt.checkpw()</span>}
                      {page.id === "register" && <span style={{ fontSize: 10, color: "#a78bfa", fontWeight: 600 }}>🔐 bcrypt.hashpw()</span>}
                      {page.id === "admin" && <span style={{ fontSize: 10, color: "#a78bfa", fontWeight: 600 }}>📊 Aggregation Engine</span>}
                      {["home", "track", "user", "officer"].includes(page.id) && <span style={{ fontSize: 10, color: "#475569", fontStyle: "italic" }}>RBAC Header Check</span>}
                    </div>

                    {/* DB node */}
                    <div style={{
                      background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)",
                      borderRadius: 12, padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4
                    }}>
                      {page.id === "home" && <span style={{ fontSize: 10, color: "#475569", fontStyle: "italic" }}>—</span>}
                      {["login", "register"].includes(page.id) && <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 600 }}>📋 supabase.users</span>}
                      {["submit", "track", "user", "officer"].includes(page.id) && <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 600 }}>📋 supabase.complaints</span>}
                      {page.id === "submit" && <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 600 }}>🪣 evidence (storage)</span>}
                      {page.id === "admin" && (
                        <>
                          <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 600 }}>📋 supabase.complaints</span>
                          <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 600 }}>📋 supabase.users</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Legend */}
              <div style={{ display: "flex", gap: 16, marginTop: 24, padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>LEGEND:</span>
                {[["GET","#22c55e"],["POST","#f97316"],["PATCH","#3b82f6"],["DELETE","#ef4444"]].map(([m,c]) => (
                  <span key={m} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: `${c}20`, color: c, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{m}</span>
                ))}
                <span style={{ fontSize: 12, color: "#64748b", marginLeft: "auto" }}>Click any frontend row to see full API details →</span>
              </div>
            </motion.div>
          )}

          {/* ═══════════════ TAB 1: Live Request Flow ═══════════════ */}
          {activeTab === 1 && (
            <motion.div key="flow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div>
                  <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
                    Complaint Submission — Full Request Lifecycle
                  </h2>
                  <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>
                    Simulates a citizen submitting "Garbage near main market" in Hindi
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={resetFlow} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#94a3b8", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                    ↺ Reset
                  </button>
                  <button onClick={startFlow} disabled={isPlaying} style={{
                    padding: "10px 22px", borderRadius: 10, border: "none",
                    background: isPlaying ? "rgba(249,115,22,0.4)" : "linear-gradient(135deg,#f97316,#ea580c)",
                    color: "#fff", cursor: isPlaying ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13,
                    display: "flex", alignItems: "center", gap: 8
                  }}>
                    {isPlaying ? <><Activity size={15} style={{ animation: "spin 1s linear infinite" }} /> Running...</> : <><Zap size={15} /> Start Simulation</>}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginBottom: 28, overflow: "hidden" }}>
                <motion.div
                  animate={{ width: flowStep >= 0 ? `${((flowStep + 1) / FLOW_STEPS.length) * 100}%` : "0%" }}
                  transition={{ duration: 0.5 }}
                  style={{ height: "100%", background: "linear-gradient(90deg,#f97316,#fbbf24)", borderRadius: 2 }}
                />
              </div>

              {/* Steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {FLOW_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = flowStep === i;
                  const isDone = flowStep > i;
                  const isPending = flowStep < i;
                  return (
                    <motion.div key={step.id}
                      animate={{ opacity: isPending && flowStep >= 0 ? 0.3 : 1, x: isActive ? 4 : 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        display: "flex", gap: 16, alignItems: "flex-start",
                        padding: "18px 20px", borderRadius: 14,
                        background: isActive ? `${step.color}15` : isDone ? "rgba(34,197,94,0.06)" : "rgba(15,23,42,0.4)",
                        border: `1px solid ${isActive ? step.color + "40" : isDone ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.04)"}`,
                        transition: "all 0.4s"
                      }}>
                      {/* Step number */}
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: isDone ? "#22c55e20" : isActive ? `${step.color}25` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${isDone ? "#22c55e40" : isActive ? step.color + "50" : "rgba(255,255,255,0.06)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        {isDone ? <CheckCircle size={16} color="#22c55e" /> : <Icon size={16} style={{ color: isActive ? step.color : "#475569" }} />}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: isActive ? "#f1f5f9" : isDone ? "#94a3b8" : "#64748b" }}>
                            {i + 1}. {step.label}
                          </span>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700, background: `${layerColor(step.layer)}20`, color: layerColor(step.layer) }}>
                            {step.layer}
                          </span>
                          {isActive && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}
                              style={{ fontSize: 11, color: step.color, fontWeight: 700 }}>● PROCESSING</motion.span>
                          )}
                          {isDone && <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>✓ DONE</span>}
                        </div>
                        <AnimatePresence>
                          {(isActive || isDone) && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                              style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                              {step.detail}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* connector arrow */}
                      {i < FLOW_STEPS.length - 1 && (
                        <div style={{ position: "absolute", left: "2.5rem", marginTop: 52 }}>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Final state */}
              {flowStep === FLOW_STEPS.length - 1 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ marginTop: 24, padding: 20, borderRadius: 14, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", textAlign: "center" }}>
                  <CheckCircle size={32} color="#22c55e" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>Complaint Successfully Registered</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                    ID: <code style={{ color: "#f97316", fontFamily: "'JetBrains Mono',monospace" }}>GOV-2026-A1B2C3</code> · Department: Environment & Waste Dept. · Severity: MEDIUM
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══════════════ TAB 2: Page → API Map ═══════════════ */}
          {activeTab === 2 && (
            <motion.div key="pages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>
                {/* Page selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {PAGES.map((page, i) => {
                    const Icon = page.icon;
                    return (
                      <button key={page.id} onClick={() => setActivePage(i)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12,
                          border: `1px solid ${activePage === i ? page.color + "40" : "rgba(255,255,255,0.05)"}`,
                          background: activePage === i ? `${page.color}12` : "rgba(255,255,255,0.02)",
                          cursor: "pointer", textAlign: "left", transition: "all 0.2s"
                        }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${page.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={14} style={{ color: page.color }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: activePage === i ? "#f1f5f9" : "#64748b", fontFamily: "'JetBrains Mono',monospace" }}>{page.label}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Detail panel */}
                <AnimatePresence mode="wait">
                  <motion.div key={activePage} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>
                    {(() => {
                      const page = PAGES[activePage];
                      const Icon = page.icon;
                      return (
                        <>
                          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${page.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Icon size={22} style={{ color: page.color }} />
                            </div>
                            <div>
                              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>{page.label}</div>
                              <div style={{ color: "#64748b", fontSize: 14 }}>{page.desc}</div>
                            </div>
                          </div>

                          {/* API Endpoints */}
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#475569", marginBottom: 12 }}>API Endpoints Called</div>
                            {page.apis.length === 0 ? (
                              <div style={{ color: "#475569", fontSize: 14, fontStyle: "italic" }}>No backend API calls on this page.</div>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {page.apis.map((api, i) => (
                                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                      <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 5, background: `${methodColor(api.method)}20`, color: methodColor(api.method), fontFamily: "'JetBrains Mono',monospace" }}>{api.method}</span>
                                      <code style={{ fontSize: 13, color: "#f1f5f9", fontFamily: "'JetBrains Mono',monospace" }}>http://localhost:8000{api.path}</code>
                                    </div>
                                    <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{api.desc}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          <div style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)", borderRadius: 12, padding: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#f97316", marginBottom: 6 }}>⚙ Implementation Notes</div>
                            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{page.notes}</div>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ═══════════════ TAB 3: Services Deep Dive ═══════════════ */}
          {activeTab === 3 && (
            <motion.div key="svc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SERVICES.map((svc, i) => {
                    const Icon = svc.icon;
                    return (
                      <button key={svc.id} onClick={() => setActiveService(i)}
                        style={{
                          padding: "14px", borderRadius: 12, border: `1px solid ${activeService === i ? svc.color + "40" : "rgba(255,255,255,0.05)"}`,
                          background: activeService === i ? `${svc.color}12` : "rgba(255,255,255,0.02)",
                          cursor: "pointer", textAlign: "left", transition: "all 0.2s"
                        }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Icon size={16} style={{ color: svc.color }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: activeService === i ? "#f1f5f9" : "#64748b" }}>{svc.name}</span>
                        </div>
                        <div style={{ fontSize: 10, color: "#475569", marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>{svc.file}</div>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={activeService} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 28 }}>
                    {(() => {
                      const svc = SERVICES[activeService];
                      const Icon = svc.icon;
                      return (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                            <div style={{ width: 50, height: 50, borderRadius: 14, background: `${svc.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Icon size={22} style={{ color: svc.color }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", fontFamily: "'Sora',sans-serif" }}>{svc.name}</div>
                              <code style={{ fontSize: 12, color: "#64748b", fontFamily: "'JetBrains Mono',monospace" }}>{svc.file}</code>
                            </div>
                          </div>

                          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#475569", marginBottom: 12 }}>
                            {svc.id === "ai" ? "Internal Functions" : "Endpoints & Logic"}
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {svc.endpoints.map((ep, i) => (
                              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 18px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                  <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4, background: `${methodColor(ep.method)}18`, color: methodColor(ep.method), fontFamily: "'JetBrains Mono',monospace" }}>{ep.method}</span>
                                  <code style={{ fontSize: 13, color: svc.color, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{ep.path}</code>
                                </div>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                  <ChevronRight size={13} color="#f97316" style={{ flexShrink: 0, marginTop: 1 }} />
                                  <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{ep.flow}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div style={{ marginTop: 20, background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: 12, padding: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#a78bfa", marginBottom: 6 }}>🔐 Access Control</div>
                            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{svc.rbac}</div>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ═══════════════ TAB 4: Database Schema ═══════════════ */}
          {activeTab === 4 && (
            <motion.div key="db" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                {DB_TABLES.map((table) => (
                  <div key={table.name} style={{
                    background: "rgba(15,23,42,0.6)", border: `1px solid ${table.color}30`,
                    borderRadius: 20, padding: 24, gridColumn: table.name === "complaints" ? "1 / -1" : "auto"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                      <Database size={18} style={{ color: table.color }} />
                      <code style={{ fontSize: 16, fontWeight: 800, color: table.color, fontFamily: "'JetBrains Mono',monospace" }}>
                        {table.name === "evidence (storage)" ? "🪣 evidence (Supabase Storage)" : `📋 ${table.name}`}
                      </code>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                      {table.columns.map((col, i) => {
                        const isKey = col.includes("id") || col.includes("email") || col.includes("filename");
                        const isJsonb = col.includes("JSONB") || col.includes("[]");
                        return (
                          <span key={i} style={{
                            padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                            fontFamily: "'JetBrains Mono',monospace",
                            background: isKey ? `${table.color}20` : isJsonb ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.04)",
                            color: isKey ? table.color : isJsonb ? "#a78bfa" : "#94a3b8",
                            border: `1px solid ${isKey ? table.color + "30" : "rgba(255,255,255,0.05)"}`,
                          }}>{col}</span>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "#475569" }}>Indexes:</span>
                      {table.indexes.map((idx, i) => (
                        <span key={i} style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono',monospace", background: "rgba(255,255,255,0.03)", padding: "2px 8px", borderRadius: 4 }}>⚡ {idx}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* RBAC summary */}
              <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#475569", marginBottom: 16 }}>Role-Based Data Access Control (RBAC)</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr>
                        {["Role", "GET /complaints", "POST /complaints", "PATCH status", "PATCH assign", "POST escalate", "GET /analytics"].map(h => (
                          <th key={h} style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#64748b", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { role: "👤 Citizen", color: "#4ade80", own: "✅ Own only", post: "✅ Yes", status: "❌ No", assign: "❌ No", escalate: "✅ Own only", analytics: "❌ No" },
                        { role: "🏢 Officer", color: "#60a5fa", own: "✅ Dept. only", post: "❌ No", status: "✅ Dept. only", assign: "✅ Yes", escalate: "❌ No", analytics: "❌ No" },
                        { role: "⚙️ Admin", color: "#fbbf24", own: "✅ All data", post: "❌ No", status: "✅ All", assign: "✅ All", escalate: "❌ No", analytics: "✅ Yes" },
                      ].map((row) => (
                        <tr key={row.role} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "10px 12px", fontWeight: 700, color: row.color }}>{row.role}</td>
                          <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{row.own}</td>
                          <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{row.post}</td>
                          <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{row.status}</td>
                          <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{row.assign}</td>
                          <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{row.escalate}</td>
                          <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{row.analytics}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
