// src/components/navigation/nav-menu.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Matrix', href: '/matrix' },
  { name: 'Patterns', href: '/patterns' },
  { name: 'Monitor', href: '/monitor' },
];

export function NavigationMenu() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center space-x-1">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}