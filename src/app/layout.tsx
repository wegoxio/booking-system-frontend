import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { TenantSettingsProvider } from "@/context/TenantSettingsContext";

export const metadata: Metadata = {
  title: "Wegox Booking System",
  description: "Wegox Booking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <TenantSettingsProvider>
            {children}
          </TenantSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
