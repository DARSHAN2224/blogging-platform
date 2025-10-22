'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PenSquare, Home, BookOpen, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export function Navbar() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <PenSquare className="h-6 w-6" />
            <span className="font-bold text-xl">BlogPlatform</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              aria-label="Toggle theme"
              onClick={() => setTheme((resolvedTheme === 'dark' ? 'light' : 'dark'))}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* CTA Button */}
            <Link href="/blog/new">
              <Button size="sm">
                <PenSquare className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button - TODO: Add mobile menu */}
          <div className="md:hidden">
            {/* Mobile menu can be added later if needed */}
          </div>
        </div>
      </div>
    </nav>
  );
}
