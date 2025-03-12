"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !allowedRoles.includes(user.role))) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <p>Chargement...</p>;
  }

  return <>{children}</>;
}
