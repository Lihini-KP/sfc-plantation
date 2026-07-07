import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/lib/role-context";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SFC Plantation Platform",
  description: "Smart Plantation Management Platform for Silk Food Ceylon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <RoleProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            {children}
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
