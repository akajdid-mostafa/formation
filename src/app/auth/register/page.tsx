'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });
    if (response.ok) {
      router.push('/auth/login');
    } else {
      alert('Registration failed');
    }
  };

  return (
    // <form onSubmit={handleRegister}>
    //   <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
    //   <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
    //   <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
    //   <button type="submit">Register</button>
    // </form>
    <section className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold">Not Have a page to Create an Account for login</h1>
        <h1 className="text-2xl font-extrabold">Go to this Page to create 
            <Link href="/auth/login">
            <span className='text-gray-800'> Login</span>
            </Link>
        </h1>
      </div>
    </section>
  );
}