"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  User,
  Bot,
  ChevronDown,
  Play,
  Copy,
  Check,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ─── Mock response engine ─── */
interface GenieResponse {
  sql: string;
  explanation: string;
  columns: string[];
  rows: Record<string, string | number>[];
}

const CANNED: Record<string, GenieResponse> = {
  revenue: {
    sql: "SELECT region, SUM(revenue) AS total_revenue\nFROM sales_data\nGROUP BY region\nORDER BY total_revenue DESC;",
    explanation: "This query groups all sales records by region and sums up the revenue for each, giving you a clear breakdown of revenue performance by geography.",
    columns: ["region", "total_revenue"],
    rows: [
      { region: "North", total_revenue: 67200 },
      { region: "South", total_revenue: 54272 },
      { region: "West", total_revenue: 43635 },
      { region: "East", total_revenue: 37200 },
    ],
  },
  customer: {
    sql: "SELECT customer_id, name, email, city, tier\nFROM customers\nORDER BY tier, name;",
    explanation: "Fetches all customers with their contact details and loyalty tier, sorted alphabetically by tier then name.",
    columns: ["customer_id", "name", "email", "city", "tier"],
    rows: [
      { customer_id: 1, name: "Rahul Sharma", email: "rahul@example.com", city: "Mumbai", tier: "Gold" },
      { customer_id: 3, name: "Priya Nair", email: "priya@example.com", city: "Bangalore", tier: "Platinum" },
      { customer_id: 7, name: "Rohan Mehta", email: "rohan@example.com", city: "Chennai", tier: "Platinum" },
      { customer_id: 2, name: "Amit Patel", email: "amit@example.com", city: "Delhi", tier: "Silver" },
    ],
  },
  order: {
    sql: "SELECT order_id, customer_id, order_date, price, quantity\nFROM orders\nORDER BY order_date DESC\nLIMIT 10;",
    explanation: "Shows the 10 most recent orders with their key details including price and quantity.",
    columns: ["order_id", "customer_id", "order_date", "price", "quantity"],
    rows: [
      { order_id: 115, customer_id: 12, order_date: "2026-03-14", price: 1249, quantity: 1 },
      { order_id: 114, customer_id: 3, order_date: "2026-03-14", price: 599, quantity: 1 },
      { order_id: 113, customer_id: 11, order_date: "2026-03-14", price: 89, quantity: 5 },
      { order_id: 112, customer_id: 10, order_date: "2026-03-14", price: 320, quantity: 2 },
    ],
  },
  product: {
    sql: "SELECT product_id, product_name, category, price, stock\nFROM products\nORDER BY stock ASC;",
    explanation: "Lists all products sorted by stock level ascending — helping you spot low-inventory items first.",
    columns: ["product_id", "product_name", "category", "price", "stock"],
    rows: [
      { product_id: 16, product_name: "Noise Cancelling Headphones", category: "Audio", price: 1249, stock: 78 },
      { product_id: 13, product_name: "Standing Desk Mat", category: "Accessories", price: 320, stock: 95 },
      { product_id: 12, product_name: "Mechanical Keyboard", category: "Electronics", price: 450, stock: 180 },
    ],
  },
  transaction: {
    sql: "SELECT txn_id, order_id, payment_method, amount, status\nFROM transactions\nWHERE status != 'Success'\nORDER BY txn_date DESC;",
    explanation: "Surfaces failed and pending transactions, ideal for payment reconciliation or troubleshooting.",
    columns: ["txn_id", "order_id", "payment_method", "amount", "status"],
    rows: [
      { txn_id: 5005, order_id: 105, payment_method: "Net Banking", amount: 800, status: "Failed" },
      { txn_id: 5008, order_id: 108, payment_method: "Credit Card", amount: 599, status: "Pending" },
    ],
  },
};

function getResponse(question: string): GenieResponse | null {
  const q = question.toLowerCase();
  if (q.includes("revenue") || q.includes("sales") || q.includes("region")) return CANNED.revenue;
  if (q.includes("customer") || q.includes("tier") || q.includes("user")) return CANNED.customer;
  if (q.includes("order") || q.includes("recent") || q.includes("purchase")) return CANNED.order;
  if (q.includes("product") || q.includes("stock") || q.includes("inventory")) return CANNED.product;
  if (q.includes("transaction") || q.includes("payment") || q.includes("failed") || q.includes("pending")) return CANNED.transaction;
  return null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  response?: GenieResponse;
  loading?: boolean;
}

const SUGGESTIONS = [
  "Show total revenue by region",
  "Who are my top customers?",
  "List all recent orders",
  "Which products are low on stock?",
  "Show failed transactions",
];

export default function GeniePage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "assistant",
      text: "Hi! I'm **Genie**, your AI data assistant. Ask me anything about your data in plain English and I'll generate the SQL and run it for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text?: string) => {
    const question = (text ?? input).trim();
    if (!question) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: question };
    const loadingMsg: Message = { id: `a-${Date.now()}`, role: "assistant", text: "", loading: true };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");

    setTimeout(() => {
      const result = getResponse(question);
      const replyText = result
        ? `Got it! Here's the SQL I generated to answer: *"${question}"*`
        : `I wasn't able to map that exactly to a known dataset. Try asking about **revenue**, **customers**, **orders**, **products**, or **transactions**.`;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? { ...m, loading: false, text: replyText, response: result ?? undefined }
            : m
        )
      );
    }, 1200);
  };

  const copySQL = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openInEditor = (sql: string) => {
    if (typeof window !== "undefined") localStorage.setItem("genie_prefill_sql", sql);
    router.push("/platform/sql-editor");
  };

  const clearChat = () => {
    setMessages([
      { id: "intro", role: "assistant", text: "Hi! I'm **Genie**, your AI data assistant. Ask me anything about your data in plain English." },
    ]);
  };

  return (
    <div className="genie-root">
      {/* Header */}
      <div className="genie-header">
        <div className="genie-header-left">
          <div className="genie-avatar-large">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="genie-title">Genie AI Assistant</h1>
            <p className="genie-subtitle">Ask questions about your data in plain English</p>
          </div>
        </div>
        <button className="genie-clear-btn" onClick={clearChat} title="Clear chat">
          <RotateCcw size={14} /> New Chat
        </button>
      </div>

      {/* Chat */}
      <div className="genie-chat">
        {messages.map((msg) => (
          <div key={msg.id} className={`genie-msg ${msg.role}`}>
            <div className="genie-msg-avatar">
              {msg.role === "user" ? <User size={14} /> : <Sparkles size={14} />}
            </div>
            <div className="genie-msg-body">
              {msg.loading ? (
                <div className="genie-loading">
                  <Loader2 size={16} className="genie-spin" />
                  <span>Generating SQL…</span>
                </div>
              ) : (
                <>
                  <div
                    className="genie-msg-text"
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.+?)\*/g, "<em>$1</em>"),
                    }}
                  />
                  {msg.response && (
                    <div className="genie-result-card">
                      {/* SQL */}
                      <div className="genie-sql-block">
                        <div className="genie-sql-header">
                          <span>Generated SQL</span>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              className="genie-sql-btn"
                              onClick={() => copySQL(msg.id, msg.response!.sql)}
                            >
                              {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                              {copiedId === msg.id ? "Copied" : "Copy"}
                            </button>
                            <button
                              className="genie-sql-btn primary"
                              onClick={() => openInEditor(msg.response!.sql)}
                            >
                              <Play size={12} /> Open
                            </button>
                          </div>
                        </div>
                        <pre className="genie-sql-pre">{msg.response.sql}</pre>
                      </div>
                      {/* Explanation */}
                      <p className="genie-explanation">{msg.response.explanation}</p>
                      {/* Preview table */}
                      <div className="genie-table-wrap">
                        <table className="genie-table">
                          <thead>
                            <tr>
                              {msg.response.columns.map((c) => <th key={c}>{c}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.response.rows.map((row, ri) => (
                              <tr key={ri}>
                                {msg.response!.columns.map((c) => (
                                  <td key={c}>{String(row[c] ?? "")}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions + Input */}
      <div className="genie-input-area">
        <div className="genie-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="genie-suggestion-chip" onClick={() => sendMessage(s)}>
              {s}
            </button>
          ))}
        </div>
        <div className="genie-input-row">
          <textarea
            ref={inputRef}
            className="genie-input"
            placeholder="Ask anything about your data…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            className="genie-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim()}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
