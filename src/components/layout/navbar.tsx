// src/components/layout/navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  Grid,
  Settings,
  LayoutGrid,
  Activity,
  Github
} from 'lucide-react';
import { useLEDStore } from '@/lib/store/led-store';

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useLEDStore();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home
    },
    {
      name: 'Matrix',
      href: '/matrix',
      icon: Grid
    },
    {
      name: 'Patterns',
      href: '/patterns',
      icon: LayoutGrid
    },
    {
      name: 'Monitor',
      href: '/monitor',
      icon: Activity
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled 
          ? 'bg-gray-900/80 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 
                rounded-lg flex items-center justify-center">
                <Grid className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r 
                from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Trip Lights
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium 
                    transition-all duration-200 flex items-center space-x-2
                    ${isActive
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className={`text-sm ${
                isConnected ? 'text-green-500' : 'text-red-500'
              }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* GitHub Link */}
            <a
              href="https://github.com/yourusername/trip-lights"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white rounded-lg 
                hover:bg-white/5 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/80 
        backdrop-blur-lg border-t border-white/10">
        <nav className="flex justify-around py-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`p-2 rounded-lg flex flex-col items-center 
                  transition-colors
                  ${isActive
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}