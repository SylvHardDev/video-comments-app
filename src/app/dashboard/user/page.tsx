"use client";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(
    null
  );

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Récupérer le rôle de l'utilisateur
      const { data: userData, error } = await supabase
        .from("users")
        .select("role")
        .eq("email", user.email)
        .single();

      if (error) {
        router.push("/login");
        return;
      }

      setUser({ email: user.email, role: userData.role });
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">
        Dashboard {user?.role === "collaborator" ? "Collaborateur" : "Client"}
      </h1>
      <p className="mt-2">Bienvenue, {user?.email}</p>
      <Button className="mt-4" onClick={handleLogout}>
        Déconnexion
      </Button>
    </div>
  );
}
