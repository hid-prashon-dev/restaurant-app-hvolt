import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background text-center px-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold font-heading">
          H
        </div>
      </div>
      <h1 className="text-4xl font-heading font-bold text-foreground mb-4 tracking-tight">
        Coming Soon
      </h1>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        This module is currently under construction as we build the ultimate hospitality operating system.
      </p>
      <Link href="/">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
