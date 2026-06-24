import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Public Navbar Shell */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold font-heading">
            H
          </div>
          <span className="text-xl font-heading font-bold text-foreground tracking-tight">Himavolt</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/coming-soon" className="hover:text-primary transition-colors">Platform</Link>
          <Link href="/coming-soon" className="hover:text-primary transition-colors">Restaurants</Link>
          <Link href="/coming-soon" className="hover:text-primary transition-colors">Hotels</Link>
          <Link href="/coming-soon" className="hover:text-primary transition-colors">Modules</Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button variant="outline" className="hidden sm:inline-flex border-border text-foreground hover:bg-muted">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="hidden sm:inline-flex border-border text-foreground hover:bg-muted">
                Log in
              </Button>
            </Link>
          )}
          <Link href="/coming-soon">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
              Get Demo
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted via-background to-background opacity-70"></div>
        
        <div className="max-w-4xl z-10 space-y-8">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            The Unified Hospitality OS
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-semibold text-foreground tracking-tight leading-[1.1]">
            Run your restaurant and hotel in real time.
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
            Himavolt connects QR ordering, kitchen displays, front desk operations, room service, housekeeping, and guest folios inside one instant-feeling hospitality platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/coming-soon">
              <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90">
                Explore Platform
              </Button>
            </Link>
            <Link href="/coming-soon">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-border hover:bg-muted text-foreground">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
