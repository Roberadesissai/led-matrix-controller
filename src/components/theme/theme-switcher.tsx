// src/components/theme/theme-switcher.tsx
'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from './theme-store';

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const themes = [
    {
      name: 'Light',
      value: 'light' as const,
      icon: Sun,
    },
    {
      name: 'Dark',
      value: 'dark' as const,
      icon: Moon,
    },
    {
      name: 'System',
      value: 'system' as const,
      icon: Monitor,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-lg 
          bg-white/5 hover:bg-white/10 transition-colors relative"
        aria-label="Theme switcher"
      >
        {theme === 'light' && <Sun className="w-5 h-5" />}
        {theme === 'dark' && <Moon className="w-5 h-5" />}
        {theme === 'system' && <Monitor className="w-5 h-5" />}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-900 border border-white/10 
            rounded-lg shadow-xl z-50 backdrop-blur-lg bg-opacity-90">
            {themes.map(({ name, value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left flex items-center space-x-2 
                  hover:bg-white/5 transition-colors
                  ${theme === value ? 'text-blue-400' : 'text-gray-400'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{name}</span>
                {theme === value && (
                  <span className="absolute right-2 w-2 h-2 bg-blue-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}