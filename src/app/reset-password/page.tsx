"use client";

import { authService } from "@/modules/auth/services/auth.service";
import Button from "@/modules/ui/Button";
import Input from "@/modules/ui/Input";
import { isStrongPassword } from "@/utils/validation";
import { ArrowLeft, KeyRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";

function ResetPasswordFallback() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-app px-4 py-6">
      <div className="w-full max-w-lg rounded-[28px] border border-border bg-surface p-6 shadow-theme-soft sm:p-8">
        <h1 className="text-2xl font-semibold text-fg-strong">Restablecer contrasena</h1>
        <div className="mt-6 rounded-2xl border border-border bg-surface-soft px-4 py-5 text-sm text-fg-secondary">
          Preparando el enlace seguro...
        </div>
      </div>
    </section>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const didResolveRef = useRef(false);

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResolving, setIsResolving] = useState(true);
  const [resolveError, setResolveError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (didResolveRef.current) return;

    const rawToken = searchParams.get("token")?.trim() ?? "";
    if (!rawToken) {
      setResolveError("El enlace no es valido o ya no esta disponible.");
      setIsResolving(false);
      didResolveRef.current = true;
      return;
    }

    didResolveRef.current = true;
    setToken(rawToken);

    void authService
      .resolvePasswordReset({ token: rawToken })
      .then((response) => {
        setEmail(response.email);

        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", "/reset-password");
        }
      })
      .catch((error) => {
        setResolveError(
          error instanceof Error
            ? error.message
            : "No se pudo validar este enlace.",
        );
      })
      .finally(() => {
        setIsResolving(false);
      });
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (!isStrongPassword(password)) {
      setSubmitError(
        "La contrasena debe tener 8+ caracteres, mayuscula, minuscula, numero y simbolo.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError("Las contrasenas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.completePasswordReset({
        token,
        password,
      });

      router.push(
        `/?notice=password-reset&email=${encodeURIComponent(response.email)}`,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la contrasena.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-app px-4 py-6">
      <div className="w-full max-w-lg rounded-[28px] border border-border bg-surface p-6 shadow-theme-soft sm:p-8">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-fg-secondary transition-colors hover:text-fg-strong"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al login
        </button>

        <h1 className="text-2xl font-semibold text-fg-strong">
          Restablecer contrasena
        </h1>
        <p className="mt-2 text-sm text-fg-secondary">
          Define una nueva contrasena segura para volver a entrar al panel.
        </p>

        {isResolving ? (
          <div className="mt-6 rounded-2xl border border-border bg-surface-soft px-4 py-5 text-sm text-fg-secondary">
            Validando enlace seguro...
          </div>
        ) : resolveError ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border-danger bg-surface-danger px-4 py-4 text-sm text-danger">
              {resolveError}
            </div>
            <Button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="h-11 w-full rounded-xl bg-accent text-accent-text hover:bg-accent-hover"
            >
              Solicitar un nuevo enlace
            </Button>
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-border bg-surface-soft px-4 py-4 text-sm text-fg-secondary">
              Restableciendo acceso para{" "}
              <span className="font-medium text-fg-strong">{email}</span>.
            </div>

            <Input
              label="Nueva contrasena"
              id="reset-password-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              required
              className="h-12 border-border bg-surface-soft text-fg"
            />

            <Input
              label="Confirmar contrasena"
              id="reset-password-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="********"
              required
              className="h-12 border-border bg-surface-soft text-fg"
            />

            <div className="rounded-2xl border border-border-info bg-surface-info px-4 py-3 text-sm text-info">
              <div className="flex items-start gap-2">
                <KeyRound className="mt-0.5 h-4 w-4" />
                <p>
                  La nueva contrasena debe ser fuerte y sustituira la anterior en todas tus sesiones.
                </p>
              </div>
            </div>

            {submitError ? (
              <div className="rounded-2xl border border-border-danger bg-surface-danger px-4 py-3 text-sm text-danger">
                {submitError}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl bg-accent text-accent-text hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Actualizando..." : "Guardar nueva contrasena"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
