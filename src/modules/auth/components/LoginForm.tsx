"use client";

import { useAuth } from "@/context/AuthContext";
import Button from "@/modules/ui/Button";
import Input from "@/modules/ui/Input";
import TurnstileWidget from "@/modules/ui/TurnstileWidget";
import {
  ArrowRight,
  CalendarClock,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Users2,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";

type HighlightItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const LOGIN_HIGHLIGHTS: HighlightItem[] = [
  {
    title: "Agenda por profesional",
    description: "Controla slots reales por servicio, descansos y citas ya tomadas.",
    icon: CalendarClock,
  },
  {
    title: "Vista por tenant",
    description: "Cada negocio mantiene sus datos y operaciones aisladas.",
    icon: Users2,
  },
  {
    title: "Trazabilidad completa",
    description: "Auditoria de cambios criticos para equipo y plataforma.",
    icon: ShieldCheck,
  },
];

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
const TURNSTILE_LOGIN_ACTION =
  process.env.NEXT_PUBLIC_TURNSTILE_LOGIN_ACTION?.trim() || "login";

export default function LoginForm() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const isTurnstileEnabled = TURNSTILE_SITE_KEY.length > 0;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setErrorMessage("");

    if (isTurnstileEnabled && !captchaToken) {
      setErrorMessage("Completa la verificacion de seguridad para continuar.");
      return;
    }

    try {
      await login({
        email,
        password,
        captcha_token: isTurnstileEnabled ? captchaToken ?? undefined : undefined,
      });
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al iniciar sesion";
      setErrorMessage(message);
      if (isTurnstileEnabled) {
        setCaptchaRefreshKey((prev) => prev + 1);
      }
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-app px-4 py-6 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1200px] overflow-hidden rounded-[32px] border border-border bg-surface shadow-theme-shell">
        <aside className="relative hidden w-[44%] overflow-hidden bg-gradient-to-br from-sidebar-start via-sidebar-end to-fg-strong p-8 text-inverse lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute -left-12 top-10 h-44 w-44 rounded-full bg-inverse-20 blur-3xl" />
            <div className="absolute -right-14 bottom-24 h-56 w-56 rounded-full bg-accent/50 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="mb-12 inline-flex items-center gap-3 rounded-2xl border border-inverse-15 bg-inverse-10 px-4 py-2">
              <img className="h-7 w-7" src="/wegox-logo.svg" alt="Wegox logo" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-inverse-80">
                Booking Suite
              </p>
            </div>

            <h2 className="max-w-sm text-3xl font-semibold leading-tight">
              Gestiona tu operacion diaria desde un solo panel.
            </h2>
            <p className="mt-4 max-w-md text-sm text-inverse-75">
              Reserva citas, controla horarios del equipo y monitorea resultados en tiempo real.
            </p>

            <div className="mt-8 space-y-3">
              {LOGIN_HIGHLIGHTS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-inverse-15 bg-inverse-10 p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-inverse-20">
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="font-semibold">{item.title}</p>
                    </div>
                    <p className="mt-2 text-sm text-inverse-80">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-surface-panel to-surface-subtle p-6 sm:p-10">
          <div className="w-full max-w-md">
            <a href="#" className="mb-6 inline-flex items-center gap-2 text-2xl font-semibold text-fg-strong">
              <img className="h-8 w-8" src="/wegox-logo.svg" alt="Wegox logo" />
              Wegox
            </a>

            <div className="rounded-[28px] border border-border bg-surface p-6 shadow-theme-soft sm:p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-fg-strong">Iniciar sesion</h1>
                <p className="mt-2 text-sm text-fg-secondary">
                  Accede a tu panel para administrar citas, equipo y configuraciones.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  label="Correo electronico"
                  placeholder="alguien@ejemplo.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 border-border bg-surface-soft text-fg"
                />

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-fg-strong">
                    Contrasena
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="********"
                      className="h-12 w-full rounded-lg border border-border bg-surface-soft px-3 pr-11 text-fg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-fg-secondary transition-colors hover:text-fg-strong"
                      aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <label className="inline-flex items-center gap-2 text-fg-secondary">
                    <input type="checkbox" className="h-4 w-4 rounded border-border text-accent" />
                    Recordar este equipo
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="font-medium text-fg-strong transition-colors hover:text-accent"
                  >
                    Olvide mi contrasena
                  </button>
                </div>

                {isTurnstileEnabled ? (
                  <div className="rounded-xl border border-border bg-surface-soft p-3">
                    <TurnstileWidget
                      siteKey={TURNSTILE_SITE_KEY}
                      action={TURNSTILE_LOGIN_ACTION}
                      refreshKey={captchaRefreshKey}
                      onTokenChange={setCaptchaToken}
                    />
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-accent-text transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Entrando..." : "Entrar al panel"}
                  <ArrowRight className="h-4 w-4" />
                </Button>

                {errorMessage && (
                  <p className="rounded-lg bg-surface-danger px-3 py-2 text-sm text-danger">{errorMessage}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
