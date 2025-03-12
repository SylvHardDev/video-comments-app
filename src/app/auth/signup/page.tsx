"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [disableSignup, setDisableSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkExistingAdmins = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("role", "admin");
      if (error) {
        console.error(
          "Erreur lors de la vérification des admins :",
          error.message
        );
      }
      if (data && data.length > 0) {
        setDisableSignup(true);
      }
    };

    checkExistingAdmins();
  }, []);

  const handleSignUp = async () => {
    if (!email || !password)
      return alert("Veuillez renseigner tous les champs.");

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("Erreur d'inscription :", error.message);
      return;
    }

    // Vérifier s'il s'agit du premier utilisateur (s'il n'y a pas encore d'admin)
    const { data: existingAdmins } = await supabase
      .from("users")
      .select("id")
      .eq("role", "admin");
    const role = existingAdmins.length === 0 ? "admin" : "client"; // Premier inscrit = Admin, les suivants = Client

    // Ajouter l'utilisateur dans la base de données
    await supabase.from("users").insert([{ id: data.user?.id, email, role }]);

    alert(`Compte créé avec succès ! Vous êtes ${role}.`);
    router.push("/auth/login");
  };

  if (disableSignup) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Inscription désactivée</h1>
        <p>
          Un administrateur existe déjà. Seuls les admins peuvent créer de
          nouveaux comptes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <h1 className="text-2xl font-bold">Créer un compte</h1>
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
        onClick={handleSignUp}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        S'inscrire
      </button>
    </div>
  );
}
