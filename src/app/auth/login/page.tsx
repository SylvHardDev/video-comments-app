"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  // Rediriger automatiquement un utilisateur connecté
  if (user) {
    switch (user.role) {
      case "admin":
        router.push("/dashboard/admin");
        break;
      case "collaborateur":
        router.push("/dashboard/collaborateur");
        break;
      case "client":
        router.push("/dashboard/client");
        break;
      default:
        router.push("/");
    }
  }

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Erreur lors de la connexion :", error.message);
      alert("Échec de la connexion.");
      return;
    }

    // Récupérer le rôle de l'utilisateur depuis la DB
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user?.id)
      .single();

    if (userError || !userData) {
      console.error("Erreur récupération rôle :", userError?.message);
      alert("Impossible de récupérer votre rôle.");
      return;
    }

    // Rediriger en fonction du rôle
    switch (userData.role) {
      case "admin":
        router.push("/dashboard/admin");
        break;
      case "collaborateur":
        router.push("/dashboard/collaborateur");
        break;
      case "client":
        router.push("/dashboard/client");
        break;
      default:
        router.push("/");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <h1 className="text-2xl font-bold">Connexion</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full max-w-md mt-4"
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full max-w-md mt-2"
      />
      <button
        onClick={handleSignIn}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Se connecter
      </button>
    </div>
  );
}
