import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PlatformPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <section className="px-6 py-24 md:py-32 text-center bg-card border-b border-border">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground tracking-tight">The Unified Platform</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Himavolt connects the front of house, back of house, kitchen, and management into a single, real-time operating system.
          </p>
        </div>
      </section>
      
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-foreground">What Himavolt Connects</h2>
            <p className="text-muted-foreground text-lg">We remove the boundaries between your restaurant and your hotel. Data flows instantly where it needs to go without manual syncing.</p>
            <ul className="space-y-4">
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">1</div>
                <div>
                  <strong className="text-foreground block">Customer Interface</strong>
                  <span className="text-muted-foreground text-sm">QR Menus, Digital Room Service, Self-Checkout</span>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">2</div>
                <div>
                  <strong className="text-foreground block">Staff Operations</strong>
                  <span className="text-muted-foreground text-sm">POS, KDS, Front Desk, Housekeeping</span>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">3</div>
                <div>
                  <strong className="text-foreground block">Management Oversight</strong>
                  <span className="text-muted-foreground text-sm">Inventory, RBAC, Consolidated Reporting</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-muted/30 border border-border p-8 rounded-xl">
            <div className="space-y-6">
              <div className="p-4 bg-card border border-border rounded-lg text-center font-medium shadow-sm">QR Scan & Order</div>
              <div className="flex justify-center text-muted-foreground">↓</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 border border-primary/20 text-primary rounded-lg text-center font-medium shadow-sm">Kitchen Display</div>
                <div className="p-4 bg-card border border-border rounded-lg text-center font-medium shadow-sm">Waiter Tablet</div>
              </div>
              <div className="flex justify-center text-muted-foreground">↓</div>
              <div className="p-4 bg-card border border-border rounded-lg text-center font-medium shadow-sm">Guest Folio & POS</div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-heading font-bold text-foreground">Role-Based Operations</h2>
          <p className="text-muted-foreground text-lg">Every user sees exactly what they need to do their job, governed by strict server-side rules.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
            <div className="border border-border p-4 rounded-lg bg-background font-medium shadow-sm">Master Admin</div>
            <div className="border border-border p-4 rounded-lg bg-background font-medium shadow-sm">SuperAdmin</div>
            <div className="border border-border p-4 rounded-lg bg-background font-medium shadow-sm">Tenant Admin</div>
            <div className="border border-border p-4 rounded-lg bg-background font-medium shadow-sm">Manager</div>
            <div className="border border-border p-4 rounded-lg bg-background font-medium shadow-sm">Cashier</div>
            <div className="border border-border p-4 rounded-lg bg-background font-medium shadow-sm">Kitchen</div>
            <div className="border border-border p-4 rounded-lg bg-background font-medium shadow-sm">Front Desk</div>
            <div className="border border-border p-4 rounded-lg bg-background font-medium shadow-sm">Housekeeping</div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 max-w-5xl mx-auto text-center space-y-8">
        <h2 className="text-3xl font-heading font-bold text-foreground">A Secure Foundation</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Built on a server-side auth foundation and PostgreSQL with Row-Level Security. It is designed around tenant-aware access boundaries, preparing for isolated hospitality operations and a real-time-ready architecture.
        </p>
        <div className="pt-8">
          <Link href="/get-demo" className="inline-block">
            <Button size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md">
              Request a Demo
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
