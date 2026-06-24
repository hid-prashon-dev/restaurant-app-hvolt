import { Button } from '@/components/ui/button';
import { CONTACT_EMAIL } from '@/lib/constants';

export default function GetDemoPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-6 bg-background">
      <div className="max-w-3xl w-full space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">Request a Himavolt Walkthrough</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Himavolt is currently invite-only. We are offering exclusive previews for hospitality operators looking to unify their systems.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <h3 className="font-heading font-bold text-lg text-foreground mb-2">Restaurants</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• POS & Cashier workflows</li>
              <li>• Live Kitchen Display (KDS)</li>
              <li>• QR ordering integration</li>
              <li>• Staff & inventory operations</li>
            </ul>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <h3 className="font-heading font-bold text-lg text-foreground mb-2">Hotels</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• Front desk & booking engine</li>
              <li>• Room service bridge to kitchen</li>
              <li>• Unified guest folios</li>
              <li>• Housekeeping alerts</li>
            </ul>
          </div>
        </div>

        <div className="bg-muted/50 border border-border rounded-xl p-8 shadow-sm max-w-xl mx-auto space-y-6">
          <p className="text-foreground text-lg">
            Ready to see how Himavolt connects your operations?
          </p>
          <div className="pt-2">
            <a href={`mailto:${CONTACT_EMAIL}?subject=Himavolt%20Demo%20Request`}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium w-full sm:w-auto h-14 px-10 text-lg shadow-md">
                Request a walkthrough
              </Button>
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * This will open your default email client. A formal intake system will be available prior to public launch.
          </p>
        </div>
      </div>
    </div>
  )
}
