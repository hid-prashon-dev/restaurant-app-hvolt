import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ModulesPage() {
  const modules = [
    { name: "Master Admin", desc: "Global platform oversight for Himavolt operators." },
    { name: "SuperAdmin", desc: "Support and platform management tools." },
    { name: "Admin Dashboard", desc: "Full control over a specific tenant business." },
    { name: "QR Ordering", desc: "Self-service menus and ordering for guests." },
    { name: "Point of Sale (POS)", desc: "Billing, cash management, and check splitting." },
    { name: "Kitchen Display (KDS)", desc: "Real-time ticket routing and preparation tracking." },
    { name: "Waiter Dashboard", desc: "Table management and order entry for floor staff." },
    { name: "Hotel Bookings", desc: "Reservation calendar and availability engine." },
    { name: "Front Desk", desc: "Check-in, check-out, and guest management." },
    { name: "Housekeeping", desc: "Live room status and cleaning task management." },
    { name: "Guest Folios", desc: "Centralized billing for room and dining charges." },
    { name: "Room Service", desc: "Bridge connecting room QR to the restaurant kitchen." },
    { name: "Inventory", desc: "Stock tracking and live depletion alerts." },
    { name: "Reports", desc: "Live analytics for revenue, orders, and occupancy." },
    { name: "Security & RBAC", desc: "Strict row-level security and role isolation." }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <section className="px-6 py-24 md:py-32 text-center bg-card border-b border-border">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground tracking-tight">Platform Modules</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Every operational tool your hospitality business needs, integrated into a single ecosystem.
          </p>
        </div>
      </section>

      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {modules.map((mod, i) => (
            <div key={i} className="bg-card border border-border p-8 rounded-xl shadow-sm hover:border-primary/50 hover:shadow-md transition-all">
              <h3 className="text-xl font-bold font-heading text-foreground mb-3">{mod.name}</h3>
              <p className="text-muted-foreground leading-relaxed">{mod.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 bg-card border-t border-border text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl font-heading font-bold text-foreground">See them in action.</h2>
          <Link href="/get-demo">
            <Button size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md">
              Request a Demo
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
