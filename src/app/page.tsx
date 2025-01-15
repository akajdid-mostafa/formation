import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Formation Management</h1>
      <div className="space-y-4">
        <Link href="/formations" className="block p-4 bg-blue-500 text-white rounded hover:bg-blue-600">
          Manage Formations
        </Link>
        <Link href="/professors" className="block p-4 bg-green-500 text-white rounded hover:bg-green-600">
          Manage Professors
        </Link>
      </div>
    </div>
  );
}

