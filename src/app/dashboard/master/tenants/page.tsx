import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tenant } from '@/types';

export default async function MasterTenantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'MASTER_ADMIN') redirect('/access-denied');

  const { data: tenants } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold text-foreground">Tenants</h1>
        <Link href="/dashboard/master/tenants/new">
          <Button className="bg-primary hover:bg-primary/90">Add Tenant</Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tenants?.map((tenant: Tenant) => (
              <tr key={tenant.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{tenant.public_name}</td>
                <td className="px-6 py-4 text-muted-foreground">{tenant.slug}</td>
                <td className="px-6 py-4 text-muted-foreground">{tenant.business_type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${tenant.status === 'ACTIVE' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/dashboard/master/tenants/${tenant.id}`}>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </Link>
                </td>
              </tr>
            ))}
            {!tenants?.length && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No tenants found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
