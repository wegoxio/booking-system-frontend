import type { Metadata } from "next";
import "driver.js/dist/driver.css";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { TenantSettingsProvider } from "@/context/TenantSettingsContext";
import AppToaster from "@/modules/ui/AppToaster";

export const metadata: Metadata = {
  title: "Sistema de Reservas Bukky",
  description: "Plataforma de reservas y gestión operativa de Bukky",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
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
