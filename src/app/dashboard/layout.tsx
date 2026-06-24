import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, Hotel, Settings, UserCircle, Bell, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/login/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Persistent Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg text-foreground">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs">
              H
            </div>
            Himavolt
          </Link>
        </div>
        
        <div className="flex flex-1 flex-col overflow-y-auto py-4">
          <nav className="grid items-start px-4 text-sm font-medium gap-1">
            <div className="px-2 py-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Operations
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-primary bg-primary/10 transition-all hover:text-primary"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>
            <Link
              href="/coming-soon"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Restaurant
            </Link>
            <Link
              href="/coming-soon"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
            >
              <Hotel className="h-4 w-4" />
              Hotel
            </Link>
          </nav>
          
          <nav className="mt-auto grid items-start px-4 text-sm font-medium gap-1">
            <Link
              href="/coming-soon"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col md:pl-64 flex-1">
        {/* Persistent Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-6 shadow-sm">
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            <div className="hidden sm:block">
              <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                System Operational
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-foreground relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary ring-2 ring-card"></span>
            </button>
            <button className="flex items-center gap-2">
              <UserCircle className="h-8 w-8 text-muted-foreground" />
            </button>
            <form action={logout}>
              <button className="text-destructive hover:text-destructive/80 transition-colors flex items-center" title="Log out">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>
        
        {/* Instant Route Content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
