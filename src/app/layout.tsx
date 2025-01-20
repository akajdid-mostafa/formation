'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from '@/context/AuthContext';
import Navbar from "@/components/navbar";
import { usePathname } from 'next/navigation'; // Import usePathname
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Get the current route

  // Define routes where the Navbar should be hidden
  const hideNavbarRoutes = ['/auth/login', '/auth/register'];

  // Check if the current route is in the hideNavbarRoutes array
  const shouldShowNavbar = !hideNavbarRoutes.includes(pathname);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {shouldShowNavbar && <Navbar />} {/* Conditionally render Navbar */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}