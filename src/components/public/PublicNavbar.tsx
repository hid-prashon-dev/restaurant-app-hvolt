import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/server';
import { MobileMenu } from './MobileMenu';

export async function PublicNavbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <Link href="/" className="flex items-center gap-2 relative z-10">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold font-heading">
          H
        </div>
        <span className="text-xl font-heading font-bold text-foreground tracking-tight">Himavolt</span>
      </Link>

      <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-muted-foreground">
        <Link href="/platform" className="hover:text-primary transition-colors">Platform</Link>
        <Link href="/restaurants" className="hover:text-primary transition-colors">Restaurants</Link>
        <Link href="/hotels" className="hover:text-primary transition-colors">Hotels</Link>
        <Link href="/modules" className="hover:text-primary transition-colors">Modules</Link>
        <Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
        <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
      </nav>

      <div className="hidden md:flex items-center gap-4">
        {isAuthenticated ? (
          <Link href="/dashboard">
            <Button variant="outline" className="border-border text-foreground hover:bg-muted font-medium">
              Dashboard
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="outline" className="border-border text-foreground hover:bg-muted font-medium">
              Log in
            </Button>
          </Link>
        )}
        <Link href="/get-demo">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors shadow-sm">
            Get Demo
          </Button>
        </Link>
      </div>

      <MobileMenu isAuthenticated={isAuthenticated} />
    </header>
  );
}
