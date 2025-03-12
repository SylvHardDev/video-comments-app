import ProtectedRoute from "@/components/ProtectedRoute";

export default function CollaborateurDashboard() {
  return (
    <ProtectedRoute allowedRoles={["collaborateur"]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Espace Collaborateur</h1>
        <p>Bienvenue, collaborateur !</p>
      </div>
    </ProtectedRoute>
  );
}
