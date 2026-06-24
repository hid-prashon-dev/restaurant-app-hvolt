import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RestaurantsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <section className="px-6 py-24 md:py-32 text-center bg-card border-b border-border">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground tracking-tight">Restaurant Operations</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            From the table to the kitchen to the till. A unified flow for modern dining.
          </p>
        </div>
      </section>

      <section className="px-6 py-24 max-w-6xl mx-auto space-y-24">
        {/* QR Ordering */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-foreground">QR Ordering</h2>
            <p className="text-lg text-muted-foreground">Guests scan the code on their table to view the live menu, place orders, and request service directly from their phones without waiting.</p>
          </div>
          <div className="bg-muted/30 border border-border p-8 rounded-xl flex items-center justify-center">
            <div className="bg-card border border-border rounded-xl p-6 max-w-xs w-full shadow-md">
              <div className="font-semibold border-b border-border pb-3 mb-4 text-center">Table 12 Order</div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span>Truffle Fries</span><span className="font-medium">$8.00</span></div>
                <div className="flex justify-between text-sm"><span>Wagyu Burger</span><span className="font-medium">$24.00</span></div>
              </div>
              <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" size="lg">Send to Kitchen</Button>
            </div>
          </div>
        </div>

        {/* Kitchen Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 bg-primary/5 border border-primary/20 p-8 rounded-xl flex items-center justify-center">
            <div className="bg-card border border-border rounded-xl p-6 shadow-md w-full max-w-sm">
              <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
                <div className="font-semibold text-primary">New Ticket #042</div>
                <div className="text-xs font-medium text-warning flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-warning"></span> 0:00
                </div>
              </div>
              <ul className="space-y-3 text-sm text-foreground">
                <li className="flex items-start gap-3"><div className="w-4 h-4 border-2 border-border rounded-sm mt-0.5"></div> 1x Truffle Fries</li>
                <li className="flex items-start gap-3"><div className="w-4 h-4 border-2 border-border rounded-sm mt-0.5"></div> 1x Wagyu Burger <br/><span className="text-muted-foreground text-xs mt-1 block">Medium Rare</span></li>
              </ul>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-3xl font-heading font-bold text-foreground">Kitchen Display System</h2>
            <p className="text-lg text-muted-foreground">Ditch paper tickets. Our real-time-ready architecture is designed so orders will appear on the KDS instantly. Kitchen staff will mark items as preparing or ready, directing a fast-paced workflow.</p>
          </div>
        </div>

        {/* POS & Cashier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-foreground">POS & Cashier Workflow</h2>
            <p className="text-lg text-muted-foreground">Bills are automatically tallied as orders flow through the system. Cashiers can split checks, add tips, apply discounts, or sync the bill directly to a hotel room folio.</p>
          </div>
          <div className="bg-muted/30 border border-border p-8 rounded-xl flex items-center justify-center">
             <div className="bg-card border border-border rounded-xl p-6 shadow-md w-full max-w-sm">
               <div className="flex justify-between text-xl font-bold mb-6 border-b border-border pb-4"><span>Total Due</span><span>$32.00</span></div>
               <div className="grid grid-cols-2 gap-3">
                 <Button variant="outline" className="border-border text-foreground h-12">Cash</Button>
                 <Button variant="outline" className="border-border text-foreground h-12">Card</Button>
                 <Button variant="outline" className="col-span-2 border-primary/50 text-primary hover:bg-primary/10 h-12">Sync to Room Folio</Button>
               </div>
             </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 bg-card border-t border-border text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl font-heading font-bold text-foreground">Optimize your restaurant floor.</h2>
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
