import { Suspense } from "react";
import LoginForm from "@/modules/auth/components/LoginForm";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
