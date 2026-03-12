"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/submit", label: "Submit Complaint" },
    { href: "/track", label: "Track Complaint" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("govtech_user");
            if (stored) setUser(JSON.parse(stored));
        } catch { }
    }, [pathname]);

    const logout = () => {
        localStorage.removeItem("govtech_user");
        localStorage.removeItem("govtech_token");
        setUser(null);
        window.location.href = "/";
    };

    const roleDashboard = () => {
        if (!user) return "/login";
        if (user.role === "citizen") return "/citizen/dashboard";
        if (user.role === "officer") return "/officer/dashboard";
        if (user.role === "admin") return "/admin/analytics";
        return "/";
    };

    return (
        <nav className="navbar">
            <Link href="/" className="nav-logo">
                <div className="nav-logo-icon">🏛️</div>
                <span className="nav-logo-text">GovTech CRM</span>
            </Link>

            <ul className="nav-links" style={{ display: "flex" }}>
                {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className={`nav-link ${pathname === link.href ? "active" : ""}`}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
                {user && (
                    <li>
                        <Link
                            href={roleDashboard()}
                            className={`nav-link ${pathname.includes("dashboard") || pathname.includes("analytics") ? "active" : ""}`}
                        >
                            Dashboard
                        </Link>
                    </li>
                )}
            </ul>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {user ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                            background: "rgba(249,115,22,0.15)",
                            border: "1px solid rgba(249,115,22,0.3)",
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            color: "#f97316",
                            fontWeight: 600,
                        }}>
                            {user.name.split(" ")[0]} · {user.role}
                        </div>
                        <button onClick={logout} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link href="/login" className="btn-primary" style={{ padding: "9px 20px", fontSize: "13px" }}>
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}
