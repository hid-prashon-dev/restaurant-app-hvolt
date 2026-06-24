import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HotelsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <section className="px-6 py-24 md:py-32 text-center bg-card border-b border-border">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground tracking-tight">Hotel Operations</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Front desk, housekeeping, and guest folios connected in one dashboard.
          </p>
        </div>
      </section>

      <section className="px-6 py-24 max-w-6xl mx-auto space-y-24">
        {/* Front Desk & Bookings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-foreground">Front Desk Workflow</h2>
            <p className="text-lg text-muted-foreground">Manage check-ins, view upcoming bookings, and assign rooms effortlessly. The front desk view provides total property visibility.</p>
          </div>
          <div className="bg-muted/30 border border-border p-8 rounded-xl flex justify-center">
            <div className="bg-card border border-border rounded-xl p-4 shadow-md flex flex-col gap-3 w-full max-w-sm">
              <div className="flex justify-between items-center p-3 border border-border rounded-lg bg-success/5">
                <div>
                  <div className="font-semibold text-foreground">Room 101</div>
                  <div className="text-xs text-muted-foreground">Standard Double</div>
                </div>
                <div className="text-sm font-medium text-success">Checked In</div>
              </div>
              <div className="flex justify-between items-center p-3 border border-border rounded-lg bg-background">
                <div>
                  <div className="font-semibold text-foreground">Room 102</div>
                  <div className="text-xs text-muted-foreground">Standard Double</div>
                </div>
                <div className="text-sm font-medium text-muted-foreground">Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Folios & Room Service */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 bg-muted/30 border border-border p-8 rounded-xl flex justify-center">
             <div className="bg-card border border-border rounded-xl p-6 shadow-md w-full max-w-sm">
               <div className="font-semibold mb-4 border-b border-border pb-3">Room 101 Folio</div>
               <div className="flex justify-between text-sm py-1.5"><span>Room Rate (2 nights)</span><span className="font-medium">$240.00</span></div>
               <div className="flex justify-between text-sm py-1.5 text-primary"><span>Room Service (Dinner)</span><span className="font-medium">$45.00</span></div>
               <div className="flex justify-between text-sm py-1.5 text-primary"><span>Mini-bar</span><span className="font-medium">$12.00</span></div>
               <div className="flex justify-between font-bold mt-4 pt-4 border-t border-border"><span>Balance Due</span><span>$297.00</span></div>
             </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-3xl font-heading font-bold text-foreground">Unified Guest Folios</h2>
            <p className="text-lg text-muted-foreground">Say goodbye to paper receipts. When a guest orders from the restaurant or scans the QR code in their room, the bill is securely routed directly to their front desk folio.</p>
          </div>
        </div>

        {/* Housekeeping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-foreground">Housekeeping Operations</h2>
            <p className="text-lg text-muted-foreground">When a guest checks out, the system is designed to seamlessly alert the housekeeping dashboard. Staff mark the room clean, making it instantly available for the front desk.</p>
          </div>
          <div className="bg-muted/30 border border-border p-8 rounded-xl flex justify-center">
             <div className="bg-card border border-border rounded-xl p-4 shadow-md w-full max-w-sm flex flex-col gap-3">
              <div className="flex justify-between items-center p-3 border border-warning/30 rounded-lg bg-warning/5">
                <div>
                  <div className="font-semibold text-foreground">Room 204</div>
                  <div className="text-xs font-medium text-warning mt-1">Needs Cleaning</div>
                </div>
                <Button variant="outline" size="sm" className="border-border text-foreground">Mark Clean</Button>
              </div>
             </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 bg-card border-t border-border text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl font-heading font-bold text-foreground">Streamline your property.</h2>
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
