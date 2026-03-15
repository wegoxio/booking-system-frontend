import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { TenantSettingsProvider } from "@/context/TenantSettingsContext";
import AppToaster from "@/modules/ui/AppToaster";

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
            <AppToaster />
          </TenantSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
