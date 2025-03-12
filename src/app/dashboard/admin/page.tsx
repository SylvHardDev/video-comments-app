"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<
    { id: string; email: string; role: string }[]
  >([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("collaborateur");
  const [loading, setLoading] = useState(false);

  // Redirection si l'utilisateur n'est pas admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Récupérer la liste des utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, role")
        .neq("role", "admin"); // Exclure l'admin

      if (error) {
        console.error("Erreur récupération utilisateurs :", error.message);
      } else {
        setUsers(data);
      }
    };

    fetchUsers();
  }, []);

  // Ajouter un utilisateur
  const handleAddUser = async () => {
    if (!email) return alert("Veuillez entrer un email.");

    setLoading(true);

    // Créer l'utilisateur avec un email d'activation
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

    if (error) {
      console.error("Erreur lors de l'invitation :", error.message);
      alert("Erreur : " + error.message);
      setLoading(false);
      return;
    }

    // Ajouter l'utilisateur dans la table `users`
    const { error: dbError } = await supabase
      .from("users")
      .insert([{ id: data.user?.id, email, role }]);

    if (dbError) {
      console.error("Erreur lors de l'ajout dans users :", dbError.message);
      alert("Erreur : " + dbError.message);
    } else {
      alert(
        `Invitation envoyée à ${email}. L'utilisateur doit activer son compte.`
      );
      setUsers([...users, { id: data.user?.id, email, role }]);
      setEmail("");
    }

    setLoading(false);
  };

  // Modifier le rôle d'un utilisateur
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      console.error("Erreur mise à jour du rôle :", error.message);
      alert("Erreur : " + error.message);
    } else {
      alert("Rôle mis à jour !");
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?"))
      return;

    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("Erreur suppression auth :", authError.message);
      alert("Erreur : " + authError.message);
      return;
    }

    const { error: dbError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);
    if (dbError) {
      console.error("Erreur suppression user DB :", dbError.message);
      alert("Erreur : " + dbError.message);
    } else {
      alert("Utilisateur supprimé !");
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>

        {/* Ajout d'un utilisateur */}
        <div className="mt-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 mr-2"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 mr-2"
          >
            <option value="collaborateur">Collaborateur</option>
            <option value="client">Client</option>
          </select>
          <button
            onClick={handleAddUser}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white disabled:bg-gray-400"
          >
            {loading ? "Ajout en cours..." : "Ajouter"}
          </button>
        </div>

        {/* Liste des utilisateurs */}
        <h2 className="text-xl font-semibold mt-6">Utilisateurs existants</h2>
        <ul className="mt-4">
          {users.map((u) => (
            <li
              key={u.id}
              className="border p-2 mb-2 flex justify-between items-center"
            >
              <span>
                {u.email} - {u.role}
              </span>
              <div>
                <select
                  value={u.role}
                  onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                  className="border p-1 mr-2"
                >
                  <option value="collaborateur">Collaborateur</option>
                  <option value="client">Client</option>
                </select>
                <button
                  onClick={() => handleDeleteUser(u.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ProtectedRoute>
  );
}
