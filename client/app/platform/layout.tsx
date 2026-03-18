"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code2,
  ListFilter,
  LayoutDashboard,
  Sparkles,
  BellRing,
  History,
  Server,
  PanelLeftClose,
  PanelLeftOpen,
  GitBranch,
  BrainCircuit,
  ShieldCheck,
  Settings,
  Users
} from "lucide-react";
import "./platform.css";

const SQL_NAV_ITEMS = [
  { href: "/platform/sql-editor", label: "SQL Editor", icon: Code2 },
  { href: "#", label: "Queries", icon: ListFilter, disabled: true },
  { href: "#", label: "Dashboards", icon: LayoutDashboard, disabled: true },
  { href: "#", label: "Genie", icon: Sparkles, disabled: true },
  { href: "#", label: "Alerts", icon: BellRing, disabled: true },
  { href: "#", label: "Query History", icon: History, disabled: true },
  { href: "#", label: "SQL Warehouses", icon: Server, disabled: true },
];

const FUTURE_MODULES = [
  { label: "Data Pipelines", icon: GitBranch },
  { label: "Machine Learning", icon: BrainCircuit },
  { label: "Data Governance", icon: ShieldCheck },
  { label: "Administration", icon: Users },
  { label: "Settings", icon: Settings },
];

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="platform-root">
      {/* GLOBAL SIDEBAR */}
      <aside className={`global-sidebar ${collapsed ? "collapsed" : ""}`}>
        <Link href="/platform" className="gs-brand" style={{ textDecoration: 'none' }}>
          <div className="gs-brand-logo">D</div>
          <span className="gs-brand-text">Data Platform</span>
        </Link>

        <div className="gs-section">
          <div className="gs-section-title">SQL</div>
          {SQL_NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return item.disabled ? (
              <div key={idx} className="gs-nav-item disabled" title={`${item.label} (Coming Soon)`}>
                <div className="gs-nav-icon"><Icon size={16} /></div>
                <span className="gs-nav-label">{item.label}</span>
              </div>
            ) : (
              <Link key={idx} href={item.href} className={`gs-nav-item ${isActive ? "active" : ""}`}>
                <div className="gs-nav-icon"><Icon size={16} /></div>
                <span className="gs-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="gs-divider" />

        <div className="gs-section">
          <div className="gs-section-title">Modules</div>
          {FUTURE_MODULES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="gs-nav-item disabled" title={`${item.label} (Coming Soon)`}>
                <div className="gs-nav-icon"><Icon size={16} /></div>
                <span className="gs-nav-label">{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="gs-toggle">
          <button className="gs-toggle-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* MAIN PLATFORM CONTENT */}
      <main className="platform-content">
        {children}
      </main>
    </div>
  );
}
