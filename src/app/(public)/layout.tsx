import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicNavbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
