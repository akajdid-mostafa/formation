'use client'


import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth(); // Add loading state
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [user, router, pathname, loading]);

    if (loading) {
        return <div>Loading...</div>; // Show a loading spinner
    }

    return user ? <>{children}</> : null;
};

export default ProtectedRoute;