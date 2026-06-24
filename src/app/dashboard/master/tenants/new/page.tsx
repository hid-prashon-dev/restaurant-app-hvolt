import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { createTenant } from '@/app/actions/tenant';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function NewTenantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'MASTER_ADMIN') redirect('/access-denied');

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Create Tenant</h1>
        <p className="text-muted-foreground mt-2">Provision a new business workspace.</p>
      </div>

      <form action={createTenant} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Public Name</label>
          <input type="text" name="public_name" required className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Sunset Bistro" />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Legal Name (Optional)</label>
          <input type="text" name="legal_name" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Sunset LLC" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">URL Slug</label>
          <input type="text" name="slug" required pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" title="Lowercase alphanumeric with hyphens between words only" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. sunset-bistro" />
          <p className="text-xs text-muted-foreground">Lowercase alphanumeric. Hyphens allowed only between words. No spaces.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Business Type</label>
          <select name="business_type" required className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="RESTAURANT">Restaurant</option>
            <option value="HOTEL">Hotel</option>
            <option value="HYBRID">Hybrid (Hotel & Restaurant)</option>
            <option value="CAFE">Cafe</option>
            <option value="RESORT">Resort</option>
          </select>
        </div>

        <div className="pt-4 border-t border-border flex justify-end gap-3">
          <Link href="/dashboard/master/tenants">
            <Button type="button" variant="outline" className="border-border">Cancel</Button>
          </Link>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Create Tenant</Button>
        </div>
      </form>
    </div>
  );
}
