import { Button } from '@/components/ui/button';
import { CONTACT_EMAIL } from '@/lib/constants';

export default function ContactPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-6 bg-background">
      <div className="max-w-2xl w-full space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">Contact Himavolt</h1>
          <p className="text-xl text-muted-foreground">
            Get in touch with the team for inquiries not related to a direct product walkthrough.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-8 text-left">
          <div>
            <h3 className="font-heading font-bold text-foreground mb-4 text-xl">We're here to help with:</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                General questions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Partnerships
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Technical discussion
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Access inquiries
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Product feedback
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Early support
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm text-muted-foreground max-w-xs">
              Reach out to our founding team directly. We typically respond within 24 hours.
            </p>
            <a href={`mailto:${CONTACT_EMAIL}?subject=Himavolt%20Contact`}>
              <Button size="lg" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-medium w-full sm:w-auto h-12 px-8 shadow-sm">
                Email Himavolt
              </Button>
            </a>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Looking for a product tour? <a href="/get-demo" className="text-primary hover:underline font-medium">Request a walkthrough here.</a>
        </p>
      </div>
    </div>
  )
}
