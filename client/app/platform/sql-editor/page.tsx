"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Database,
  Play,
  Plus,
  Save,
  Trash2,
  Copy,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  History,
  Bell,
  X,
  Download,
  Maximize2,
  Minimize2,
  Terminal,
  Table2,
  Hash,
  Calendar,
  Type,
  Clock,
  Check,
  AlertCircle,
  Columns3,
} from "lucide-react";

/* =============================================
   MOCK DATA
============================================= */

interface Column {
  name: string;
  type: string;
}
interface TableSchema {
  columns: Column[];
  data: Record<string, string | number>[];
}

const BRONZE_TABLES: Record<string, TableSchema> = {
  customers: {
    columns: [
      { name: "customer_id", type: "INT" },
      { name: "name", type: "VARCHAR" },
      { name: "email", type: "VARCHAR" },
      { name: "city", type: "VARCHAR" },
      { name: "signup_date", type: "DATE" },
      { name: "tier", type: "VARCHAR" },
    ],
    data: [
      { customer_id: 1, name: "Rahul Sharma", email: "rahul@example.com", city: "Mumbai", signup_date: "2025-08-14", tier: "Gold" },
      { customer_id: 2, name: "Amit Patel", email: "amit@example.com", city: "Delhi", signup_date: "2025-09-02", tier: "Silver" },
      { customer_id: 3, name: "Priya Nair", email: "priya@example.com", city: "Bangalore", signup_date: "2025-07-20", tier: "Platinum" },
      { customer_id: 4, name: "Sneha Gupta", email: "sneha@example.com", city: "Pune", signup_date: "2025-10-11", tier: "Gold" },
      { customer_id: 5, name: "Vikram Singh", email: "vikram@example.com", city: "Hyderabad", signup_date: "2025-06-05", tier: "Silver" },
      { customer_id: 6, name: "Ananya Das", email: "ananya@example.com", city: "Kolkata", signup_date: "2025-11-18", tier: "Gold" },
      { customer_id: 7, name: "Rohan Mehta", email: "rohan@example.com", city: "Chennai", signup_date: "2025-12-01", tier: "Platinum" },
      { customer_id: 8, name: "Kavita Joshi", email: "kavita@example.com", city: "Jaipur", signup_date: "2026-01-09", tier: "Silver" },
      { customer_id: 9, name: "Deepak Kumar", email: "deepak@example.com", city: "Lucknow", signup_date: "2026-01-22", tier: "Gold" },
      { customer_id: 10, name: "Meera Reddy", email: "meera@example.com", city: "Ahmedabad", signup_date: "2026-02-14", tier: "Platinum" },
      { customer_id: 11, name: "Suresh Iyer", email: "suresh@example.com", city: "Mumbai", signup_date: "2026-02-28", tier: "Silver" },
      { customer_id: 12, name: "Fatima Khan", email: "fatima@example.com", city: "Delhi", signup_date: "2026-03-05", tier: "Gold" },
    ],
  },
  orders: {
    columns: [
      { name: "order_id", type: "INT" },
      { name: "customer_id", type: "INT" },
      { name: "product_id", type: "INT" },
      { name: "order_date", type: "DATE" },
      { name: "price", type: "DECIMAL" },
      { name: "quantity", type: "INT" },
    ],
    data: [
      { order_id: 101, customer_id: 1, product_id: 10, order_date: "2026-03-10", price: 200, quantity: 2 },
      { order_id: 102, customer_id: 2, product_id: 11, order_date: "2026-03-10", price: 150, quantity: 1 },
      { order_id: 103, customer_id: 3, product_id: 12, order_date: "2026-03-11", price: 450, quantity: 3 },
      { order_id: 104, customer_id: 1, product_id: 13, order_date: "2026-03-11", price: 320, quantity: 1 },
      { order_id: 105, customer_id: 5, product_id: 10, order_date: "2026-03-11", price: 200, quantity: 4 },
      { order_id: 106, customer_id: 4, product_id: 14, order_date: "2026-03-12", price: 89, quantity: 2 },
      { order_id: 107, customer_id: 6, product_id: 11, order_date: "2026-03-12", price: 150, quantity: 1 },
      { order_id: 108, customer_id: 7, product_id: 15, order_date: "2026-03-12", price: 599, quantity: 1 },
      { order_id: 109, customer_id: 2, product_id: 12, order_date: "2026-03-13", price: 450, quantity: 2 },
      { order_id: 110, customer_id: 8, product_id: 10, order_date: "2026-03-13", price: 200, quantity: 1 },
      { order_id: 111, customer_id: 9, product_id: 16, order_date: "2026-03-13", price: 1249, quantity: 1 },
      { order_id: 112, customer_id: 10, product_id: 13, order_date: "2026-03-14", price: 320, quantity: 2 },
      { order_id: 113, customer_id: 11, product_id: 14, order_date: "2026-03-14", price: 89, quantity: 5 },
      { order_id: 114, customer_id: 3, product_id: 15, order_date: "2026-03-14", price: 599, quantity: 1 },
      { order_id: 115, customer_id: 12, product_id: 16, order_date: "2026-03-14", price: 1249, quantity: 1 },
    ],
  },
  products: {
    columns: [
      { name: "product_id", type: "INT" },
      { name: "product_name", type: "VARCHAR" },
      { name: "category", type: "VARCHAR" },
      { name: "price", type: "DECIMAL" },
      { name: "stock", type: "INT" },
    ],
    data: [
      { product_id: 10, product_name: "Wireless Mouse", category: "Electronics", price: 200, stock: 340 },
      { product_id: 11, product_name: "USB-C Hub", category: "Electronics", price: 150, stock: 520 },
      { product_id: 12, product_name: "Mechanical Keyboard", category: "Electronics", price: 450, stock: 180 },
      { product_id: 13, product_name: "Standing Desk Mat", category: "Accessories", price: 320, stock: 95 },
      { product_id: 14, product_name: "Cable Organizer", category: "Accessories", price: 89, stock: 1200 },
      { product_id: 15, product_name: "Monitor Light Bar", category: "Lighting", price: 599, stock: 210 },
      { product_id: 16, product_name: "Noise Cancelling Headphones", category: "Audio", price: 1249, stock: 78 },
    ],
  },
  transactions: {
    columns: [
      { name: "txn_id", type: "INT" },
      { name: "order_id", type: "INT" },
      { name: "payment_method", type: "VARCHAR" },
      { name: "amount", type: "DECIMAL" },
      { name: "status", type: "VARCHAR" },
      { name: "txn_date", type: "DATETIME" },
    ],
    data: [
      { txn_id: 5001, order_id: 101, payment_method: "UPI", amount: 400, status: "Success", txn_date: "2026-03-10 09:14:22" },
      { txn_id: 5002, order_id: 102, payment_method: "Credit Card", amount: 150, status: "Success", txn_date: "2026-03-10 10:02:11" },
      { txn_id: 5003, order_id: 103, payment_method: "Debit Card", amount: 1350, status: "Success", txn_date: "2026-03-11 11:45:30" },
      { txn_id: 5004, order_id: 104, payment_method: "UPI", amount: 320, status: "Success", txn_date: "2026-03-11 14:22:08" },
      { txn_id: 5005, order_id: 105, payment_method: "Net Banking", amount: 800, status: "Failed", txn_date: "2026-03-11 15:30:44" },
      { txn_id: 5006, order_id: 106, payment_method: "UPI", amount: 178, status: "Success", txn_date: "2026-03-12 08:12:55" },
      { txn_id: 5007, order_id: 107, payment_method: "Credit Card", amount: 150, status: "Success", txn_date: "2026-03-12 09:44:18" },
      { txn_id: 5008, order_id: 108, payment_method: "Credit Card", amount: 599, status: "Pending", txn_date: "2026-03-12 12:08:33" },
      { txn_id: 5009, order_id: 109, payment_method: "UPI", amount: 900, status: "Success", txn_date: "2026-03-13 10:55:02" },
      { txn_id: 5010, order_id: 110, payment_method: "Debit Card", amount: 200, status: "Success", txn_date: "2026-03-13 13:30:19" },
      { txn_id: 5011, order_id: 111, payment_method: "Credit Card", amount: 1249, status: "Success", txn_date: "2026-03-13 16:42:07" },
      { txn_id: 5012, order_id: 112, payment_method: "UPI", amount: 640, status: "Success", txn_date: "2026-03-14 07:58:41" },
    ],
  },
  sales_data: {
    columns: [
      { name: "sale_id", type: "INT" },
      { name: "product_id", type: "INT" },
      { name: "region", type: "VARCHAR" },
      { name: "units_sold", type: "INT" },
      { name: "revenue", type: "DECIMAL" },
      { name: "sale_date", type: "DATE" },
    ],
    data: [
      { sale_id: 1, product_id: 10, region: "North", units_sold: 120, revenue: 24000, sale_date: "2026-03-10" },
      { sale_id: 2, product_id: 11, region: "South", units_sold: 85, revenue: 12750, sale_date: "2026-03-10" },
      { sale_id: 3, product_id: 12, region: "West", units_sold: 42, revenue: 18900, sale_date: "2026-03-11" },
      { sale_id: 4, product_id: 13, region: "East", units_sold: 60, revenue: 19200, sale_date: "2026-03-11" },
      { sale_id: 5, product_id: 14, region: "North", units_sold: 300, revenue: 26700, sale_date: "2026-03-12" },
      { sale_id: 6, product_id: 15, region: "South", units_sold: 28, revenue: 16772, sale_date: "2026-03-12" },
      { sale_id: 7, product_id: 16, region: "West", units_sold: 15, revenue: 18735, sale_date: "2026-03-13" },
      { sale_id: 8, product_id: 10, region: "East", units_sold: 90, revenue: 18000, sale_date: "2026-03-13" },
      { sale_id: 9, product_id: 11, region: "North", units_sold: 110, revenue: 16500, sale_date: "2026-03-14" },
      { sale_id: 10, product_id: 12, region: "South", units_sold: 55, revenue: 24750, sale_date: "2026-03-14" },
    ],
  },
};

const COLUMN_TYPE_ICON: Record<string, React.ReactNode> = {
  INT: <Hash size={12} />,
  DECIMAL: <Hash size={12} />,
  VARCHAR: <Type size={12} />,
  DATE: <Calendar size={12} />,
  DATETIME: <Clock size={12} />,
};

/* =============================================
   TYPES
============================================= */

interface SqlCell {
  id: string;
  query: string;
  status: "idle" | "running" | "completed" | "error";
  result: Record<string, string | number>[] | null;
  columns: string[] | null;
  error: string | null;
  executedAt: string | null;
  executionTime: number | null;
  currentPage: number;
  expanded: boolean;
}

interface HistoryEntry {
  id: string;
  query: string;
  timestamp: string;
  status: "success" | "error";
  rowCount: number;
}

/* =============================================
   HELPER: Parse table name from SQL
============================================= */

function parseTableFromQuery(query: string): string | null {
  const cleaned = query.replace(/\s+/g, " ").trim().toLowerCase();
  // Match FROM <table>
  const fromMatch = cleaned.match(/from\s+([a-z_]+)/i);
  if (fromMatch) return fromMatch[1];
  return null;
}

function parseLimitFromQuery(query: string): number | null {
  const match = query.match(/limit\s+(\d+)/i);
  if (match) return parseInt(match[1], 10);
  return null;
}

/* =============================================
   COMPONENT
============================================= */

const ROWS_PER_PAGE = 10;

export default function SqlEditorPage() {
  /* ---------- state ---------- */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const [cells, setCells] = useState<SqlCell[]>([
    {
      id: "cell-1",
      query: "SELECT *\nFROM orders\nLIMIT 100;",
      status: "idle",
      result: null,
      columns: null,
      error: null,
      executedAt: null,
      executionTime: null,
      currentPage: 1,
      expanded: false,
    },
    {
      id: "cell-2",
      query: "SELECT customer_id, name, email, city\nFROM customers\nWHERE tier = 'Gold';",
      status: "idle",
      result: null,
      columns: null,
      error: null,
      executedAt: null,
      executionTime: null,
      currentPage: 1,
      expanded: false,
    },
    {
      id: "cell-3",
      query: "SELECT region, SUM(revenue) AS total_revenue,\n       SUM(units_sold) AS total_units\nFROM sales_data\nGROUP BY region;",
      status: "idle",
      result: null,
      columns: null,
      error: null,
      executedAt: null,
      executionTime: null,
      currentPage: 1,
      expanded: false,
    },
  ]);

  const cellIdCounter = useRef(4);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- toast helper ---------- */
  const showToast = useCallback((message: string, type = "success") => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  /* ---------- cell helpers ---------- */
  const updateCell = useCallback(
    (id: string, updates: Partial<SqlCell>) => {
      setCells((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    },
    []
  );

  const addCell = useCallback(
    (afterId?: string, initialQuery = "") => {
      const newCell: SqlCell = {
        id: `cell-${cellIdCounter.current++}`,
        query: initialQuery,
        status: "idle",
        result: null,
        columns: null,
        error: null,
        executedAt: null,
        executionTime: null,
        currentPage: 1,
        expanded: false,
      };
      setCells((prev) => {
        if (!afterId) return [...prev, newCell];
        const idx = prev.findIndex((c) => c.id === afterId);
        if (idx === -1) return [...prev, newCell];
        const next = [...prev];
        next.splice(idx + 1, 0, newCell);
        return next;
      });
    },
    []
  );

  const deleteCell = useCallback(
    (id: string) => {
      setCells((prev) => {
        if (prev.length <= 1) return prev; // keep at least one
        return prev.filter((c) => c.id !== id);
      });
    },
    []
  );

  /* ---------- Run query ---------- */
  const runCell = useCallback(
    (id: string) => {
      const cell = cells.find((c) => c.id === id);
      if (!cell || !cell.query.trim()) return;

      updateCell(id, { status: "running", result: null, columns: null, error: null });

      const delay = 600 + Math.random() * 900;
      setTimeout(() => {
        const tableName = parseTableFromQuery(cell.query);
        if (!tableName || !BRONZE_TABLES[tableName]) {
          updateCell(id, {
            status: "error",
            error: `Table "${tableName || "unknown"}" not found in the Bronze Layer. Available tables: ${Object.keys(BRONZE_TABLES).join(", ")}`,
            executedAt: new Date().toLocaleTimeString(),
            executionTime: Math.round(delay),
          });
          setHistory((prev) => [
            {
              id: `hist-${Date.now()}`,
              query: cell.query,
              timestamp: new Date().toLocaleString(),
              status: "error",
              rowCount: 0,
            },
            ...prev,
          ]);
          return;
        }

        const schema = BRONZE_TABLES[tableName];
        let resultData = [...schema.data];
        const limit = parseLimitFromQuery(cell.query);
        if (limit !== null) resultData = resultData.slice(0, limit);

        const cols = schema.columns.map((c) => c.name);

        updateCell(id, {
          status: "completed",
          result: resultData,
          columns: cols,
          error: null,
          executedAt: new Date().toLocaleTimeString(),
          executionTime: Math.round(delay),
          currentPage: 1,
        });

        setHistory((prev) => [
          {
            id: `hist-${Date.now()}`,
            query: cell.query,
            timestamp: new Date().toLocaleString(),
            status: "success",
            rowCount: resultData.length,
          },
          ...prev,
        ]);
      }, delay);
    },
    [cells, updateCell]
  );

  /* ---------- Bulk actions ---------- */
  const runAllCells = useCallback(() => {
    cells.forEach((c) => runCell(c.id));
  }, [cells, runCell]);

  const clearAllOutputs = useCallback(() => {
    setCells((prev) =>
      prev.map((c) => ({
        ...c,
        status: "idle",
        result: null,
        columns: null,
        error: null,
        executedAt: null,
        executionTime: null,
        currentPage: 1,
        expanded: false,
      }))
    );
    showToast("All outputs cleared", "info");
  }, [showToast]);

  const saveQuery = useCallback(() => {
    showToast("Queries saved to workspace", "success");
  }, [showToast]);

  /* ---------- Copy ---------- */
  const copyQuery = useCallback(
    (query: string) => {
      navigator.clipboard.writeText(query);
      showToast("Query copied to clipboard", "info");
    },
    [showToast]
  );

  /* ---------- CSV download ---------- */
  const downloadCSV = useCallback((columns: string[], data: Record<string, string | number>[]) => {
    const header = columns.join(",");
    const rows = data.map((row) => columns.map((col) => `"${row[col]}"`).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  /* ---------- Line numbers ---------- */
  const getLineNumbers = (text: string) => {
    const lines = text.split("\n").length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  };

  /* ---------- Filtered sidebar tables ---------- */
  const filteredTables = Object.keys(BRONZE_TABLES).filter((t) =>
    t.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  /* =============================================
     RENDER
  ============================================= */

  return (
    <div className="sql-editor-root">
      {/* ===== TOP BAR ===== */}
      <header className="sql-topbar">
        <div className="sql-topbar-left">
          <div className="sql-topbar-logo">
            <Database size={18} />
          </div>
          <span className="sql-topbar-title">Data Warehouse SQL Workspace</span>
        </div>

        <div className="sql-topbar-center">
          <button className="sql-topbar-btn primary" onClick={runAllCells} id="run-all-btn">
            <Play size={14} /> Run Query
          </button>
          <button className="sql-topbar-btn" onClick={() => addCell()} id="add-cell-btn">
            <Plus size={14} /> Add New Cell
          </button>
          <button className="sql-topbar-btn" onClick={saveQuery} id="save-btn">
            <Save size={14} /> Save Query
          </button>
          <button className="sql-topbar-btn" onClick={clearAllOutputs} id="clear-btn">
            <Trash2 size={14} /> Clear Output
          </button>
        </div>

        <div className="sql-topbar-right">
          <button
            className="sql-topbar-icon-btn"
            title="Query History"
            onClick={() => setHistoryOpen(true)}
            id="history-btn"
          >
            <History size={18} />
          </button>
          <button className="sql-topbar-icon-btn" title="Notifications" id="notif-btn">
            <Bell size={18} />
            <span className="notif-dot" />
          </button>
          <div className="sql-user-avatar" title="User Profile" id="user-avatar">
            DE
          </div>
        </div>
      </header>

      {/* ===== BODY ===== */}
      <div className="sql-body">
        {/* Floating sidebar open button */}
        <button
          className={`ws-open-btn ${!sidebarOpen ? "show" : ""}`}
          onClick={() => setSidebarOpen(true)}
          title="Open Data Explorer"
        >
          <PanelLeftOpen size={16} />
        </button>

        {/* ===== SIDEBAR ===== */}
        <aside className={`ws-sidebar ${!sidebarOpen ? "collapsed" : ""}`}>
          <div className="ws-sidebar-header">
            <h3>Data Explorer</h3>
            <button
              className="ws-toggle-btn"
              onClick={() => setSidebarOpen(false)}
              title="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          <div className="ws-search">
            <div className="ws-search-wrap">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search tables..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                id="sidebar-search"
              />
            </div>
          </div>

          <div className="ws-db-label">Bronze Layer Tables</div>

          <div className="ws-tables">
            {filteredTables.map((tableName) => {
              const schema = BRONZE_TABLES[tableName];
              const isOpen = expandedTable === tableName;
              return (
                <div className="ws-table-item" key={tableName}>
                  <div
                    className={`ws-table-header ${isOpen ? "active" : ""}`}
                    onClick={() => setExpandedTable(isOpen ? null : tableName)}
                  >
                    <div className="ws-table-icon">
                      <Table2 size={14} />
                    </div>
                    <span className="ws-table-name">{tableName}</span>
                    <ChevronRight
                      size={14}
                      className={`ws-table-chevron ${isOpen ? "open" : ""}`}
                    />
                  </div>
                  <div className={`ws-table-cols ${isOpen ? "open" : ""}`}>
                    {schema.columns.map((col) => (
                      <div className="ws-col-item" key={col.name}>
                        {COLUMN_TYPE_ICON[col.type] || <Columns3 size={12} />}
                        <span>{col.name}</span>
                        <span className="ws-col-type">{col.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ===== MAIN WORKSPACE ===== */}
        <main className="sql-main">
          <div className="sql-workspace">
            <div className="sql-workspace-header">
              <h2>SQL Query Editor</h2>
              <span>{cells.length} cell{cells.length !== 1 ? "s" : ""}</span>
            </div>

            {cells.map((cell, idx) => (
              <React.Fragment key={cell.id}>
                {/* --- CELL --- */}
                <div
                  className={`sql-cell ${cell.status}`}
                  id={cell.id}
                >
                  {/* Cell header */}
                  <div className="sql-cell-header">
                    <div className="sql-cell-label">
                      <span className="sql-cell-number">[{idx + 1}]</span>
                      <div className="sql-cell-status">
                        <span className={`dot ${cell.status}`} />
                        <span>
                          {cell.status === "idle" && "Ready"}
                          {cell.status === "running" && "Executing..."}
                          {cell.status === "completed" && `Completed · ${cell.executedAt}`}
                          {cell.status === "error" && `Error · ${cell.executedAt}`}
                        </span>
                      </div>
                    </div>
                    <div className="sql-cell-actions">
                      <button
                        className="sql-cell-action-btn run-btn"
                        title="Run cell"
                        onClick={() => runCell(cell.id)}
                      >
                        <Play size={15} />
                      </button>
                      <button
                        className="sql-cell-action-btn"
                        title="Copy query"
                        onClick={() => copyQuery(cell.query)}
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        className="sql-cell-action-btn"
                        title="Add cell below"
                        onClick={() => addCell(cell.id)}
                      >
                        <Plus size={15} />
                      </button>
                      <button
                        className="sql-cell-action-btn delete-btn"
                        title="Delete cell"
                        onClick={() => deleteCell(cell.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Editor */}
                  <div className="sql-cell-editor">
                    <div className="sql-cell-line-numbers">
                      {getLineNumbers(cell.query).map((n) => (
                        <div key={n}>{n}</div>
                      ))}
                    </div>
                    <textarea
                      className="sql-cell-textarea"
                      value={cell.query}
                      onChange={(e) => updateCell(cell.id, { query: e.target.value })}
                      placeholder="Write your SQL query here..."
                      spellCheck={false}
                      rows={Math.max(3, cell.query.split("\n").length)}
                    />
                  </div>

                  {/* Running state */}
                  {cell.status === "running" && (
                    <div className="sql-executing">
                      <div className="exec-spinner" />
                      <span>Executing query...</span>
                    </div>
                  )}

                  {/* Error output */}
                  {cell.status === "error" && cell.error && (
                    <div className="sql-error-output">
                      <AlertCircle
                        size={14}
                        style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }}
                      />
                      {cell.error}
                    </div>
                  )}

                  {/* Results */}
                  {cell.status === "completed" && cell.result && cell.columns && (
                    <div className="sql-result">
                      <div className="sql-result-header">
                        <div className="sql-result-info">
                          <span className="row-count">
                            <Check size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                            {cell.result.length} row{cell.result.length !== 1 ? "s" : ""}
                          </span>
                          <span className="exec-time">{cell.executionTime}ms</span>
                        </div>
                        <div className="sql-result-actions">
                          <button
                            className="sql-cell-action-btn"
                            title={cell.expanded ? "Collapse" : "Expand"}
                            onClick={() => updateCell(cell.id, { expanded: !cell.expanded })}
                          >
                            {cell.expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                          </button>
                          <button
                            className="sql-cell-action-btn"
                            title="Download CSV"
                            onClick={() => downloadCSV(cell.columns!, cell.result!)}
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </div>

                      <div className={`sql-result-table-wrap ${cell.expanded ? "expanded" : ""}`}>
                        <table className="sql-result-table">
                          <thead>
                            <tr>
                              {cell.columns.map((col) => (
                                <th key={col}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {cell.result
                              .slice(
                                (cell.currentPage - 1) * ROWS_PER_PAGE,
                                cell.currentPage * ROWS_PER_PAGE
                              )
                              .map((row, ri) => (
                                <tr key={ri}>
                                  {cell.columns!.map((col) => (
                                    <td key={col}>{String(row[col] ?? "")}</td>
                                  ))}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {cell.result.length > ROWS_PER_PAGE && (
                        <div className="sql-result-pagination">
                          <span>
                            Page {cell.currentPage} of{" "}
                            {Math.ceil(cell.result.length / ROWS_PER_PAGE)}
                          </span>
                          <div className="sql-pagination-btns">
                            <button
                              className="sql-page-btn"
                              disabled={cell.currentPage === 1}
                              onClick={() =>
                                updateCell(cell.id, {
                                  currentPage: cell.currentPage - 1,
                                })
                              }
                            >
                              Prev
                            </button>
                            {Array.from(
                              {
                                length: Math.ceil(cell.result.length / ROWS_PER_PAGE),
                              },
                              (_, i) => i + 1
                            ).map((p) => (
                              <button
                                key={p}
                                className={`sql-page-btn ${p === cell.currentPage ? "active" : ""}`}
                                onClick={() => updateCell(cell.id, { currentPage: p })}
                              >
                                {p}
                              </button>
                            ))}
                            <button
                              className="sql-page-btn"
                              disabled={
                                cell.currentPage ===
                                Math.ceil(cell.result.length / ROWS_PER_PAGE)
                              }
                              onClick={() =>
                                updateCell(cell.id, {
                                  currentPage: cell.currentPage + 1,
                                })
                              }
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}

            {/* Add cell at bottom */}
            <button className="sql-add-cell-btn" onClick={() => addCell()} id="add-cell-bottom">
              <Plus size={16} /> Add SQL Cell
            </button>
          </div>
        </main>
      </div>

      {/* ===== QUERY HISTORY DRAWER ===== */}
      <div
        className={`sql-history-overlay ${historyOpen ? "open" : ""}`}
        onClick={() => setHistoryOpen(false)}
      />
      <div className={`sql-history-drawer ${historyOpen ? "open" : ""}`}>
        <div className="sql-history-header">
          <h3>Query History</h3>
          <button
            className="sql-cell-action-btn"
            onClick={() => setHistoryOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="sql-history-list">
          {history.length === 0 ? (
            <div className="sql-history-empty">
              <History size={36} />
              <span>No queries executed yet</span>
              <span style={{ fontSize: 11 }}>
                Run a query to see it appear here
              </span>
            </div>
          ) : (
            history.map((entry) => (
              <div
                className="sql-history-item"
                key={entry.id}
                onClick={() => {
                  addCell(undefined, entry.query);
                  setHistoryOpen(false);
                  showToast("Query added as new cell", "info");
                }}
              >
                <div className="sql-history-item-query">{entry.query}</div>
                <div className="sql-history-item-meta">
                  <span
                    className={`status-dot ${entry.status === "success" ? "success" : "error"}`}
                  />
                  <span>{entry.status === "success" ? `${entry.rowCount} rows` : "Error"}</span>
                  <span>·</span>
                  <span>{entry.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== TOAST ===== */}
      <div className={`sql-toast ${toast ? "show" : ""} ${toast?.type || ""}`}>
        {toast?.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
        {toast?.message}
      </div>
    </div>
  );
}
