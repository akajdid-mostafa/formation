// components/Navbar.tsx
'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/auth/login'); // Redirect to login page after logout
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <nav className=" p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl    font-bold">
        Ocean Management Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="bg-black font-bold text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}