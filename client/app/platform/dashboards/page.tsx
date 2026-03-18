"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  RefreshCw,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";

/* ─── Mock Data ─── */
const REGIONAL_REVENUE = [
  { region: "North", revenue: 67200 },
  { region: "South", revenue: 54272 },
  { region: "West", revenue: 43635 },
  { region: "East", revenue: 37200 },
];

const DAILY_ORDERS = [
  { date: "Mar 10", orders: 5 },
  { date: "Mar 11", orders: 6 },
  { date: "Mar 12", orders: 7 },
  { date: "Mar 13", orders: 6 },
  { date: "Mar 14", orders: 5 },
];

const PAYMENT_BREAKDOWN = [
  { method: "UPI", pct: 42, color: "#f97316" },
  { method: "Credit Card", pct: 33, color: "#3b82f6" },
  { method: "Debit Card", pct: 17, color: "#22c55e" },
  { method: "Net Banking", pct: 8, color: "#a78bfa" },
];

const TOP_PRODUCTS = [
  { name: "Noise Cancelling Headphones", revenue: 18735, units: 15 },
  { name: "Mechanical Keyboard", revenue: 43650, units: 97 },
  { name: "Monitor Light Bar", revenue: 33376, units: 56 },
  { name: "Wireless Mouse", revenue: 42000, units: 210 },
  { name: "USB-C Hub", revenue: 29250, units: 195 },
];

/* ─── Bar Chart ─── */
function BarChart({ data }: { data: { region: string; revenue: number }[] }) {
  const max = Math.max(...data.map((d) => d.revenue));
  return (
    <div className="db-chart-bars">
      {data.map((d) => (
        <div key={d.region} className="db-bar-col">
          <div className="db-bar-wrap">
            <div
              className="db-bar"
              style={{ height: `${(d.revenue / max) * 100}%` }}
              title={`₹${d.revenue.toLocaleString()}`}
            />
          </div>
          <span className="db-bar-label">{d.region}</span>
          <span className="db-bar-value">₹{(d.revenue / 1000).toFixed(0)}k</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Line Chart (SVG) ─── */
function LineChartSVG({ data }: { data: { date: string; orders: number }[] }) {
  const W = 360, H = 120, pad = 20;
  const maxV = Math.max(...data.map((d) => d.orders));
  const pts = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * (W - 2 * pad),
    y: pad + (1 - d.orders / (maxV + 1)) * (H - 2 * pad),
    label: d.date,
    val: d.orders,
  }));
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0].x},${H} ${polyline} ${pts[pts.length - 1].x},${H}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="db-line-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#lineGrad)" />
      <polyline points={polyline} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#f97316" stroke="#0a0f1a" strokeWidth="2" />
          <text x={p.x} y={H - 2} textAnchor="middle" fontSize={8} fill="#475569">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Donut Chart ─── */
function DonutChart({ data }: { data: { method: string; pct: number; color: string }[] }) {
  const r = 40, cx = 60, cy = 60, strokeWidth = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="db-donut-wrap">
      <svg viewBox="0 0 120 120" width="120" height="120">
        {data.map((d, i) => {
          const dash = (d.pct / 100) * circumference;
          const gap = circumference - dash;
          const dashOffset = -offset * circumference / 100;
          offset += d.pct;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          );
        })}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize={10} fill="#e2e8f0" fontWeight="700">UPI</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize={8} fill="#94a3b8">42%</text>
      </svg>
      <div className="db-donut-legend">
        {data.map((d) => (
          <div key={d.method} className="db-legend-item">
            <span className="db-legend-dot" style={{ background: d.color }} />
            <span className="db-legend-label">{d.method}</span>
            <span className="db-legend-pct">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardsPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div className="db-root">
      {/* Page Header */}
      <div className="db-page-header">
        <div className="db-page-header-left">
          <LayoutDashboard size={20} className="db-header-icon" />
          <div>
            <h1 className="db-title">Analytics Dashboard</h1>
            <p className="db-subtitle">Platform overview — refreshed just now</p>
          </div>
        </div>
        <div className="db-page-header-right">
          <button className="db-header-btn" onClick={handleRefresh}>
            <RefreshCw size={14} className={refreshing ? "db-spin" : ""} />
            Refresh
          </button>
          <button className="db-header-btn primary">
            <Plus size={14} /> Add Widget
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="db-metrics">
        {[
          {
            label: "Total Revenue",
            value: "₹ 2,02,307",
            change: "+12.4%",
            up: true,
            icon: DollarSign,
            color: "#22c55e",
          },
          {
            label: "Total Orders",
            value: "15",
            change: "+3 today",
            up: true,
            icon: ShoppingCart,
            color: "#f97316",
          },
          {
            label: "Active Customers",
            value: "12",
            change: "+2 this week",
            up: true,
            icon: Users,
            color: "#3b82f6",
          },
          {
            label: "Avg. Order Value",
            value: "₹ 424",
            change: "-2.1%",
            up: false,
            icon: TrendingUp,
            color: "#a78bfa",
          },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="db-metric-card">
              <div className="db-metric-icon" style={{ background: `${m.color}18`, color: m.color }}>
                <Icon size={18} />
              </div>
              <div className="db-metric-body">
                <div className="db-metric-label">{m.label}</div>
                <div className="db-metric-value">{m.value}</div>
                <div className={`db-metric-change ${m.up ? "up" : "down"}`}>
                  {m.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {m.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="db-charts-row">
        {/* Bar chart */}
        <div className="db-widget">
          <div className="db-widget-header">
            <div className="db-widget-title">
              <BarChart3 size={15} /> Revenue by Region
            </div>
            <button className="db-widget-menu"><MoreHorizontal size={15} /></button>
          </div>
          <BarChart data={REGIONAL_REVENUE} />
        </div>

        {/* Line chart */}
        <div className="db-widget">
          <div className="db-widget-header">
            <div className="db-widget-title">
              <LineChart size={15} /> Daily Orders Trend
            </div>
            <button className="db-widget-menu"><MoreHorizontal size={15} /></button>
          </div>
          <div className="db-line-wrap">
            <LineChartSVG data={DAILY_ORDERS} />
          </div>
        </div>

        {/* Donut chart */}
        <div className="db-widget">
          <div className="db-widget-header">
            <div className="db-widget-title">
              <PieChart size={15} /> Payment Methods
            </div>
            <button className="db-widget-menu"><MoreHorizontal size={15} /></button>
          </div>
          <DonutChart data={PAYMENT_BREAKDOWN} />
        </div>
      </div>

      {/* Top Products Table */}
      <div className="db-widget db-full-width">
        <div className="db-widget-header">
          <div className="db-widget-title">
            <BarChart3 size={15} /> Top Products by Revenue
          </div>
          <button className="db-widget-menu"><MoreHorizontal size={15} /></button>
        </div>
        <table className="db-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Units Sold</th>
              <th>Revenue</th>
              <th>Revenue Share</th>
            </tr>
          </thead>
          <tbody>
            {TOP_PRODUCTS.sort((a, b) => b.revenue - a.revenue).map((p, i) => {
              const maxRev = Math.max(...TOP_PRODUCTS.map((x) => x.revenue));
              const pct = (p.revenue / maxRev) * 100;
              return (
                <tr key={p.name}>
                  <td className="db-rank">{i + 1}</td>
                  <td className="db-prod-name">{p.name}</td>
                  <td>{p.units.toLocaleString()}</td>
                  <td className="db-rev-val">₹ {p.revenue.toLocaleString()}</td>
                  <td>
                    <div className="db-bar-inline-wrap">
                      <div className="db-bar-inline" style={{ width: `${pct}%` }} />
                      <span>{pct.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
