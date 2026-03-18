import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import ClientProviders from "./components/ClientProviders";

export const metadata: Metadata = {
  title: "GovTech CRM — Multilingual Citizen Complaint Portal",
  description: "Submit and track civic complaints in your language. Powered by AI translation and smart routing to the right government authority.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <Navbar />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
