import { ReactNode } from "react";
import { AuthProvider } from "../../hooks/useAuth";

export function AuthWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
