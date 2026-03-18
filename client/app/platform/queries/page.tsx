"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Play,
  Star,
  StarOff,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Code2,
  Tag,
} from "lucide-react";

/* ─── Mock Data ─── */
interface SavedQuery {
  id: string;
  name: string;
  sql: string;
  description: string;
  lastRun: string;
  lastStatus: "success" | "error" | "never";
  rowsReturned: number | null;
  executionMs: number | null;
  starred: boolean;
  tags: string[];
  createdAt: string;
}

const MOCK_QUERIES: SavedQuery[] = [
  {
    id: "q1",
    name: "Gold Tier Customers",
    sql: "SELECT customer_id, name, email, city\nFROM customers\nWHERE tier = 'Gold';",
    description: "All customers in the Gold loyalty tier with contact details.",
    lastRun: "2 min ago",
    lastStatus: "success",
    rowsReturned: 4,
    executionMs: 142,
    starred: true,
    tags: ["customers", "crm"],
    createdAt: "2026-03-10",
  },
  {
    id: "q2",
    name: "Regional Revenue Summary",
    sql: "SELECT region, SUM(revenue) AS total_revenue,\n       SUM(units_sold) AS total_units\nFROM sales_data\nGROUP BY region\nORDER BY total_revenue DESC;",
    description: "Aggregated revenue and unit sales grouped by region.",
    lastRun: "1 hr ago",
    lastStatus: "success",
    rowsReturned: 4,
    executionMs: 287,
    starred: true,
    tags: ["sales", "revenue"],
    createdAt: "2026-03-11",
  },
  {
    id: "q3",
    name: "Recent Orders",
    sql: "SELECT *\nFROM orders\nWHERE order_date >= '2026-03-12'\nORDER BY order_date DESC\nLIMIT 50;",
    description: "Latest 50 orders placed since March 12.",
    lastRun: "3 hr ago",
    lastStatus: "success",
    rowsReturned: 12,
    executionMs: 198,
    starred: false,
    tags: ["orders"],
    createdAt: "2026-03-12",
  },
  {
    id: "q4",
    name: "Failed Transactions",
    sql: "SELECT txn_id, order_id, payment_method, amount, status, txn_date\nFROM transactions\nWHERE status = 'Failed';",
    description: "All failed payment transactions for investigation.",
    lastRun: "6 hr ago",
    lastStatus: "success",
    rowsReturned: 1,
    executionMs: 105,
    starred: false,
    tags: ["transactions", "finance"],
    createdAt: "2026-03-12",
  },
  {
    id: "q5",
    name: "Product Inventory Low Stock",
    sql: "SELECT product_id, product_name, category, stock\nFROM products\nWHERE stock < 200\nORDER BY stock ASC;",
    description: "Products with fewer than 200 units in stock.",
    lastRun: "Yesterday",
    lastStatus: "success",
    rowsReturned: 3,
    executionMs: 88,
    starred: false,
    tags: ["products", "inventory"],
    createdAt: "2026-03-09",
  },
  {
    id: "q6",
    name: "Platinum Customer Orders",
    sql: "SELECT c.name, o.order_id, o.price, o.quantity\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nWHERE c.tier = 'Platinum';",
    description: "Cross-join of platinum customers with their orders.",
    lastRun: "2 days ago",
    lastStatus: "error",
    rowsReturned: null,
    executionMs: null,
    starred: false,
    tags: ["customers", "orders"],
    createdAt: "2026-03-08",
  },
  {
    id: "q7",
    name: "Daily Sales Trend",
    sql: "SELECT sale_date, SUM(revenue) AS daily_revenue\nFROM sales_data\nGROUP BY sale_date\nORDER BY sale_date;",
    description: "Revenue aggregated per day for trend analysis.",
    lastRun: "Never",
    lastStatus: "never",
    rowsReturned: null,
    executionMs: null,
    starred: false,
    tags: ["sales", "analytics"],
    createdAt: "2026-03-13",
  },
];

const STATUS_OPTIONS = ["All", "Success", "Error", "Never Run"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

export default function QueriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [queries, setQueries] = useState(MOCK_QUERIES);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return queries.filter((q) => {
      const matchText =
        q.name.toLowerCase().includes(search.toLowerCase()) ||
        q.sql.toLowerCase().includes(search.toLowerCase()) ||
        q.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Success" && q.lastStatus === "success") ||
        (statusFilter === "Error" && q.lastStatus === "error") ||
        (statusFilter === "Never Run" && q.lastStatus === "never");
      return matchText && matchStatus;
    });
  }, [search, statusFilter, queries]);

  const starredFirst = useMemo(() => {
    return [...filtered].sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
  }, [filtered]);

  const toggleStar = (id: string) => {
    setQueries((prev) =>
      prev.map((q) => (q.id === id ? { ...q, starred: !q.starred } : q))
    );
  };

  const deleteQuery = (id: string) => {
    setQueries((prev) => prev.filter((q) => q.id !== id));
  };

  const copySQL = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const openInEditor = (sql: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("genie_prefill_sql", sql);
    }
    router.push("/platform/sql-editor");
  };

  return (
    <div className="qp-root">
      {/* Header */}
      <div className="qp-header">
        <div className="qp-header-left">
          <Code2 size={20} className="qp-header-icon" />
          <div>
            <h1 className="qp-title">Saved Queries</h1>
            <p className="qp-subtitle">{queries.length} queries saved in your workspace</p>
          </div>
        </div>
        <button className="qp-new-btn" onClick={() => router.push("/platform/sql-editor")}>
          <Plus size={15} /> New Query
        </button>
      </div>

      {/* Toolbar */}
      <div className="qp-toolbar">
        <div className="qp-search-wrap">
          <Search size={14} className="qp-search-icon" />
          <input
            className="qp-search"
            placeholder="Search queries, SQL, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="qp-filter-group">
          <Filter size={13} style={{ color: "#64748b" }} />
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              className={`qp-filter-btn ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="qp-list">
        {starredFirst.length === 0 ? (
          <div className="qp-empty">
            <Code2 size={32} style={{ color: "#334155", marginBottom: 12 }} />
            <p>No queries match your search.</p>
          </div>
        ) : (
          starredFirst.map((q) => (
            <div key={q.id} className={`qp-card ${expanded === q.id ? "expanded" : ""}`}>
              {/* Card header */}
              <div className="qp-card-header" onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
                <div className="qp-card-left">
                  <button
                    className="qp-star-btn"
                    onClick={(e) => { e.stopPropagation(); toggleStar(q.id); }}
                    title={q.starred ? "Unstar" : "Star"}
                  >
                    {q.starred ? <Star size={14} style={{ color: "#f59e0b", fill: "#f59e0b" }} /> : <StarOff size={14} />}
                  </button>
                  <div>
                    <div className="qp-card-name">{q.name}</div>
                    <div className="qp-card-desc">{q.description}</div>
                  </div>
                </div>
                <div className="qp-card-right">
                  <div className="qp-tags">
                    {q.tags.map((t) => (
                      <span key={t} className="qp-tag">
                        <Tag size={10} /> {t}
                      </span>
                    ))}
                  </div>
                  <div className={`qp-status-badge ${q.lastStatus}`}>
                    {q.lastStatus === "success" && <CheckCircle2 size={11} />}
                    {q.lastStatus === "error" && <XCircle size={11} />}
                    {q.lastStatus === "never" && <Clock size={11} />}
                    {q.lastStatus === "success" && `${q.rowsReturned} rows · ${q.executionMs}ms`}
                    {q.lastStatus === "error" && "Error"}
                    {q.lastStatus === "never" && "Never Run"}
                  </div>
                  <div className="qp-last-run">
                    <Clock size={11} /> {q.lastRun}
                  </div>
                </div>
              </div>

              {/* Expanded SQL preview */}
              {expanded === q.id && (
                <div className="qp-card-body">
                  <div className="qp-sql-pre">
                    <pre>{q.sql}</pre>
                  </div>
                  <div className="qp-card-actions">
                    <button className="qp-action-btn primary" onClick={() => openInEditor(q.sql)}>
                      <Play size={13} /> Open in Editor
                    </button>
                    <button className="qp-action-btn" onClick={() => copySQL(q.id, q.sql)}>
                      <Copy size={13} /> {copied === q.id ? "Copied!" : "Copy SQL"}
                    </button>
                    <button
                      className="qp-action-btn danger"
                      onClick={() => deleteQuery(q.id)}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                    <span className="qp-created-at">Created {q.createdAt}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
