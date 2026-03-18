"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  Search,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Play,
  Copy,
  Check,
  Filter,
  Clock,
  RefreshCw,
} from "lucide-react";

/* ─── Mock History Data ─── */
interface HistoryRow {
  id: string;
  query: string;
  executedAt: string;
  status: "success" | "error";
  executionMs: number;
  rowsReturned: number | null;
  user: string;
}

const MOCK_HISTORY: HistoryRow[] = [
  {
    id: "h1",
    query: "SELECT * FROM orders WHERE order_date >= '2026-03-12' ORDER BY order_date DESC LIMIT 50;",
    executedAt: "2026-03-14 11:45:02",
    status: "success",
    executionMs: 198,
    rowsReturned: 12,
    user: "DE",
  },
  {
    id: "h2",
    query: "SELECT customer_id, name, email, city\nFROM customers\nWHERE tier = 'Gold';",
    executedAt: "2026-03-14 10:22:41",
    status: "success",
    executionMs: 142,
    rowsReturned: 4,
    user: "DE",
  },
  {
    id: "h3",
    query: "SELECT region, SUM(revenue) AS total_revenue, SUM(units_sold) AS total_units\nFROM sales_data\nGROUP BY region;",
    executedAt: "2026-03-14 09:10:15",
    status: "success",
    executionMs: 287,
    rowsReturned: 4,
    user: "DE",
  },
  {
    id: "h4",
    query: "SELECT c.name, o.order_id, o.price\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nWHERE c.tier = 'Platinum';",
    executedAt: "2026-03-14 08:55:30",
    status: "error",
    executionMs: 52,
    rowsReturned: null,
    user: "DE",
  },
  {
    id: "h5",
    query: "SELECT txn_id, order_id, payment_method, amount, status\nFROM transactions\nWHERE status != 'Success';",
    executedAt: "2026-03-13 17:30:00",
    status: "success",
    executionMs: 105,
    rowsReturned: 2,
    user: "DE",
  },
  {
    id: "h6",
    query: "SELECT product_id, product_name, category, stock\nFROM products\nWHERE stock < 200\nORDER BY stock ASC;",
    executedAt: "2026-03-13 15:10:22",
    status: "success",
    executionMs: 88,
    rowsReturned: 3,
    user: "DE",
  },
  {
    id: "h7",
    query: "SELECT sale_date, SUM(revenue) AS daily_revenue\nFROM sales_data_v2\nGROUP BY sale_date;",
    executedAt: "2026-03-13 12:45:10",
    status: "error",
    executionMs: 34,
    rowsReturned: null,
    user: "DE",
  },
  {
    id: "h8",
    query: "SELECT * FROM customers ORDER BY signup_date DESC LIMIT 5;",
    executedAt: "2026-03-12 18:05:34",
    status: "success",
    executionMs: 76,
    rowsReturned: 5,
    user: "DE",
  },
];

const STATUS_OPTIONS = ["All", "Success", "Error"] as const;
type StatusF = (typeof STATUS_OPTIONS)[number];

export default function QueryHistoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusF>("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() =>
    MOCK_HISTORY.filter((h) => {
      const textMatch = h.query.toLowerCase().includes(search.toLowerCase());
      const statusMatch =
        statusFilter === "All" ||
        (statusFilter === "Success" && h.status === "success") ||
        (statusFilter === "Error" && h.status === "error");
      return textMatch && statusMatch;
    }),
    [search, statusFilter]
  );

  const copyQuery = (id: string, q: string) => {
    navigator.clipboard.writeText(q);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const openInEditor = (q: string) => {
    if (typeof window !== "undefined") localStorage.setItem("genie_prefill_sql", q);
    router.push("/platform/sql-editor");
  };

  return (
    <div className="qh-root">
      {/* Header */}
      <div className="qh-header">
        <div className="qh-header-left">
          <History size={20} className="qh-header-icon" />
          <div>
            <h1 className="qh-title">Query History</h1>
            <p className="qh-subtitle">{MOCK_HISTORY.length} queries executed · last 7 days</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="qh-toolbar">
        <div className="qh-search-wrap">
          <Search size={14} className="qh-search-icon" />
          <input
            className="qh-search"
            placeholder="Search query text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="qh-filter-group">
          <Filter size={13} style={{ color: "#64748b" }} />
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              className={`qh-filter-btn ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="qh-table-wrap">
        <table className="qh-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Query</th>
              <th>Executed At</th>
              <th>Duration</th>
              <th>Rows</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="qh-empty">No history matches your search.</td>
              </tr>
            ) : (
              filtered.map((h) => (
                <React.Fragment key={h.id}>
                  <tr
                    className={`qh-row ${expanded === h.id ? "expanded" : ""}`}
                    onClick={() => setExpanded(expanded === h.id ? null : h.id)}
                  >
                    <td>
                      <div className={`qh-status-badge ${h.status}`}>
                        {h.status === "success" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {h.status === "success" ? "Success" : "Error"}
                      </div>
                    </td>
                    <td className="qh-query-preview">
                      <code>{h.query.slice(0, 60)}{h.query.length > 60 ? "…" : ""}</code>
                    </td>
                    <td className="qh-meta">
                      <Clock size={11} /> {h.executedAt}
                    </td>
                    <td className="qh-meta">{h.executionMs}ms</td>
                    <td className="qh-meta">
                      {h.rowsReturned != null ? h.rowsReturned : "—"}
                    </td>
                    <td>
                      {expanded === h.id ? <ChevronUp size={14} style={{ color: "#64748b" }} /> : <ChevronDown size={14} style={{ color: "#64748b" }} />}
                    </td>
                  </tr>
                  {expanded === h.id && (
                    <tr className="qh-expand-row">
                      <td colSpan={6}>
                        <div className="qh-expand-body">
                          <pre className="qh-full-sql">{h.query}</pre>
                          <div className="qh-expand-actions">
                            <button
                              className="qh-action-btn primary"
                              onClick={() => openInEditor(h.query)}
                            >
                              <Play size={13} /> Re-run in Editor
                            </button>
                            <button
                              className="qh-action-btn"
                              onClick={() => copyQuery(h.id, h.query)}
                            >
                              {copied === h.id ? <Check size={13} /> : <Copy size={13} />}
                              {copied === h.id ? "Copied!" : "Copy SQL"}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
