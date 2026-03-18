"use client";

import Link from "next/link";
import { Code2, GitBranch, BrainCircuit, ShieldCheck, Database } from "lucide-react";

export default function PlatformLandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-icon">
        <Database size={32} />
      </div>
      <h1 className="landing-title">Welcome to Data Platform</h1>
      <p className="landing-subtitle">
        Your centralized workspace for data engineering, analytics, and machine learning. Select a module below or use the sidebar to navigate to your workspace.
      </p>

      <div className="landing-cards">
        <Link href="/platform/sql-editor" className="landing-card">
          <div className="landing-card-icon sql">
            <Code2 size={24} />
          </div>
          <div className="landing-card-title">SQL Workspace</div>
          <div className="landing-card-desc">
            Develop SQL queries, analyze data, and create dashboards using our notebook-style editor.
          </div>
        </Link>

        <div className="landing-card disabled">
          <div className="landing-card-icon pipeline">
            <GitBranch size={24} />
          </div>
          <div className="landing-card-title">Data Pipelines</div>
          <div className="landing-card-desc">
            Build, orchestrate, and monitor ETL pipelines and data workflows. (Coming Soon)
          </div>
        </div>

        <div className="landing-card disabled">
          <div className="landing-card-icon ml">
            <BrainCircuit size={24} />
          </div>
          <div className="landing-card-title">Machine Learning</div>
          <div className="landing-card-desc">
            Train, deploy, and manage machine learning models and experiments. (Coming Soon)
          </div>
        </div>

        <div className="landing-card disabled">
          <div className="landing-card-icon">
            <ShieldCheck size={24} color="#f59e0b" />
          </div>
          <div className="landing-card-title">Data Governance</div>
          <div className="landing-card-desc">
            Manage data catalogs, access control, and compliance policies. (Coming Soon)
          </div>
        </div>
      </div>
    </div>
  );
}
