import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold font-heading text-xs">
              H
            </div>
            <span className="text-lg font-heading font-bold text-foreground tracking-tight">Himavolt</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            The unified real-time operating system for restaurants, hotels, and connected hospitality.
          </p>
        </div>
        
        <div>
          <h3 className="font-heading font-semibold text-foreground mb-4">Product</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link href="/platform" className="hover:text-primary transition-colors">Platform Overview</Link></li>
            <li><Link href="/restaurants" className="hover:text-primary transition-colors">For Restaurants</Link></li>
            <li><Link href="/hotels" className="hover:text-primary transition-colors">For Hotels</Link></li>
            <li><Link href="/modules" className="hover:text-primary transition-colors">All Modules</Link></li>
            <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-heading font-semibold text-foreground mb-4">Company</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link href="/get-demo" className="hover:text-primary transition-colors">Request Demo</Link></li>
            <li><Link href="/login" className="hover:text-primary transition-colors">Staff Login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-heading font-semibold text-foreground mb-4">Legal</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link href="/security" className="hover:text-primary transition-colors">Security Overview</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Himavolt Hospitality Systems. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-muted-foreground/50"></span>
          <span className="text-xs font-medium text-muted-foreground">Himavolt preview online</span>
        </div>
      </div>
    </footer>
  );
}
