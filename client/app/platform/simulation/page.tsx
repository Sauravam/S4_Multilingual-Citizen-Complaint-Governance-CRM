"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Server, 
  Cpu, 
  Database, 
  LayoutDashboard, 
  ArrowRight, 
  MessageSquare, 
  Globe, 
  Search, 
  AlertCircle,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";

/**
 * TECHNICAL SIMULATION STAGES
 * Each stage represents a core part of the CRM's technical architecture.
 */
const STAGES = [
  {
    id: "citizen",
    title: "Citizen Interaction",
    icon: User,
    color: "#3b82f6",
    desc: "Citizen submits a complaint in their native language (Hindi, Marathi, Telugu, etc.). The frontend captures metadata and optional voice input.",
    tech: ["Next.js Frontend", "Voice/Text Input", "Multilingual Support"]
  },
  {
    id: "backend",
    title: "Backend Processing",
    icon: Server,
    color: "#f97316",
    desc: "FastAPI handles the request, authenticates the user, and orchestrates the workflow. It ensures data consistency and security.",
    tech: ["FastAPI", "Uvicorn", "JWT Auth", "Pydantic Validation"]
  },
  {
    id: "ml",
    title: "ML & Multilingual Engine",
    icon: Cpu,
    color: "#a78bfa",
    desc: "NLP models translate text, detect sentiment, and categorize the complaint automatically to route it to the correct department.",
    tech: ["NLP Models", "Translation API", "Sentiment Analysis", "Auto-Categorization"]
  },
  {
    id: "storage",
    title: "Data Persistence",
    icon: Database,
    color: "#22c55e",
    desc: "Complaint is stored in PostgreSQL for relational data and potentially Vector DB for semantic search and retrieval.",
    tech: ["PostgreSQL", "SQLWarehousing", "Real-time Sync"]
  },
  {
    id: "admin",
    title: "Governance Dashboard",
    icon: LayoutDashboard,
    color: "#f59e0b",
    desc: "Admins view analytics, track resolution times, and manage citizen feedback loop through an interactive dashboard.",
    tech: ["Recharts", "Interactive Dashboards", "Alert Systems"]
  }
];

export default function TechnicalSimulationPage() {
  const [activeStage, setActiveStage] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentPacketPosition, setCurrentPacketPosition] = useState(-1);

  const startSimulation = () => {
    setIsSimulating(true);
    setCurrentPacketPosition(0);
    setActiveStage(0);
    
    // Animate stage sequence
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count < STAGES.length) {
        setCurrentPacketPosition(count - 1); // This moves the packet from count-1 to count
        setActiveStage(count);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setCurrentPacketPosition(-1);
      }
    }, 2000);
  };

  return (
    <div className="simulation-page">
      <div className="simulation-header">
        <div>
          <h1 className="simulation-title">Technical Architecture Simulation</h1>
          <p className="simulation-subtitle">Visualizing the end-to-end flow of the Multilingual Citizen Governance CRM</p>
        </div>
        <button 
          className={`simulation-trigger ${isSimulating ? 'disabled' : ''}`}
          onClick={startSimulation}
          disabled={isSimulating}
        >
          {isSimulating ? (
            <>
              <Activity className="animate-pulse" size={18} />
              Simulating...
            </>
          ) : (
            <>
              <Zap size={18} />
              Run Simulation
            </>
          )}
        </button>
      </div>

      <div className="simulation-content">
        {/* TOP: The Visual Flow */}
        <div className="flow-visualizer">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStage === idx;
            
            return (
              <React.Fragment key={stage.id}>
                <div 
                  className={`flow-node ${isActive ? 'active' : ''}`}
                  onClick={() => !isSimulating && setActiveStage(idx)}
                >
                  <div className="node-icon-wrapper" style={{ borderColor: stage.color }}>
                    <div className="node-glow" style={{ background: stage.color }} />
                    <Icon size={24} style={{ color: stage.color }} />
                    {isActive && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="node-active-ring"
                        style={{ borderColor: stage.color }}
                      />
                    )}
                  </div>
                  <span className="node-label">{stage.title}</span>
                </div>

                {idx < STAGES.length - 1 && (
                  <div className="flow-connector">
                    <div className="connector-line" />
                    <AnimatePresence>
                      {isSimulating && currentPacketPosition === idx && (
                        <motion.div
                          key={`packet-${idx}`}
                          initial={{ left: "0%" }}
                          animate={{ left: "100%" }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 2, ease: "linear" }}
                          className="data-packet"
                          style={{ background: stage.color }}
                        >
                          <div className="packet-glow" style={{ background: stage.color }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* BOTTOM: Technical Details */}
        <div className="details-grid">
          <motion.div 
            key={activeStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="stage-info-card"
          >
            <div className="info-header">
              <div 
                className="info-icon" 
                style={{ background: STAGES[activeStage].color + '20', color: STAGES[activeStage].color }}
              >
                {React.createElement(STAGES[activeStage].icon, { size: 22 })}
              </div>
              <h2 className="info-title">{STAGES[activeStage].title}</h2>
            </div>
            
            <p className="info-desc">{STAGES[activeStage].desc}</p>
            
            <div className="tech-stack-section">
              <h3 className="section-label">Technology Stack</h3>
              <div className="tech-tags">
                {STAGES[activeStage].tech.map((t, i) => (
                  <span key={i} className="tech-tag">{t}</span>
                ))}
              </div>
            </div>

            <div className="technical-logic">
              <h3 className="section-label">Pipeline Logic</h3>
              <ul className="logic-list">
                {activeStage === 0 && (
                  <>
                    <li>Client-side validation and sanitization</li>
                    <li>Audio capture & chunking for voice complaints</li>
                    <li>State management via React Context</li>
                  </>
                )}
                {activeStage === 1 && (
                  <>
                    <li>API Gateway routing via FastAPI</li>
                    <li>Asynchronous request handling (uvicorn/gunicorn)</li>
                    <li>Schema validation with Pydantic</li>
                  </>
                )}
                {activeStage === 2 && (
                  <>
                    <li>Neural Machine Translation (NMT) evaluation</li>
                    <li>BERT/RoBERTa based sentiment extraction</li>
                    <li>Zero-shot classification for dynamic categories</li>
                  </>
                )}
                {activeStage === 3 && (
                  <>
                    <li>ACID compliant transaction handling</li>
                    <li>Vector embeddings generation (HuggingFace)</li>
                    <li>Indexed search for legacy records</li>
                  </>
                )}
                {activeStage === 4 && (
                  <>
                    <li>Data aggregation for time-series charts</li>
                    <li>Websocket-based real-time notification</li>
                    <li>Role-Based Access Control (RBAC) verification</li>
                  </>
                )}
              </ul>
            </div>
          </motion.div>

          <div className="system-metrics-card">
              <div className="metrics-header">
                <ShieldCheck size={18} style={{ color: '#4ade80' }} />
                <span>System Architecture Overview</span>
              </div>
              <div className="metrics-content">
                <div className="metric-item">
                  <span className="metric-label">Frontend Infrastructure</span>
                  <div className="metric-progress-bg">
                    <motion.div 
                      className="metric-progress-fill"
                      initial={{ width: "0%" }}
                      animate={{ width: "95%" }}
                      style={{ background: "#3b82f6" }}
                    />
                  </div>
                  <span className="metric-value">React 19 / Next.js 16</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Server Response Time</span>
                  <div className="metric-progress-bg">
                    <motion.div 
                      className="metric-progress-fill"
                      initial={{ width: "0%" }}
                      animate={{ width: "92%" }}
                      style={{ background: "#f97316" }}
                    />
                  </div>
                  <span className="metric-value">~120ms (P95)</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Model Accuracy</span>
                  <div className="metric-progress-bg">
                    <motion.div 
                      className="metric-progress-fill"
                      initial={{ width: "0%" }}
                      animate={{ width: "88%" }}
                      style={{ background: "#a78bfa" }}
                    />
                  </div>
                  <span className="metric-value">88.4% (Multilingual)</span>
                </div>
              </div>

              <div className="architecture-note">
                <AlertCircle size={16} />
                <p>The system utilizes a micro-services inspired approach for high cohesion and low latency.</p>
              </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .simulation-page {
          padding: 32px;
          height: 100%;
          overflow-y: auto;
          background: #0c1220;
          display: flex;
          flex-direction: column;
          gap: 32px;
          color: #e2e8f0;
          font-family: 'Inter', sans-serif;
        }

        .simulation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .simulation-title {
          font-family: 'Sora', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }

        .simulation-subtitle {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .simulation-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
        }

        .simulation-trigger:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4);
        }

        .simulation-trigger:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .flow-visualizer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 60px 40px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          margin-bottom: 8px;
        }

        .flow-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          position: relative;
          z-index: 2;
          transition: all 0.3s;
        }

        .node-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .flow-node.active .node-icon-wrapper {
          background: #1e293b;
          transform: scale(1.15);
          border-width: 2px;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
        }

        .node-glow {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          opacity: 0;
          filter: blur(16px);
          transition: opacity 0.4s;
        }

        .flow-node.active .node-glow {
          opacity: 0.25;
        }

        .node-label {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-align: center;
          max-width: 90px;
          transition: color 0.3s;
        }

        .flow-node.active .node-label {
          color: #f1f5f9;
        }

        .node-active-ring {
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          border: 2px dashed;
          border-radius: 26px;
          opacity: 0.5;
          animation: spin 10s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .flow-connector {
          flex: 1;
          height: 2px;
          margin: 0 -12px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .connector-line {
          width: 100%;
          height: 2px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
        }

        .data-packet {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          z-index: 3;
        }

        .packet-glow {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          filter: blur(6px);
          opacity: 0.7;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 28px;
          flex: 1;
        }

        .stage-info-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .info-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-title {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }

        .info-desc {
          color: #94a3b8;
          font-size: 16px;
          line-height: 1.7;
          margin: 0;
        }

        .section-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #475569;
          margin-bottom: 14px;
        }

        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .tech-tag {
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #cbd5e1;
          transition: all 0.2s;
        }
        .tech-tag:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .logic-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 0;
        }

        .logic-list li {
          position: relative;
          padding-left: 24px;
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.5;
        }

        .logic-list li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          width: 8px;
          height: 2px;
          background: #f97316;
          border-radius: 2px;
          opacity: 0.6;
        }

        .system-metrics-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .metrics-header {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f1f5f9;
          font-weight: 700;
          font-size: 15px;
          font-family: 'Sora', sans-serif;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .metric-label {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
        }

        .metric-progress-bg {
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
        }

        .metric-progress-fill {
          height: 100%;
          border-radius: 4px;
        }

        .metric-value {
          align-self: flex-end;
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.5px;
        }

        .architecture-note {
          margin-top: auto;
          background: rgba(59, 130, 246, 0.06);
          border: 1px solid rgba(59, 130, 246, 0.12);
          padding: 16px;
          border-radius: 16px;
          display: flex;
          gap: 14px;
          color: #60a5fa;
          align-items: flex-start;
        }

        .architecture-note p {
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
          font-weight: 400;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.92); }
        }
        .animate-pulse {
          animation: pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Responsive adjustments */
        @media (max-width: 1100px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
          .system-metrics-card {
            order: -1;
          }
        }
      `}</style>
    </div>
  );
}
