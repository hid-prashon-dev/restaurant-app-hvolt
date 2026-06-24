'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function MobileMenu({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-foreground focus:outline-none"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isOpen ? (
            <>
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </>
          ) : (
            <>
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </>
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3 font-medium text-muted-foreground">
            <Link href="/platform" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2">Platform</Link>
            <Link href="/restaurants" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2">Restaurants</Link>
            <Link href="/hotels" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2">Hotels</Link>
            <Link href="/modules" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2">Modules</Link>
            <Link href="/how-it-works" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2">How It Works</Link>
          </nav>
          <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-border">
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                  Log in
                </Button>
              </Link>
            )}
            <Link href="/get-demo" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                Get Demo
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
