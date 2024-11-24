// src/components/layout/app-layout.tsx
import { ReactNode } from 'react';
import { Navbar } from '@/components/layout/navbar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0f172a] to-black">
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}