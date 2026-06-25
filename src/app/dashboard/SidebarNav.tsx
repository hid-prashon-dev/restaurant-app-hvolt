'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, Hotel, Settings, Building2, Users, MapPin, Grid } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarNav({ role }: { role: string | null | undefined }) {
  const pathname = usePathname();

  const isOverviewActive = pathname === '/dashboard';
  const isMasterTenantsActive = pathname.startsWith('/dashboard/master/tenants');
  const isSuperTenantsActive = pathname.startsWith('/dashboard/superadmin/tenants');
  const isAdminBusinessActive = pathname.startsWith('/dashboard/admin/business');
  const isAdminModulesActive = pathname.startsWith('/dashboard/admin/modules');
  const isAdminLocationsActive = pathname.startsWith('/dashboard/admin/locations');
  const isAdminTeamActive = pathname.startsWith('/dashboard/admin/team');

  return (
    <>
      <nav className="grid items-start px-4 text-sm font-medium gap-1">
        <div className="px-2 py-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
          Operations
        </div>
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isOverviewActive 
              ? "text-primary bg-primary/10 hover:text-primary" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </Link>
        <Link
          href="/coming-soon"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <UtensilsCrossed className="h-4 w-4" />
          Restaurant
        </Link>
        <Link
          href="/coming-soon"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Hotel className="h-4 w-4" />
          Hotel
        </Link>

        {role === 'MASTER_ADMIN' && (
          <Link
            href="/dashboard/master/tenants"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isMasterTenantsActive
                ? "text-primary bg-primary/10 hover:text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Building2 className="h-4 w-4" />
            Tenants
          </Link>
        )}

        {role === 'SUPER_ADMIN' && (
          <Link
            href="/dashboard/superadmin/tenants"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSuperTenantsActive
                ? "text-primary bg-primary/10 hover:text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Building2 className="h-4 w-4" />
            Tenants
          </Link>
        )}

        {role === 'ADMIN' && (
          <>
            <Link
              href="/dashboard/admin/business"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isAdminBusinessActive
                  ? "text-primary bg-primary/10 hover:text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Building2 className="h-4 w-4" />
              My Business
            </Link>
            <Link
              href="/dashboard/admin/team"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isAdminTeamActive
                  ? "text-primary bg-primary/10 hover:text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Users className="h-4 w-4" />
              Team
            </Link>
            <Link
              href="/dashboard/admin/modules"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isAdminModulesActive
                  ? "text-primary bg-primary/10 hover:text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Grid className="h-4 w-4" />
              Modules
            </Link>
            <Link
              href="/dashboard/admin/locations"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isAdminLocationsActive
                  ? "text-primary bg-primary/10 hover:text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <MapPin className="h-4 w-4" />
              Locations
            </Link>
          </>
        )}
      </nav>
      
      <nav className="mt-auto grid items-start px-4 text-sm font-medium gap-1">
        <Link
          href="/coming-soon"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </nav>
    </>
  );
}
