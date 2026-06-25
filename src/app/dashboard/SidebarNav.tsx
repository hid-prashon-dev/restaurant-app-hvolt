'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, Hotel, Settings, Building2, Users, MapPin, Grid, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const NavItem = ({ href, icon: Icon, label, isActive }: { href: string, icon: any, label: string, isActive: boolean }) => {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "text-primary bg-primary/10 hover:text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Icon className={cn("h-4 w-4 transition-transform group-active:scale-90", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
      <span>{label}</span>
    </Link>
  );
};

export function SidebarNav({ role }: { role: string | null | undefined }) {
  const pathname = usePathname();

  const isOverviewActive = pathname === '/dashboard';
  const isMasterTenantsActive = pathname.startsWith('/dashboard/master/tenants');
  const isSuperTenantsActive = pathname.startsWith('/dashboard/superadmin/tenants');
  const isAdminBusinessActive = pathname.startsWith('/dashboard/admin/business');
  const isAdminModulesActive = pathname.startsWith('/dashboard/admin/modules');
  const isAdminLocationsActive = pathname.startsWith('/dashboard/admin/locations');
  const isAdminTeamActive = pathname.startsWith('/dashboard/admin/team');
  const isAdminMenuActive = pathname.startsWith('/dashboard/admin/menu');

  return (
    <>
      <nav className="grid items-start px-4 text-sm font-medium gap-1">
        <div className="px-2 py-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
          Operations
        </div>
        
        <NavItem href="/dashboard" icon={LayoutDashboard} label="Overview" isActive={isOverviewActive} />
        <NavItem href="/coming-soon" icon={UtensilsCrossed} label="Restaurant" isActive={false} />
        <NavItem href="/coming-soon" icon={Hotel} label="Hotel" isActive={false} />

        {role === 'MASTER_ADMIN' && (
          <NavItem href="/dashboard/master/tenants" icon={Building2} label="Tenants" isActive={isMasterTenantsActive} />
        )}

        {role === 'SUPER_ADMIN' && (
          <NavItem href="/dashboard/superadmin/tenants" icon={Building2} label="Tenants" isActive={isSuperTenantsActive} />
        )}

        {role === 'ADMIN' && (
          <>
            <NavItem href="/dashboard/admin/business" icon={Building2} label="My Business" isActive={isAdminBusinessActive} />
            <NavItem href="/dashboard/admin/team" icon={Users} label="Team" isActive={isAdminTeamActive} />
            <NavItem href="/dashboard/admin/modules" icon={Grid} label="Modules" isActive={isAdminModulesActive} />
            <NavItem href="/dashboard/admin/locations" icon={MapPin} label="Locations" isActive={isAdminLocationsActive} />
            <NavItem href="/dashboard/admin/menu" icon={BookOpen} label="Menu" isActive={isAdminMenuActive} />
          </>
        )}
      </nav>
      
      <nav className="mt-auto grid items-start px-4 text-sm font-medium gap-1">
        <NavItem href="/coming-soon" icon={Settings} label="Settings" isActive={false} />
      </nav>
    </>
  );
}
