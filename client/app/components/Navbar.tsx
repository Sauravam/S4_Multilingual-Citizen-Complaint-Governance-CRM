"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/submit", label: "Submit", icon: "📝" },
    { href: "/track", label: "Track", icon: "🔍" },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("govtech_user");
            if (stored) setUser(JSON.parse(stored));
        } catch { }
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const logout = () => {
        localStorage.removeItem("govtech_user");
        localStorage.removeItem("govtech_token");
        document.cookie = "govtech_user_role=; path=/; max-age=0";
        document.cookie = "govtech_user_email=; path=/; max-age=0";
        setUser(null);
        window.location.href = "/";
    };

    const roleDashboard = () => {
        if (!user) return "/login";
        if (user.role === "citizen") return "/user/dashboard";
        if (user.role === "officer") return "/officer/dashboard";
        if (user.role === "admin") return "/admin/dashboard";
        return "/";
    };

    const roleIcon = user?.role === "citizen" ? "👤" : user?.role === "officer" ? "🏢" : "⚙️";
    const roleColor = user?.role === "citizen" ? "#4ade80" : user?.role === "officer" ? "#60a5fa" : "#fbbf24";

    return (
        <nav className="navbar" style={{
            background: scrolled ? "rgba(5, 13, 26, 0.92)" : "rgba(5, 13, 26, 0.75)",
            boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
        }}>
            <Link href="/" className="nav-logo">
                <div className="nav-logo-icon">🏛️</div>
                <div>
                    <span className="nav-logo-text">GovTech</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", marginTop: "-2px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>CRM Portal</span>
                </div>
            </Link>

            <ul className="nav-links" style={{ display: "flex" }}>
                {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className={`nav-link ${pathname === link.href ? "active" : ""}`}
                        >
                            <span style={{ fontSize: "12px" }}>{link.icon}</span> {link.label}
                        </Link>
                    </li>
                ))}
                {user && (
                    <li>
                        <Link
                            href={roleDashboard()}
                            className={`nav-link ${pathname.includes("dashboard") ? "active" : ""}`}
                        >
                            <span style={{ fontSize: "12px" }}>📊</span> Dashboard
                        </Link>
                    </li>
                )}
            </ul>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {user ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            background: `${roleColor}10`, border: `1px solid ${roleColor}30`,
                            padding: "6px 14px", borderRadius: "20px",
                            fontSize: "12px", fontWeight: 600,
                        }}>
                            <span>{roleIcon}</span>
                            <span style={{ color: roleColor }}>{user.name.split(" ")[0]}</span>
                            <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>·</span>
                            <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{user.role}</span>
                        </div>
                        <button onClick={logout} style={{
                            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                            color: "#f87171", padding: "6px 14px", borderRadius: "8px",
                            fontSize: "12px", fontWeight: 600, cursor: "pointer",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link href="/login" className="btn-primary" style={{ padding: "8px 20px", fontSize: "13px" }}>
                        Sign In →
                    </Link>
                )}
            </div>
        </nav>
    );
}
