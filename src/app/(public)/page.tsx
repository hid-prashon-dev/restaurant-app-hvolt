import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 1. Hero Section */}
      <section className="px-6 py-24 md:py-32 text-center relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted via-background to-background opacity-70"></div>
        <div className="max-w-4xl z-10 space-y-8">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            The Unified Hospitality OS
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-foreground tracking-tight leading-[1.1]">
            Run your restaurant and hotel operations smoothly.
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
            Himavolt connects QR ordering, kitchen displays, front desk operations, room service, housekeeping, and guest folios inside one instant-feeling hospitality platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/platform">
              <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                Explore Platform
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-border hover:bg-muted text-foreground font-medium">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Hospitality OS Visual Preview */}
      <section className="px-6 pb-24 max-w-6xl mx-auto w-full">
        <div className="relative rounded-2xl border border-border bg-card p-2 shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-12 border-b border-border bg-muted/50 rounded-t-xl flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-border"></div>
            <div className="w-3 h-3 rounded-full bg-border"></div>
            <div className="w-3 h-3 rounded-full bg-border"></div>
          </div>
          <div className="pt-16 pb-8 px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <div className="text-sm font-medium text-muted-foreground">Table 5 (Guest UI)</div>
              <div className="font-heading font-semibold text-lg">🍔 Truffle Burger ordered via QR</div>
              <div className="text-xs text-success font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success"></span> Order sent instantly
              </div>
            </div>
            <div className="border border-primary/30 rounded-lg p-6 space-y-4 bg-primary/5">
              <div className="text-sm font-medium text-primary">Kitchen Display (Staff UI)</div>
              <div className="font-heading font-semibold text-lg text-foreground">New Ticket: Truffle Burger</div>
              <div className="text-xs text-warning font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-warning"></span> Preparing now
              </div>
            </div>
            <div className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <div className="text-sm font-medium text-muted-foreground">Front Desk (Admin UI)</div>
              <div className="font-heading font-semibold text-lg">Bill synced to Room 302 Folio</div>
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Reconciled securely
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Restaurant Operations Section */}
      <section className="px-6 py-24 bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-heading font-bold text-foreground">A lightning-fast kitchen and floor.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Ditch the paper tickets. Guests scan and order securely, the Kitchen Display System (KDS) receives it instantly, and your POS updates the bill without any manual sync.
            </p>
            <ul className="space-y-3 text-foreground font-medium">
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span> Direct-to-Kitchen QR ordering
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span> Unified POS billing
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span> Live inventory depletion
              </li>
            </ul>
            <div className="pt-4">
              <Link href="/restaurants" className="text-primary font-medium hover:underline">Explore Restaurant Operations &rarr;</Link>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div className="font-semibold">Table 12</div>
                <div className="text-success text-sm font-medium">Active</div>
              </div>
              <div className="flex justify-between items-center py-2">
                <div className="text-muted-foreground">2x Ribeye Steak</div>
                <div className="font-medium">$84.00</div>
              </div>
              <div className="flex justify-between items-center py-2">
                <div className="text-muted-foreground">1x Pinot Noir</div>
                <div className="font-medium">$45.00</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Hotel Operations Section */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 bg-card border border-border rounded-xl p-8 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div className="font-semibold">Room 401 (Deluxe Suite)</div>
                <div className="text-warning text-sm font-medium">Needs Cleaning</div>
              </div>
              <div className="flex justify-between items-center py-2">
                <div className="text-muted-foreground">Guest: Smith Family</div>
                <div className="font-medium">Check-out Today</div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div className="bg-warning h-2 rounded-full w-1/3"></div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-4xl font-heading font-bold text-foreground">Total property visibility.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your front desk and housekeeping teams stay perfectly synced. Know exactly which rooms are ready, track guest bookings, and manage complete guest folios from one place.
            </p>
            <ul className="space-y-3 text-foreground font-medium">
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span> Live room status
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span> Booking management
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span> Housekeeping alerts
              </li>
            </ul>
            <div className="pt-4">
              <Link href="/hotels" className="text-primary font-medium hover:underline">Explore Hotel Operations &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Room Service Integration Section */}
      <section className="px-6 py-24 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-heading font-bold text-foreground">The ultimate room service bridge.</h2>
          <p className="text-xl text-muted-foreground">
            Hotels and restaurants usually operate in silos. Himavolt connects them. A guest scans the QR in their room, the kitchen gets the ticket, and the bill automatically syncs to the front desk folio.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8">
            <div className="p-6 border border-border rounded-xl bg-background">
              <div className="font-bold text-2xl mb-2">1. Scan</div>
              <p className="text-muted-foreground text-sm">Guest scans room QR.</p>
            </div>
            <div className="p-6 border border-primary/30 rounded-xl bg-primary/5">
              <div className="font-bold text-2xl text-primary mb-2">2. Cook</div>
              <p className="text-muted-foreground text-sm">Kitchen gets ticket instantly.</p>
            </div>
            <div className="p-6 border border-border rounded-xl bg-background">
              <div className="font-bold text-2xl mb-2">3. Sync</div>
              <p className="text-muted-foreground text-sm">Bill added to front desk folio.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Real-time Workflow Section */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <h2 className="text-4xl font-heading font-bold text-foreground">Real-time-ready architecture.</h2>
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
            <div className="flex-1 bg-muted/50 rounded-xl p-8 text-left border border-border">
              <h3 className="font-semibold text-lg mb-2">Designed for instant updates</h3>
              <p className="text-muted-foreground text-sm">Our planned real-time operational flow will ensure that the moment an order is placed, it connects to the KDS smoothly.</p>
            </div>
            <div className="flex-1 bg-muted/50 rounded-xl p-8 text-left border border-border">
              <h3 className="font-semibold text-lg mb-2">Instant folio updates</h3>
              <p className="text-muted-foreground text-sm">Restaurant charges are securely routed to hotel folios the second the waiter closes the ticket.</p>
            </div>
            <div className="flex-1 bg-muted/50 rounded-xl p-8 text-left border border-border">
              <h3 className="font-semibold text-lg mb-2">Live inventory alerts</h3>
              <p className="text-muted-foreground text-sm">If an ingredient runs out, it marks the menu item sold out everywhere simultaneously.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Role-based Dashboard Preview */}
      <section className="px-6 py-24 bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-heading font-bold text-foreground">Role-based access model.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every staff member gets a customized dashboard. A cashier sees the POS. Housekeeping sees dirty rooms. Managers see reports. You control exactly who sees what.
            </p>
            <Link href="/platform" className="inline-block mt-4 text-primary font-medium hover:underline">Learn about our roles &rarr;</Link>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-card border border-border p-4 rounded-lg shadow-sm text-center">
              <div className="font-medium">Cashier View</div>
              <div className="text-xs text-muted-foreground mt-1">POS & Bills Only</div>
            </div>
            <div className="bg-card border border-border p-4 rounded-lg shadow-sm text-center">
              <div className="font-medium">Kitchen View</div>
              <div className="text-xs text-muted-foreground mt-1">KDS & Inventory</div>
            </div>
            <div className="bg-card border border-border p-4 rounded-lg shadow-sm text-center">
              <div className="font-medium">Front Desk View</div>
              <div className="text-xs text-muted-foreground mt-1">Rooms & Bookings</div>
            </div>
            <div className="bg-primary text-primary-foreground p-4 rounded-lg shadow-sm text-center border border-primary/50">
              <div className="font-medium">Admin View</div>
              <div className="text-xs opacity-90 mt-1">Full Tenant Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Security and Trust Section */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-heading font-bold text-foreground">Secure by design.</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Himavolt is structured for role-based access control and built on a server-side auth foundation. It is designed around tenant-aware access boundaries to prepare for isolated operations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium">Tenant Isolation</span>
            <span className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium">Server-side Sessions</span>
            <span className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium">Row-Level Security</span>
          </div>
        </div>
      </section>

      {/* 9. Get Demo CTA Section */}
      <section className="px-6 py-32 bg-card border-t border-border text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-5xl font-heading font-bold text-foreground">Ready to unify your operations?</h2>
          <p className="text-xl text-muted-foreground">
            Himavolt is currently available by invitation only for select hospitality teams.
          </p>
          <div className="pt-4">
            <Link href="/get-demo">
              <Button size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md">
                Request a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
