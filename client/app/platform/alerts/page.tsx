"use client";

import React, { useState } from "react";
import {
  BellRing,
  Plus,
  X,
  Check,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Clock,
  Activity,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";

/* ─── Types & Mock Data ─── */
interface Alert {
  id: string;
  name: string;
  condition: string;
  schedule: string;
  status: "active" | "paused";
  lastTriggered: string | null;
  lastStatus: "triggered" | "ok" | "never";
  severity: "critical" | "warning" | "info";
  notifyEmail: string;
}

const INITIAL_ALERTS: Alert[] = [
  {
    id: "a1",
    name: "Revenue Drop Alert",
    condition: "Daily revenue < ₹10,000",
    schedule: "Every 1 hour",
    status: "active",
    lastTriggered: "2026-03-12 09:00",
    lastStatus: "triggered",
    severity: "critical",
    notifyEmail: "ops@company.com",
  },
  {
    id: "a2",
    name: "Low Stock Warning",
    condition: "Product stock < 100 units",
    schedule: "Every 6 hours",
    status: "active",
    lastTriggered: "2026-03-13 18:00",
    lastStatus: "triggered",
    severity: "warning",
    notifyEmail: "inventory@company.com",
  },
  {
    id: "a3",
    name: "Failed Transactions Spike",
    condition: "Failed transactions > 5 in 1 hour",
    schedule: "Every 15 minutes",
    status: "active",
    lastTriggered: null,
    lastStatus: "ok",
    severity: "critical",
    notifyEmail: "finance@company.com",
  },
  {
    id: "a4",
    name: "New Platinum Signup",
    condition: "New customer tier = Platinum",
    schedule: "Real-time",
    status: "paused",
    lastTriggered: "2026-03-10 14:22",
    lastStatus: "triggered",
    severity: "info",
    notifyEmail: "crm@company.com",
  },
  {
    id: "a5",
    name: "Order Volume Drop",
    condition: "Orders per day < 5",
    schedule: "Daily at 23:59",
    status: "paused",
    lastTriggered: null,
    lastStatus: "never",
    severity: "warning",
    notifyEmail: "ops@company.com",
  },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

const SCHEDULE_OPTIONS = ["Real-time", "Every 15 minutes", "Every 1 hour", "Every 6 hours", "Daily at 23:59"];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", condition: "", schedule: "Every 1 hour", severity: "warning", notifyEmail: "" });
  const [saved, setSaved] = useState(false);

  const toggleStatus = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a
      )
    );
  };

  const deleteAlert = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: Alert = {
      id: `a-${Date.now()}`,
      name: form.name,
      condition: form.condition,
      schedule: form.schedule,
      status: "active",
      lastTriggered: null,
      lastStatus: "never",
      severity: form.severity as Alert["severity"],
      notifyEmail: form.notifyEmail,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setSaved(true);
    setTimeout(() => {
      setShowForm(false);
      setSaved(false);
      setForm({ name: "", condition: "", schedule: "Every 1 hour", severity: "warning", notifyEmail: "" });
    }, 900);
  };

  return (
    <div className="al-root">
      {/* Header */}
      <div className="al-header">
        <div className="al-header-left">
          <BellRing size={20} className="al-header-icon" />
          <div>
            <h1 className="al-title">Alerts</h1>
            <p className="al-subtitle">{alerts.filter((a) => a.status === "active").length} active · {alerts.filter((a) => a.status === "paused").length} paused</p>
          </div>
        </div>
        <button className="al-new-btn" onClick={() => setShowForm(true)}>
          <Plus size={15} /> New Alert
        </button>
      </div>

      {/* Stats bar */}
      <div className="al-stats">
        {[
          { label: "Total Alerts", value: alerts.length, icon: BellRing, color: "#f97316" },
          { label: "Triggered Today", value: alerts.filter((a) => a.lastStatus === "triggered").length, icon: AlertTriangle, color: "#ef4444" },
          { label: "Healthy", value: alerts.filter((a) => a.lastStatus === "ok").length, icon: Check, color: "#22c55e" },
          { label: "Active", value: alerts.filter((a) => a.status === "active").length, icon: Activity, color: "#3b82f6" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="al-stat-card">
              <div className="al-stat-icon" style={{ color: s.color, background: `${s.color}18` }}>
                <Icon size={16} />
              </div>
              <div className="al-stat-val">{s.value}</div>
              <div className="al-stat-label">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Alert List */}
      <div className="al-list">
        {alerts.map((a) => (
          <div key={a.id} className={`al-card ${a.status}`}>
            <div
              className="al-severity-bar"
              style={{ background: SEVERITY_COLORS[a.severity] }}
            />
            <div className="al-card-body">
              <div className="al-card-top">
                <div className="al-card-info">
                  <div className="al-card-name">{a.name}</div>
                  <div className="al-card-condition">{a.condition}</div>
                </div>
                <div className="al-card-actions">
                  <span
                    className="al-severity-badge"
                    style={{
                      color: SEVERITY_COLORS[a.severity],
                      background: `${SEVERITY_COLORS[a.severity]}18`,
                      border: `1px solid ${SEVERITY_COLORS[a.severity]}30`,
                    }}
                  >
                    {a.severity}
                  </span>
                  <button
                    className={`al-toggle-btn ${a.status}`}
                    onClick={() => toggleStatus(a.id)}
                    title={a.status === "active" ? "Pause alert" : "Enable alert"}
                  >
                    {a.status === "active" ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    {a.status === "active" ? "Active" : "Paused"}
                  </button>
                  <button className="al-icon-btn" title="Edit" onClick={() => {}}>
                    <Pencil size={14} />
                  </button>
                  <button className="al-icon-btn danger" title="Delete" onClick={() => deleteAlert(a.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="al-card-meta">
                <span><Clock size={11} /> {a.schedule}</span>
                <span>
                  {a.lastStatus === "triggered" && <span className="al-meta-dot triggered" />}
                  {a.lastStatus === "ok" && <span className="al-meta-dot ok" />}
                  {a.lastStatus === "never" && <span className="al-meta-dot never" />}
                  {a.lastStatus === "triggered"
                    ? `Last triggered: ${a.lastTriggered}`
                    : a.lastStatus === "ok"
                    ? "All clear"
                    : "Never triggered"}
                </span>
                <span style={{ marginLeft: "auto", color: "#475569" }}>📧 {a.notifyEmail}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Alert Modal */}
      {showForm && (
        <div className="al-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="al-modal" onClick={(e) => e.stopPropagation()}>
            <div className="al-modal-header">
              <h2>Create New Alert</h2>
              <button className="al-icon-btn" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>

            <form className="al-form" onSubmit={submitForm}>
              <div className="al-form-group">
                <label>Alert Name</label>
                <input
                  placeholder="e.g. Revenue Drop Alert"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="al-form-group">
                <label>Condition</label>
                <input
                  placeholder="e.g. Daily revenue < ₹10,000"
                  value={form.condition}
                  onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
                  required
                />
              </div>
              <div className="al-form-row">
                <div className="al-form-group">
                  <label>Schedule</label>
                  <div className="al-select-wrap">
                    <select
                      value={form.schedule}
                      onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
                    >
                      {SCHEDULE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={13} className="al-select-arrow" />
                  </div>
                </div>
                <div className="al-form-group">
                  <label>Severity</label>
                  <div className="al-select-wrap">
                    <select
                      value={form.severity}
                      onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                    </select>
                    <ChevronDown size={13} className="al-select-arrow" />
                  </div>
                </div>
              </div>
              <div className="al-form-group">
                <label>Notify Email</label>
                <input
                  type="email"
                  placeholder="notify@company.com"
                  value={form.notifyEmail}
                  onChange={(e) => setForm((f) => ({ ...f, notifyEmail: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="al-submit-btn" disabled={saved}>
                {saved ? <><Check size={14} /> Saved!</> : <><Plus size={14} /> Create Alert</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
