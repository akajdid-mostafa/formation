import FormationList from "./FormationList";
import FormationForm from "./FormationForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function FormationsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Formations</h1>
        <FormationForm />
        <FormationList />
      </div>
    </ProtectedRoute>
  );
}
