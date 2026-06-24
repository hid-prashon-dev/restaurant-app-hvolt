import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Tenant } from '@/types';

export default async function SuperAdminTenantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'SUPER_ADMIN') redirect('/access-denied');

  const { data: tenants } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold text-foreground">Global Tenants (Read-Only)</h1>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tenants?.map((tenant: Tenant) => (
              <tr key={tenant.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{tenant.public_name}</td>
                <td className="px-6 py-4 text-muted-foreground">{tenant.slug}</td>
                <td className="px-6 py-4 text-muted-foreground">{tenant.business_type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border bg-muted border-border`}>
                    {tenant.status}
                  </span>
                </td>
              </tr>
            ))}
            {!tenants?.length && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  No tenants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
