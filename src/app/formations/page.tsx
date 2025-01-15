import FormationList from './FormationList';
import FormationForm from './FormationForm';

export default function FormationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Formations</h1>
      <FormationForm />
      <FormationList />
    </div>
  );
}

