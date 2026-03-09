"use client";

import { useAuth } from "@/context/AuthContext";
import Button from "@/modules/ui/Button";
import Input from "@/modules/ui/Input";
import { useRouter } from "next/navigation";
import { useState, SubmitEvent } from "react";

export default function LoginForm() {
    const { login, isLoading } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        setErrorMessage("");
        try {
            await login({ email, password });
            router.push("/dashboard");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error al iniciar sesion";
            setErrorMessage(message);
        }
    }
    return (
        <section className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md">
                <a href="#" className="flex justify-center items-center mb-6 text-2xl font-semibold text-gray-900">
                    <img
                        className="mr-2 h-8 w-8"
                        src="/wegox-logo.svg"
                        alt="logo"
                    />
                    Wegox
                </a>

                <div className="w-full rounded-lg border border-gray-300 bg-gray-50 shadow-md ">
                    <div className="space-y-4 p-6 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900">Iniciar sesión</h1>

                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                label="Correo Electronico"
                                placeholder="alguien@ejemplo.com"
                                required={true}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <Input
                                type="password"
                                id="password"
                                name="password"
                                label="Contraseña"
                                placeholder="********"
                                required={true}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <div className="flex items-start">
                                <div className="flex h-5 items-center">
                                    <input
                                        id="terms"
                                        aria-describedby="terms"
                                        type="checkbox"
                                        className="checkbox-input"
                                        required={true}
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="checkbox-label">
                                        I accept the{" "}
                                        <a className="link-primary" href="#">
                                            Terms and Conditions
                                        </a>
                                    </label>
                                </div>
                            </div>

                            <Button type="submit" disabled={isLoading} className="bg-amber-300 p-3 w-full rounded-lg text-gray-200 transition-all hover:bg-amber-400 cursor-pointer">
                                {isLoading ? "Entrando..." : "Entrar"}
                            </Button>

                            {errorMessage && (
                                <p className="text-sm text-red-600">{errorMessage}</p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
