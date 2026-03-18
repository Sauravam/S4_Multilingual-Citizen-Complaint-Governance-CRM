"use client";

import React, { useState } from "react";
import {
  Server,
  Plus,
  X,
  Play,
  Square,
  Loader2,
  ChevronDown,
  Zap,
  Clock,
  Check,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

/* ─── Types & Mock Data ─── */
type WarehouseStatus = "running" | "stopped" | "starting" | "stopping";
type WarehouseSize = "X-Small" | "Small" | "Medium" | "Large" | "X-Large";

interface Warehouse {
  id: string;
  name: string;
  size: WarehouseSize;
  clusters: number;
  status: WarehouseStatus;
  autoStop: string;
  spotInstance: boolean;
  creator: string;
  createdAt: string;
  queriesRunning: number;
}

const SIZE_CREDITS: Record<WarehouseSize, number> = {
  "X-Small": 1,
  Small: 2,
  Medium: 4,
  Large: 8,
  "X-Large": 16,
};

const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: "wh1",
    name: "prod-analytics",
    size: "Large",
    clusters: 3,
    status: "running",
    autoStop: "30 min",
    spotInstance: false,
    creator: "DE",
    createdAt: "2026-02-15",
    queriesRunning: 4,
  },
  {
    id: "wh2",
    name: "dev-workspace",
    size: "Small",
    clusters: 1,
    status: "stopped",
    autoStop: "10 min",
    spotInstance: true,
    creator: "DE",
    createdAt: "2026-03-01",
    queriesRunning: 0,
  },
  {
    id: "wh3",
    name: "ml-feature-store",
    size: "Medium",
    clusters: 2,
    status: "stopped",
    autoStop: "60 min",
    spotInstance: false,
    creator: "DE",
    createdAt: "2026-03-05",
    queriesRunning: 0,
  },
  {
    id: "wh4",
    name: "staging-queries",
    size: "X-Small",
    clusters: 1,
    status: "running",
    autoStop: "5 min",
    spotInstance: true,
    creator: "DE",
    createdAt: "2026-03-10",
    queriesRunning: 1,
  },
];

const SIZE_OPTIONS: WarehouseSize[] = ["X-Small", "Small", "Medium", "Large", "X-Large"];
const AUTO_STOP_OPTIONS = ["5 min", "10 min", "30 min", "60 min", "Never"];

export default function SqlWarehousesPage() {
  const [warehouses, setWarehouses] = useState(INITIAL_WAREHOUSES);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", size: "Small" as WarehouseSize, autoStop: "10 min", spotInstance: false });
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const toggleWarehouse = (id: string) => {
    setWarehouses((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.status === "running" || w.status === "starting") {
          // stopping
          setTimeout(() => {
            setWarehouses((p) => p.map((x) => (x.id === id ? { ...x, status: "stopped", queriesRunning: 0 } : x)));
          }, 1500);
          return { ...w, status: "stopping" };
        } else {
          // starting
          setTimeout(() => {
            setWarehouses((p) => p.map((x) => (x.id === id ? { ...x, status: "running" } : x)));
          }, 2000);
          return { ...w, status: "starting" };
        }
      })
    );
  };

  const deleteWarehouse = (id: string) => {
    setWarehouses((prev) => prev.filter((w) => w.id !== id));
  };

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setTimeout(() => {
      const newWh: Warehouse = {
        id: `wh-${Date.now()}`,
        name: form.name,
        size: form.size,
        clusters: 1,
        status: "starting",
        autoStop: form.autoStop,
        spotInstance: form.spotInstance,
        creator: "DE",
        createdAt: new Date().toISOString().slice(0, 10),
        queriesRunning: 0,
      };
      setWarehouses((prev) => [newWh, ...prev]);
      setCreating(false);
      setCreated(true);
      setTimeout(() => {
        // transition to running
        setWarehouses((prev) =>
          prev.map((w) => (w.id === newWh.id ? { ...w, status: "running" } : w))
        );
        setShowCreate(false);
        setCreated(false);
        setForm({ name: "", size: "Small", autoStop: "10 min", spotInstance: false });
      }, 1800);
    }, 1200);
  };

  const statusColor: Record<WarehouseStatus, string> = {
    running: "#22c55e",
    stopped: "#475569",
    starting: "#f59e0b",
    stopping: "#f59e0b",
  };

  return (
    <div className="wh-root">
      {/* Header */}
      <div className="wh-header">
        <div className="wh-header-left">
          <Server size={20} className="wh-header-icon" />
          <div>
            <h1 className="wh-title">SQL Warehouses</h1>
            <p className="wh-subtitle">
              {warehouses.filter((w) => w.status === "running").length} running ·{" "}
              {warehouses.filter((w) => w.status === "stopped").length} stopped
            </p>
          </div>
        </div>
        <button className="wh-new-btn" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> Create Warehouse
        </button>
      </div>

      {/* Summary cards */}
      <div className="wh-summary">
        {[
          { label: "Total Warehouses", value: warehouses.length, color: "#f97316" },
          { label: "Running", value: warehouses.filter((w) => w.status === "running").length, color: "#22c55e" },
          { label: "Live Queries", value: warehouses.reduce((s, w) => s + w.queriesRunning, 0), color: "#3b82f6" },
          { label: "DBU/hr Active", value: warehouses.filter((w) => w.status === "running").reduce((s, w) => s + SIZE_CREDITS[w.size] * w.clusters, 0), color: "#a78bfa" },
        ].map((c) => (
          <div key={c.label} className="wh-summary-card">
            <div className="wh-summary-val" style={{ color: c.color }}>{c.value}</div>
            <div className="wh-summary-label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Warehouse table */}
      <div className="wh-table-wrap">
        <table className="wh-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Clusters</th>
              <th>Status</th>
              <th>Queries</th>
              <th>Auto-stop</th>
              <th>DBU/hr</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((w) => (
              <tr key={w.id} className="wh-row">
                <td>
                  <div className="wh-name">{w.name}</div>
                  {w.spotInstance && <span className="wh-spot-badge">Spot</span>}
                </td>
                <td><span className="wh-size-badge">{w.size}</span></td>
                <td className="wh-meta">{w.clusters}</td>
                <td>
                  <div className="wh-status" style={{ color: statusColor[w.status] }}>
                    {(w.status === "starting" || w.status === "stopping") && (
                      <Loader2 size={12} className="wh-spin" />
                    )}
                    {w.status === "running" && <span className="wh-status-dot running" />}
                    {w.status === "stopped" && <span className="wh-status-dot stopped" />}
                    <span className="wh-status-text">
                      {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="wh-meta">
                  {w.queriesRunning > 0 ? (
                    <span className="wh-queries-running">{w.queriesRunning} running</span>
                  ) : "—"}
                </td>
                <td className="wh-meta"><Clock size={10} /> {w.autoStop}</td>
                <td className="wh-meta">
                  <Zap size={11} style={{ color: "#f59e0b" }} />
                  {" "}{SIZE_CREDITS[w.size] * w.clusters}
                </td>
                <td>
                  <div className="wh-actions">
                    <button
                      className={`wh-toggle-btn ${w.status === "running" || w.status === "starting" ? "stop" : "start"}`}
                      onClick={() => toggleWarehouse(w.id)}
                      disabled={w.status === "starting" || w.status === "stopping"}
                      title={w.status === "running" ? "Stop" : "Start"}
                    >
                      {w.status === "running" ? <Square size={12} /> : w.status === "starting" || w.status === "stopping" ? <Loader2 size={12} className="wh-spin" /> : <Play size={12} />}
                      {w.status === "running" ? "Stop" : w.status === "stopped" ? "Start" : "..."}
                    </button>
                    <button className="wh-icon-btn" title="Delete" onClick={() => deleteWarehouse(w.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="wh-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="wh-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wh-modal-header">
              <h2>Create SQL Warehouse</h2>
              <button className="wh-icon-btn" onClick={() => setShowCreate(false)}><X size={16} /></button>
            </div>
            <form className="wh-form" onSubmit={submitCreate}>
              <div className="wh-form-group">
                <label>Warehouse Name</label>
                <input
                  placeholder="e.g. my-warehouse"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                  required
                />
              </div>
              <div className="wh-form-row">
                <div className="wh-form-group">
                  <label>Cluster Size</label>
                  <div className="wh-select-wrap">
                    <select value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value as WarehouseSize }))}>
                      {SIZE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s} ({SIZE_CREDITS[s]} DBU/hr)</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="wh-select-arrow" />
                  </div>
                </div>
                <div className="wh-form-group">
                  <label>Auto-stop after</label>
                  <div className="wh-select-wrap">
                    <select value={form.autoStop} onChange={(e) => setForm((f) => ({ ...f, autoStop: e.target.value }))}>
                      {AUTO_STOP_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={13} className="wh-select-arrow" />
                  </div>
                </div>
              </div>
              <div className="wh-form-check">
                <input
                  type="checkbox"
                  id="spot"
                  checked={form.spotInstance}
                  onChange={(e) => setForm((f) => ({ ...f, spotInstance: e.target.checked }))}
                />
                <label htmlFor="spot">Use spot instances (lower cost, may be interrupted)</label>
              </div>
              <button type="submit" className="wh-submit-btn" disabled={creating || created}>
                {created ? <><Check size={14} /> Created!</> : creating ? <><Loader2 size={14} className="wh-spin" /> Creating…</> : <><Plus size={14} /> Create Warehouse</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
