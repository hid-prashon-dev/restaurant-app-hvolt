'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarNav } from './SidebarNav';
import Link from 'next/link';

export function MobileSidebar({ role }: { role: string | null | undefined }) {
  const [isOpen, setIsOpen] = useState(false);



  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      <Button variant="ghost" size="icon" className="md:hidden mr-2 -ml-2" onClick={() => setIsOpen(true)}>
        <Menu className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-lg animate-in slide-in-from-left duration-200 flex flex-col">
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg text-foreground" onClick={() => setIsOpen(false)}>
                <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs">
                  H
                </div>
                Himavolt
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="-mr-2 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex flex-1 flex-col overflow-y-auto py-4" onClick={() => setIsOpen(false)}>
              <SidebarNav role={role} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
