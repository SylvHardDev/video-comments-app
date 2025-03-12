import ProtectedRoute from "@/components/ProtectedRoute";

export default function ClientDashboard() {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Espace Client</h1>
        <p>Bienvenue, client !</p>
      </div>
    </ProtectedRoute>
  );
}
