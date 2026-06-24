import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CONTACT_EMAIL = "founders@himavolt.local";

export default function ContactPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-6">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">Contact Us</h1>
        <p className="text-xl text-muted-foreground">
          Reach out to discuss how Himavolt can unify your hospitality operations.
        </p>
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-6">
          <p className="text-foreground text-lg">
            Himavolt is currently available by invitation only. To request an early preview walkthrough, please contact the founders directly.
          </p>
          <div className="pt-4">
            <a href={`mailto:${CONTACT_EMAIL}`}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium w-full sm:w-auto h-14 px-8">
                Email {CONTACT_EMAIL}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
