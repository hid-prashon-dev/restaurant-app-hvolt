import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <section className="px-6 py-24 md:py-32 text-center bg-card border-b border-border">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground tracking-tight">How It Works</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Follow the planned operational flow of data through Himavolt. Our real-time-ready architecture is designed to keep your staff moving.
          </p>
        </div>
      </section>

      <section className="px-6 py-24 max-w-5xl mx-auto space-y-24">
        {/* Flow 1 */}
        <div className="space-y-8">
          <div className="border-b border-border pb-4">
            <h2 className="text-3xl font-heading font-bold text-foreground">Flow 1: The Restaurant Order</h2>
            <p className="text-muted-foreground mt-2">From table to till without manual input.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">1</div>
              <strong className="block text-foreground text-lg mb-2">The Guest Scans</strong>
              <p className="text-muted-foreground text-sm leading-relaxed">A guest sits at Table 4 and scans the QR code. They build their cart and tap order.</p>
            </div>
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl shadow-sm relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">2</div>
              <strong className="block text-foreground text-lg mb-2">The Kitchen Receives</strong>
              <p className="text-muted-foreground text-sm leading-relaxed">The KDS receives the ticket. The kitchen staff sees the order and taps "Preparing".</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">3</div>
              <strong className="block text-foreground text-lg mb-2">The Waiter Serves</strong>
              <p className="text-muted-foreground text-sm leading-relaxed">The waiter's tablet marks Table 4's food as ready. They deliver the food.</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">4</div>
              <strong className="block text-foreground text-lg mb-2">The Cashier Settles</strong>
              <p className="text-muted-foreground text-sm leading-relaxed">The POS already has the bill tallied. The guest pays, and the table is instantly cleared.</p>
            </div>
          </div>
        </div>

        {/* Flow 2 */}
        <div className="space-y-8">
          <div className="border-b border-border pb-4">
            <h2 className="text-3xl font-heading font-bold text-foreground">Flow 2: The Room Service Bridge</h2>
            <p className="text-muted-foreground mt-2">Connecting the kitchen to the guest folio securely.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">1</div>
              <strong className="block text-foreground text-lg mb-2">The Guest Orders</strong>
              <p className="text-muted-foreground text-sm leading-relaxed">A guest in Room 302 scans their room's unique QR code to order dinner.</p>
            </div>
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl shadow-sm relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">2</div>
              <strong className="block text-foreground text-lg mb-2">The Kitchen Cooks</strong>
              <p className="text-muted-foreground text-sm leading-relaxed">The restaurant KDS routes the ticket specifically marked as "Room 302 Delivery".</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">3</div>
              <strong className="block text-foreground text-lg mb-2">The Folio Syncs</strong>
              <p className="text-muted-foreground text-sm leading-relaxed">Rather than paying immediately, the $45 charge is securely transmitted to the Hotel Front Desk and added to the Room 302 folio.</p>
            </div>
          </div>
        </div>

        {/* Flow 3 */}
        <div className="space-y-8">
          <div className="border-b border-border pb-4">
            <h2 className="text-3xl font-heading font-bold text-foreground">Flow 3: Role-Based Routing</h2>
            <p className="text-muted-foreground mt-2">How security protects operations.</p>
          </div>
          <div className="bg-muted/30 border border-border rounded-xl p-8">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <p className="text-lg text-foreground">
                When a user logs in, the edge middleware verifies their server-side session and reads their database role.
              </p>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-card border border-border p-4 rounded-lg shadow-sm">
                  <div className="font-semibold text-sm">If Cashier:</div>
                  <div className="text-muted-foreground text-sm mt-1">Routed exclusively to `/dashboard/cashier`. Access to KDS is blocked.</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg shadow-sm">
                  <div className="font-semibold text-sm">If Front Desk:</div>
                  <div className="text-muted-foreground text-sm mt-1">Routed exclusively to `/dashboard/front-desk`. POS is blocked.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 bg-card border-t border-border text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl font-heading font-bold text-foreground">Ready to connect your teams?</h2>
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
